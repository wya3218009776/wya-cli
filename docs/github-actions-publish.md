# GitHub 自动发布说明

## 触发方式

项目已经配置了 GitHub Actions 工作流：

- 工作流文件：[publish.yml](file:///d:/桌面/工作/wya-cli/wya-cli-framework/.github/workflows/publish.yml)
- 触发条件：向 GitHub 推送以 `v` 开头的 tag，例如 `v0.1.0`

## 发布前准备

1. 登录 npm 官网，进入 `Access Tokens`
2. 创建一个 `Automation` 类型的 token
3. 打开当前 GitHub 仓库
4. 进入 `Settings -> Secrets and variables -> Actions`
5. 新增一个 Repository Secret
6. 名称填写：`NPM_TOKEN`
7. 值填写：你刚创建的 npm token

## 本地发布流程

1. 在工作区根目录执行测试：

```bash
cd d:\桌面\工作\wya-cli\wya-cli-framework
npm run test:workspaces
```

2. 修改需要发布的 package 版本号

常见文件：

- [package.json](file:///d:/桌面/工作/wya-cli/wya-cli-framework/packages/core/package.json)
- [package.json](file:///d:/桌面/工作/wya-cli/wya-cli-framework/packages/commands/init/package.json)
- [package.json](file:///d:/桌面/工作/wya-cli/wya-cli-framework/packages/commands/template-vue3/package.json)
- [package.json](file:///d:/桌面/工作/wya-cli/wya-cli-framework/packages/commands/template-react/package.json)

3. 提交代码并打 tag：

```bash
git add .
git commit -m "chore: release 0.1.0"
git tag -a v0.1.0 -m "release 0.1.0"
git push origin main
git push origin v0.1.0
```

4. GitHub Actions 会自动执行：

- `npm ci`
- `npm run test:workspaces`
- `npm run publish:ci`

## 自动发布脚本

根目录已新增两个脚本，定义在 [package.json](file:///d:/桌面/工作/wya-cli/wya-cli-framework/package.json)：

```json
{
  "scripts": {
    "test:workspaces": "npm test --workspaces",
    "publish:ci": "lerna publish from-package --yes --registry https://registry.npmjs.org/ --ignore @wya-cli/commands --ignore @wya-cli/models"
  }
}
```

说明：

- `test:workspaces`：执行所有工作区测试
- `publish:ci`：使用 `lerna publish from-package` 发布包
- `publish:ci` 会显式指定官方 npm 源 `https://registry.npmjs.org/`，不会走包内 `publishConfig.registry` 的镜像源
- 当前会忽略 `@wya-cli/commands` 和 `@wya-cli/models` 这两个聚合占位包，避免把它们误发到 npm

## 版本策略

当前使用 `lerna publish from-package`，这意味着：

- 你需要先手动修改每个包的 `version`
- 只有 npm 上还不存在的版本才会被真正发布
- 如果版本号没改，CI 不会发布新包

## 推荐发布顺序

如果你先手动本地试发布，建议顺序如下：

1. `@wya-cli/log`
2. `@wya-cli/utils`
3. `@wya-cli/command`
4. `@wya-cli/package`
5. `@wya-cli/template-vue3`
6. `@wya-cli/template-react`
7. `@wya-cli/init`
8. `@wya-cli/core`

## 模板选择方式

脚手架发布后，用户可以通过两种方式选择模板：

1. 交互选择：

```bash
wya-cli init my-app
```

2. 命令行指定：

```bash
wya-cli init my-vue-app --template vue3
wya-cli init my-react-app --template react
```

模板配置文件在 [template.js](file:///d:/桌面/工作/wya-cli/wya-cli-framework/packages/commands/init/lib/template.js)。
