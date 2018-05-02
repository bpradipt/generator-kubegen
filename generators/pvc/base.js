"use strict";

var yaml = require("yamljs");
const val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var pvc = {
            apiVersion: "v1",
            kind: "PersistentVolumeClaim",
            metadata: {
                name: answers.pvcName
            },
            spec: {
                storageClassName: answers.scName,
                accessModes:[ answers.accessModes ],
                resources: {
                    requests: {
                        storage: answers.storageSize
                    }
                }
            }
        };

        var yamlContent = yaml.stringify(pvc, inline);
        fs.write("pvc.yml", yamlContent);
    },
    getPrompts: function () {

        var prompts = [{
            name: "createPVC",
            type: "list",
            message: "Create Persistent Volume Claim YAML?",
            choices: ["no", "yes"]
        },{
            name: "scName",
            type: "input",
            message: "(PVC) Storage Class Name",
            validate: val.isString,
            when: this.when.createPVC
        },{
            name: "pvcName",
            type: "input",
            message: "(PVC) Persistent Volume Claim Name",
            validate: val.isString,
            when: this.when.createPVC
        },{
            name: "accessModes",
            type: "input",
            message: "(PVC) Access Modes to use",
            default: "ReadWriteOnce",
            validate: val.isString,
            when: this.when.createPVC
        },{
            name: "storageSize",
            type: "input",
            message: "(PVC) Specify storage size",
            default: "1Gi",
            validate: val.isString,
            when: this.when.createPVC
        }];

        return prompts;
    },
    when: {
        createPVC(answers) {
            return answers.createPVC === "yes";
        }
    },
}