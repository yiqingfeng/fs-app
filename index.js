#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const {
    version,
} = require('./package.json');

program.version(version, '-v, --version')
    .command('init <name>')
    .action(name => {
        if(fs.existsSync(name)){
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red(`${name}项目已存在`));
            return;
        }
        inquirer.prompt([{
                name: 'projectName',
                message: '请输入项目名称'
            },
        ]).then(answers => {
            const spinner = ora('正在下载模板...');
            spinner.start();
            download('xxxxx#master', name, {
                clone: true
            }, err => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err));
                    return;
                }
                spinner.succeed();
                const fileName = `${name}/package.json`;
                const meta = {
                    name,
                    projectName: answers.projectName,
                };
                if(fs.existsSync(fileName)){
                    const content = fs.readFileSync(fileName).toString();
                    const result = handlebars.compile(content)(meta);
                    fs.writeFileSync(fileName, result);
                }
                console.log(symbols.success, chalk.green(`${name}项目初始化完成`));
            });
        });
    });
program.parse(process.argv);