#!/usr/bin/env node
const fs = require("fs-extra");
const util = require("util");
const inquirer = require("inquirer");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const symbols = require("log-symbols");
const handlebars = require("handlebars");
const shell = require("shelljs");

const writeFile = util.promisify(fs.writeFile);
const Download = util.promisify(download);

const downloadUrl = "github:Gavin-js/vue-sample#master";
const downloadRegistry = "Download:https://github.com/Gavin-js/vue-sample.git";

/**
 * 检测是否已存在目录
 * @param {String} targetDir
 */
async function checkFileIsExists(targetDir) {
  if (!targetDir) return;
  console.log("\n");
  const { ok } = await inquirer.prompt([
    {
      name: "ok",
      type: "confirm",
      message: `是否在当前目录创建项目？`
    }
  ]);
  if (!ok) {
    return;
  }
  if (fs.existsSync(targetDir)) {
    const { isExists } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isExists",
        message: "项目已存在是否覆盖?"
      }
    ]);
    if (isExists) {
      console.log(`删除 ${chalk.cyan(targetDir)}...`);
      // shell.rm("-rf", targetDir);
      await fs.remove(targetDir);
    }
  }
}

/**
 * 下载samples
 * @param {Object} args
 */
async function downloadTpl(args) {
  const spinner = ora(downloadRegistry).start();
  const err = await Download(downloadUrl, args.fileName, {
    clone: true
  });
  if (!err) {
    spinner.succeed();
  } else {
    spinner.fail();
  }
  return args;
}

/**
 * 生成 package.json文件
 */
async function createPackageJson(result) {
  const fileName = `${result.fileName}/package.json`;
  if (fs.existsSync(fileName)) {
    const template = fs.readFileSync(fileName).toString();
    const content = handlebars.compile(template)({
      name: result.name,
      description: result.description,
      version: result.version
    });
    const err = await writeFile(fileName, content);
    if (err) {
      return;
    }
  }

  return result;
}

async function installProjectDep(result) {
  const spinner = ora(`正在安装项目依赖...`).start();
  const command = shell.which("cnpm")
    ? "cnpm"
    : shell.which("yarn")
    ? "yarn"
    : "npm";
  const { code, stderr } = await shell.exec(
    `cd ${result.fileName} && ${command} install`,
    { silent: true }
  );
  if (code == 0) {
    spinner.succeed();
  } else {
    spinner.fail();
    console.log(symbols.error, chalk.red(stderr));
  }
  return result;
}
/**
 * 创建项目
 * @param {String} fileName 目录名称
 */
function create(fileName) {
  checkFileIsExists(fileName)
    .then(() =>
      inquirer.prompt([
        {
          name: "name",
          message: "项目名称",
          default: fileName
        },
        {
          name: "description",
          message: "项目描述",
          default: `A ${fileName} project`
        },
        {
          name: "version",
          message: "版本号",
          default: `1.0.0`
        }
      ])
    )
    .then(answers => ({
      ...answers,
      fileName
    }))
    .then(downloadTpl)
    .then(createPackageJson)
    .then(installProjectDep)
    .then(result => {
      console.log(
        "\n",
        symbols.success,
        `${chalk.green(`恭喜您，${result.fileName} 创建成功`)}\n`
      );
    })
    .catch(err => {
      console.log(symbols.error, chalk.red(err));
    });
}

module.exports = create;
