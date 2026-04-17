const importLocal = require('import-local');

if (importLocal(__filename)) {
  require("npmlog").info("cli", "正在使用 zt-cli 的本地版本");
} else {
  require("../lib/core")(process.argv.slice(2));
}