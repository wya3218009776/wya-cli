'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const userHome = require('user-home');
const { glob } = require('glob');
const ejs = require('ejs');
const semver = require('semver');
const Command = require('@wya-cli/command');
const log = require('@wya-cli/log');
const Package = require('@wya-cli/package');
const { execCommand } = require('@wya-cli/utils');
const TEMPLATE_LIST = require('./template');

class InitCommand extends Command {
  initArgs() {
    this.projectName = this._argv[0] || '';
    this.options = this._argv[1] || {};
    this.force = !!this.options.force;
    this.targetPath = this.getProjectTargetPath(this.projectName);
  }

  async exec() {
    const projectInfo = await this.prepare();
    if (!projectInfo) {
      return;
    }
    this.projectInfo = projectInfo;
    await this.downloadTemplate();
    await this.installTemplate();
  }

  getProjectTargetPath(projectName) {
    if (!projectName) {
      return process.cwd();
    }
    return path.resolve(process.cwd(), projectName);
  }

  isPathEmpty(localPath) {
    if (!fse.existsSync(localPath)) {
      return true;
    }
    let fileList = fs.readdirSync(localPath);
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && !['node_modules'].includes(file),
    );
    return fileList.length === 0;
  }

  async prepare() {
    const localPath = this.targetPath;

    if (!this.isPathEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'ifContinue',
            message: '当前目录不为空，是否继续？',
            default: false,
          },
        ]);
        ifContinue = answer.ifContinue;
        if (!ifContinue) {
          return false;
        }
      }

      if (ifContinue || this.force) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            default: false,
            message: '是否确认清空当前目录下的文件？(极其危险)',
          },
        ]);
        if (!answer.confirmDelete) {
          return false;
        }
        fse.emptyDirSync(localPath);
      }
    } else {
      fse.ensureDirSync(localPath);
    }

    return this.getProjectInfo();
  }

  async getTemplateList() {
    return TEMPLATE_LIST;
  }

  isValidProjectName(projectName) {
    return /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
      projectName,
    );
  }

  selectTemplateInfo(templateList, templateValue) {
    return templateList.find(
      (item) => item.value === templateValue || item.npmName === templateValue,
    );
  }

  async getProjectInfo() {
    const templateList = await this.getTemplateList();
    const promptList = [];

    if (!this.projectName) {
      promptList.push({
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称',
        default: 'my-project',
        validate: (value) =>
          this.isValidProjectName(value) || '项目名称不合法，请重新输入',
      });
    }

    if (!this.options.projectVersion) {
      promptList.push({
        type: 'input',
        name: 'projectVersion',
        message: '请输入项目版本号',
        default: '1.0.0',
        validate: (value) =>
          !!semver.valid(value) || '版本号必须符合 semver 规范，例如 1.0.0',
      });
    }

    if (!this.options.template) {
      promptList.push({
        type: 'list',
        name: 'projectTemplate',
        message: '请选择项目模板',
        choices: templateList.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      });
    }

    const answers = promptList.length ? await inquirer.prompt(promptList) : {};
    const projectName = this.projectName || answers.projectName;
    const projectVersion = this.options.projectVersion || answers.projectVersion;
    const projectTemplate = this.options.template || answers.projectTemplate;
    const installDependencies =
      typeof this.options.install === 'boolean'
        ? this.options.install
        : true;
    const startProject =
      typeof this.options.start === 'boolean'
        ? this.options.start
        : false;
    const templateInfo = this.selectTemplateInfo(templateList, projectTemplate);

    if (!templateInfo) {
      throw new Error(`未找到可用模板: ${projectTemplate}`);
    }

    if (!this.isValidProjectName(projectName)) {
      throw new Error(`项目名称不合法: ${projectName}`);
    }

    if (!semver.valid(projectVersion)) {
      throw new Error(`项目版本号不合法: ${projectVersion}`);
    }

    this.projectName = projectName;
    this.targetPath = this.getProjectTargetPath(projectName);

    return {
      projectName,
      projectVersion,
      projectTemplate: templateInfo.value,
      installDependencies: startProject ? true : installDependencies,
      startProject,
      targetPath: this.targetPath,
      templateInfo,
    };
  }

  async downloadTemplate() {
    const { templateInfo } = this.projectInfo;
    const targetPath = path.resolve(userHome, '.wya-cli', 'template');

    this.templatePkg = new Package({
      targetPath,
      packageName: templateInfo.npmName,
      packageVersion: templateInfo.version,
    });

    if (this.templatePkg.localPackageRootPath) {
      log.info('init', `使用本地模板: ${templateInfo.npmName}`);
      return;
    }

    if (!this.templatePkg.exists()) {
      const spinner = ora('正在下载模板...').start();
      try {
        await this.templatePkg.install();
        spinner.succeed('模板下载成功');
      } catch (error) {
        spinner.fail('模板下载失败');
        throw error;
      }
    } else {
      log.info('init', '模板已存在，跳过下载');
    }
  }

  async ejsRender(options = {}) {
    const dir = this.projectInfo.targetPath;
    const files = await glob('**', {
      cwd: dir,
      nodir: true,
      ignore: options.ignore || [],
    });

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);
        const content = await ejs.renderFile(filePath, this.projectInfo, {});
        fse.writeFileSync(filePath, content);
      }),
    );
  }

  async installTemplate() {
    const templatePath = path.resolve(
      this.templatePkg.packageRootPath,
      'template',
    );
    const targetPath = this.projectInfo.targetPath;

    if (!fse.existsSync(templatePath)) {
      log.warn('init', `模板目录不存在: ${templatePath}`);
      return;
    }

    fse.ensureDirSync(targetPath);
    fse.copySync(templatePath, targetPath);

    await this.ejsRender({
      ignore: this.projectInfo.templateInfo.ignore || ['node_modules/**'],
    });

    if (this.projectInfo.installDependencies) {
      log.info('init', '正在安装依赖...');
      await execCommand(
        this.projectInfo.templateInfo.installCommand || 'npm install',
        targetPath,
      );
    }

    if (this.projectInfo.startProject) {
      log.info('init', '正在启动项目...');
      await execCommand(
        this.projectInfo.templateInfo.startCommand || 'npm start',
        targetPath,
      );
    }

    log.success(
      'init',
      `项目创建完成: ${path.relative(process.cwd(), targetPath) || '.'}`,
    );
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
