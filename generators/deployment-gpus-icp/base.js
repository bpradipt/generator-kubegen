"use strict";

var yaml = require("yamljs");
var val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var deploymentGpuICP = {
            apiVersion: "extensions/v1beta1",
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
                        }]
                    }
                }
            }
        };

        var yamlContent = yaml.stringify(deploymentGpuICP, inline);
        fs.write("deployment.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            type: "input",
            name: "image",
            message: "(Deployment) Which Docker image should the Deployment use?",
            default: "nvidia/cuda:8.0-runtime",
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
            message: 'Specify args (in JSON format) if any. Example - ["-c","nvidia-smi && tail -f /dev/null"]',
            default: "[]",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "requests",
            message: 'Specify resource requests (in JSON format) if any. Example - {"cpu":"10m","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "limits",
            message: 'Specify resource limits (in JSON format) if any. Example - {"cpu":"10m","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when,
            validate: val.isString,
            filter: val.parseCommand
        }

    ];

        return prompts;
    },
    when: function (answers) {
        return answers.podControllerType === "GPU Deployment for IBM Cloud Private" || !answers.podControllerType;
    }
}
