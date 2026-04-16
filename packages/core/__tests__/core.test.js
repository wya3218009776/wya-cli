const core = require('../lib/core');
const log = require('@wya-cli/log');
const initCommand = require('@wya-cli/init');
const path = require('path');
const pathExists = require('path-exists');

jest.mock('@wya-cli/log', () => ({
  success: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  level: 'info',
}));

jest.mock('@wya-cli/init', () => jest.fn());

describe('@wya-cli/core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    log.level = 'info';
    process.env.LOG_LEVEL = '';
  });

  describe('环境准备测试', () => {
    it('1. 测试包版本检查 (checkPkgVersion)', () => {
      core([]);
      const pkg = require('../package.json');
      expect(log.success).toHaveBeenCalledWith('CLI 版本号:', pkg.version);
    });

    it('2. 测试 Node 版本检查 (checkNodeVersion) - 低版本拦截', () => {
      const semver = require('semver');
      const originalGte = semver.gte;
      semver.gte = jest.fn().mockReturnValue(false);

      core([]);

      expect(log.error).toHaveBeenCalledWith(
        expect.stringMatching(/wya-cli 需要安装 Node\.js/),
      );
      semver.gte = originalGte;
    });

    it('3. 测试用户主目录检查 (checkUserHome)', () => {
      const userHome = require('user-home');
      expect(userHome).toBeDefined();
      expect(pathExists.sync(userHome)).toBe(true);
    });

    it('4. 测试入参解析与环境变量设置 (checkInputArgs) - debug 模式', () => {
      core(['--debug']);
      expect(process.env.LOG_LEVEL).toBe('debug');
      expect(log.level).toBe('debug');
    });

    it('5. 测试环境变量文件加载 (checkEnv)', () => {
      core([]);
      const envPath = path.resolve(__dirname, '../../../.env');

      if (pathExists.sync(envPath)) {
        expect(log.verbose).toHaveBeenCalledWith(
          expect.stringContaining('环境变量已加载:'),
          expect.anything(),
        );
      } else {
        expect(log.verbose).toHaveBeenCalledWith('环境变量文件不存在');
      }
    });

    it('6. 测试 init 命令注册与执行', () => {
      core(['init', 'demo-app', '--force']);
      expect(initCommand).toHaveBeenCalledWith([
        'demo-app',
        expect.objectContaining({ force: true }),
      ]);
    });
  });
});
