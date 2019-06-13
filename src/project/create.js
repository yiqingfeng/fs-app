#!/usr/bin/env node
const fs = require("fs");
const inquirer = require("inquirer");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const symbols = require("log-symbols");
const handlebars = require("handlebars");
const shell = require("shelljs");
const { exec } = require("child_process");

const downloadUrl = "github:Gavin-js/vue-sample#master";

/**
 * 检测是否已存在目录
 * @param {String} fileName
 */
function checkFileIsExists(fileName) {
  return new Promise((resolve, reject) => {
    if (fileName && fs.existsSync(fileName)) {
      shell.echo("\n");
      inquirer
        .prompt([
          {
            type: "confirm",
            name: "isExists",
            message: "项目已存在是否覆盖?"
          }
        ])
        .then(({ isExists }) => {
          if (isExists) {
            shell.rm("-rf", fileName);
            resolve();
          } else {
            reject(`${fileName} 已取消`);
          }
        });
      return;
    }
    resolve();
  });
}

/**
 * 下载samples
 * @param {Object} args
 */
function downloadTpl(args) {
  return new Promise((resolve, reject) => {
    const spinner = ora(
      `Download:https://github.com/Gavin-js/vue-sample.git`
    ).start();
    download(
      downloadUrl,
      args.fileName,
      {
        clone: true
      },
      err => {
        if (err) {
          spinner.fail();
          reject(err);
          return;
        }
        spinner.succeed();
        resolve(args);
      }
    );
  });
}

/**
 * 生成 package.json文件
 */
function createPackageJson(result) {
  return new Promise((resolve, reject) => {
    const fileName = `${result.fileName}/package.json`;
    if (fs.existsSync(fileName)) {
      const template = fs.readFileSync(fileName).toString();
      const content = handlebars.compile(template)({
        name: result.name,
        description: result.description,
        version: result.version
      });
      fs.writeFile(fileName, content, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    }
  });
}

function installProjectDep(result) {
  return new Promise((resolve, reject) => {
    const spinner = ora(`正在安装项目依赖...`).start();
    const command = shell.which("cnpm")
    ? "cnpm"
    : shell.which("yarn")
      ? "yarn"
      :  "npm";
    shell.exec(
      `cd ${result.fileName} && ${command} install`,
      { silent: true },
      function(code, stdout, stderr) {
        if (code == 0) {
          spinner.succeed();
          resolve(result);
        } else {
          spinner.fail();
          reject(stderr);
        }
      }
    );
  });
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
      shell.echo("\n");
      console.log(
        symbols.success,
        `${chalk.green(`恭喜您，${result.fileName} 创建成功`)}\n`
      );
    })
    .catch(err => {
      console.log(symbols.error, chalk.red(err));
    });
}

module.exports = create;
