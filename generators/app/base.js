"use strict";

const fs = require("fs");
const semver = require('semver');
const val = require("../validations.js");

module.exports = {
    initializing(generator) {
        if (semver.lt(semver.clean(process.version),'8.11.1')) {
            generator.log("Node version " + semver.clean(process.version));
            generator.log("Need atleast Node version 8.11.1");
            process.exit(1);
        }

        if (! ['linux','darwin'].includes(process.platform.trim())) {
            generator.log("Supported/Tested on only darwin and linux platforms");
            process.exit(1);
        }
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
    },
    
    spawnKubevalCommand(generator, folder, k8sVer) {
        var files = fs.readdirSync(folder);
        console.log("YAMLs to validate: %s", files);
        for (var i=0; i < files.length; i++) {
            console.log("file: %s", files[i]);
            generator.spawnCommandSync("kubeval",["-v", k8sVer, files[i]]);
        }
    }

};