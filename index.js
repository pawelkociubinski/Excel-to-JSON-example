#!/usr/bin/env node
const fs = require("fs");
const app = require("commander");
const inquirer = require("inquirer");
const { generateJSON } = require("./excel-to-json");

app.version("1.1.0");

// Generete the JSON from an Excel file
app
  .command("generate")
  .description("Create JSON file based on Excel.")
  .action(() => {
    const files = fs.readdirSync(process.cwd());
    const excelFiles = files.filter((f) => f.includes(".xlsx"));

    const questions = [
      {
        type: "list",
        name: "originalFile",
        message:
          "Choose an Excel file based on which the JSON file will be created.",
        choices: excelFiles,
      },
    ];
    inquirer.prompt(questions).then((question) => {
      return generateJSON(question.originalFile);
    });
  });

app.parse(process.argv);
