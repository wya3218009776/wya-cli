'use strict';

const cp = require('child_process');

function execCommand(commandStr, targetPath) {
  const cmdArray = commandStr.split(' ').filter(Boolean);
  const cmd = cmdArray[0];
  const args = cmdArray.slice(1);

  return new Promise((resolve, reject) => {
    const finalCmd = process.platform === 'win32' ? 'cmd' : cmd;
    const finalArgs =
      process.platform === 'win32' ? ['/c', cmd, ...args] : args;

    const child = cp.spawn(finalCmd, finalArgs, {
      cwd: targetPath || process.cwd(),
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败: ${commandStr}`));
      }
    });
  });
}

module.exports = {
  execCommand,
};
