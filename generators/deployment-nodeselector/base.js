"use strict";

var yaml = require("yamljs");
var val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var deploymentNodeSel = {
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {
                labels: {
                    name: answers.name
                },
                name: answers.name,
                namespace: answers.namespace
            },
            spec: {
                replicas: answers.replicas,
                selector: {
                    matchLabels: {
                        app: answers.name
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: answers.name
                        }
                    },
                    spec:  {
                        containers: [{
                            name: answers.name,
                            image: answers.image,
                            imagePullPolicy: "IfNotPresent",
                            command: answers.command,
                            args: answers.args,
                            resources: {
                                requests: answers.requests,
                                limits: answers.limits
                            }
                        }],
                        nodeSelector: answers.nodeselector
                    }
                }
            }
        };

        var yamlContent = yaml.stringify(deploymentNodeSel, inline);
        fs.write("deployment.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            type: "input",
            name: "image",
            message: "(Deployment) Which Docker image should the Deployment use?",
            when: this.when,
            validate: val.isString
        },{
            type: "input",
            name: "replicas",
            message: "(Deployment) How much container replicas should be created?",
            default: 1,
            validate: val.isNumber,
            when: this.when,
            filter: val.parseInteger
        },{
            type: "input",
            name: "command",
            message: 'Specify command (in JSON format) if any. Example - ["bash"]',
            default: "[]",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "args",
            message: 'Specify args (in JSON format) if any. Example - ["-c","sleep 100"]',
            default: "[]",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "requests",
            message: 'Specify resource requests (in JSON format) if any. Example - {"cpu":"10m","memory":"500Mi"}',
            default: "{}",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "limits",
            message: 'Specify resource limits (in JSON format) if any. Example - {"cpu":"10m","memory":"500Mi"}',
            default: "{}",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "nodeselector",
            message: 'Specify Node Selector (in JSON format) if any. Example - {"beta.kubernetes.io/arch":"ppc64le"}',
            default: "{}",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        }

    ];

        return prompts;
    },
    when: function (answers) {
        return answers.podControllerType === "Deployment with NodeSelector" || !answers.podControllerType;
    }
}
