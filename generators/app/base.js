"use strict";

const fs = require("fs");
const val = require("../validations.js");

module.exports = {

    initializing(generator) {
        generator.log(" ");
        generator.log(" |  |/  / |  |  |  | |   _  \\  |   ____| /  _____||   ____||  \\ |  | ");
        generator.log(" |  '  /  |  |  |  | |  |_)  | |  |__   |  |  __  |  |__   |   \\|  | ");
        generator.log(" |    <   |  |  |  | |   _  <  |   __|  |  | |_ | |   __|  |  . `  | ");
        generator.log(" |  .  \\  |  `--'  | |  |_)  | |  |____ |  |__| | |  |____ |  |\\   | ");
        generator.log(" |__|\\__\\  \\______/  |______/  |_______| \\______| |_______||__| \\__| ");
        generator.log(" ");
        generator.log("Welcome to Kubernetes Generator (kubegen)!. Generate Deployment/Job/Service/PVC/Ingress YAMLs");
        generator.log("Validate the generated YAML schema using kubeval - https://github.com/garethr/kubeval\n\n");
    },

    getPrompts() {
        var prompts = [{
            type: "input",
            name: "dirName",
            message: "Directory to store the YAML?",
            default: "app-demo",
            validate: val.isString
        }];

        return prompts;
    },

    spawnKubectlCommand(generator, fileOrFolder, command) {
        generator.spawnCommandSync("kubectl",[command, "-f", fileOrFolder]);
    }
};