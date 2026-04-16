'use strict';

module.exports = [
  {
    name: 'Vue3 标准模板',
    npmName: '@wya-cli/template-vue3',
    value: 'vue3',
    version: 'latest',
    installCommand: 'npm install',
    startCommand: 'npm run dev',
    ignore: ['node_modules/**'],
  },
  {
    name: 'React 标准模板',
    npmName: '@wya-cli/template-react',
    value: 'react',
    version: 'latest',
    installCommand: 'npm install',
    startCommand: 'npm run dev',
    ignore: ['node_modules/**'],
  },
];
