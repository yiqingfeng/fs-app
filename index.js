#!/usr/bin/env node
const program = require("commander");
const Project = require("./src/project");

const { version } = require("./package.json");

program
  .version(version, "-v, --version")
  .command("init <name>")
  .action(Project.create);
program.parse(process.argv);
