"use strict";

var yaml = require("yamljs");
const val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {

        var service = {
            apiVersion: "v1",
            kind: "Service",
            metadata: {
                name: answers.svcName,
                namespace: answers.namespace
            },
            spec: {
                ports: [{
                    port: answers.servicePort,
                    targetPort: answers.containerPort
                }],
                selector: {
                    app: answers.deployName
                }
            }
        };

        var yamlContent = yaml.stringify(service, inline);
        fs.write("svc.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            name: "createSVC",
            type: "list",
            message: "Create Sevice YAML?",
            choices: ["no", "yes"]
        },{
            type: "input",
            name: "svcName",
            message: "Service Name",
            default: "app-svc",
            validate: val.isString,
            when: this.when.createSVC
        },{
            type: "input",
            name: "namespace",
            message: "(Service) In which Namespace should be deployed?",
            default: "default",
            when: this.when.createSVC,
            validate: val.isString
        },{
            name: "containerPort",
            type: "input",
            message: "(Service) In which port is the Container listening?",
            default: 80,
            validate: val.isNumber,
            when: this.when.createSVC,
            filter: val.parseInteger
        }, {
            name: "servicePort",
            type: "input",
            message: "(Service) In which port should the Service listen?",
            default: 80,
            validate: val.isNumber,
            when: this.when.createSVC,
            filter: val.parseInteger
        }];

        return prompts;
    },
    when: {
        createSVC(answers) {
            return answers.createSVC === "yes";
        }
    }
}