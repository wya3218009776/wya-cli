'use strict';

const pkg = require('../package.json');
const log = require('@wya-cli/log');
const { Command } = require('commander');
const semver = require('semver');
const colors = require('colors');
const constant = require('./const');
const userHome = require('user-home');
const pathExists = require('path-exists');
const minimist = require('minimist');
const path = require('path');

function core(argv = []) {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkUserHome();
    checkInputArgs(argv);
    checkEnv();
    registerCommand(argv);
  } catch (error) {
    log.error(error.message);
  }
}

function createProgram() {
  const program = new Command();
  const cliName = Object.keys(pkg.bin || {})[0] || 'wya-cli';
  program.exitOverride();

  program
    .name(cliName)
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false);

  program
    .command('init [projectName]')
    .description('初始化一个项目')
    .option('-f, --force', '是否强制初始化项目')
    .option('-t, --template <template>', '指定项目模板')
    .option('--project-version <version>', '指定项目版本号')
    .option('--install', '创建后自动安装依赖')
    .option('--start', '安装依赖后自动启动项目')
    .action((projectName, cmdObj) => {
      const initCommand = require('@wya-cli/init');
      const options =
        cmdObj && typeof cmdObj.opts === 'function' ? cmdObj.opts() : cmdObj;
      initCommand([projectName, options || {}]);
    });

  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red(`未知的命令: ${obj[0]}`));
    if (availableCommands.length > 0) {
      console.log(colors.green(`可用命令: ${availableCommands.join(', ')}`));
    }
  });

  return program;
}

function registerCommand(argv = []) {
  const program = createProgram();
  const cliName = Object.keys(pkg.bin || {})[0] || 'wya-cli';
  const inputArgs = Array.isArray(argv) ? argv : [];
  const cliArgv = ['node', cliName, ...inputArgs];

  try {
    program.parse(cliArgv, { from: 'node' });
  } catch (error) {
    if (!error || !String(error.code).startsWith('commander.')) {
      throw error;
    }
  }

  if (!inputArgs.length) {
    console.log(program.helpInformation());
  }
}

function checkEnv() {
  const dotenv = require('dotenv');
  const envPath = path.resolve(__dirname, '../../../.env');
  if (pathExists.sync(envPath)) {
    const config = dotenv.config({ path: envPath });
    log.verbose('环境变量已加载:', config);
  } else {
    log.verbose('环境变量文件不存在');
  }
}

function checkPkgVersion() {
  log.success('CLI 版本号:', pkg.version);
}

function checkInputArgs(argv = []) {
  const args = minimist(Array.isArray(argv) ? argv : []);
  if (args.debug) {
    process.env.LOG_LEVEL = 'debug';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
  log.verbose('debug args', args);
}

function checkUserHome() {
  if (!userHome || !pathExists.sync(userHome)) {
    throw new Error(colors.red(`用户主目录不存在,无法继续执行`));
  }
}

function checkNodeVersion() {
  // 1. 获取当前 Node 的版本
  const currentVersion = process.version;
  // 2. 比对最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`wya-cli 需要安装 Node.js ${lowestVersion} 以上版本，当前 Node 版本 ${currentVersion} 低于最低版本 ${lowestVersion}`));
  }
}

module.exports = core;
