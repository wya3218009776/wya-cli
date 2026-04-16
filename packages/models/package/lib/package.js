'use strict';

const path = require('path');
const fse = require('fs-extra');
const npminstall = require('npminstall');
const pathExists = require('path-exists');

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package 类的 options 参数不能为空！');
    }
    this.targetPath = options.targetPath;
    this.storeDir = options.storeDir;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.localPackageRootPath = this.getLocalPackageRootPath();
  }

  get packageRootPath() {
    if (this.localPackageRootPath) {
      return this.localPackageRootPath;
    }
    return path.resolve(this.targetPath, 'node_modules', this.packageName);
  }

  getLocalPackageRootPath() {
    try {
      const packagePath = require.resolve(`${this.packageName}/package.json`);
      return path.dirname(packagePath);
    } catch (error) {
      return null;
    }
  }

  exists() {
    return pathExists.sync(this.packageRootPath);
  }

  async install() {
    if (this.localPackageRootPath) {
      return;
    }

    fse.ensureDirSync(this.targetPath);
    if (this.storeDir) {
      fse.ensureDirSync(this.storeDir);
    }

    await npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: 'https://registry.npmmirror.com',
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }
}

module.exports = Package;
