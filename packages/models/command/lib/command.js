'use strict';

const log = require('@wya-cli/log');

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    this._argv = argv;
    this._runPromise = this.run();
  }

  async run() {
    try {
      await this.checkNodeVersion();
      await this.initArgs();
      await this.exec();
    } catch (error) {
      log.error('Command', error.message);
      throw error;
    }
  }

  async checkNodeVersion() {
    log.verbose('Command', 'checkNodeVersion');
  }

  async initArgs() {
    throw new Error('initArgs 方法必须由业务子类自己实现！');
  }

  async exec() {
    throw new Error('exec 方法必须由业务子类自己实现！');
  }
}

module.exports = Command;
