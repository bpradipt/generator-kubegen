"use strict";

var yaml = require("yamljs");
var val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var deploymentAll = {
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {
                labels: {
                    name: answers.deployName
                },
                name: answers.deployName,
                namespace: answers.namespace
            },
            spec: {
                replicas: answers.replicas,
                selector: {
                    matchLabels: {
                        app: answers.deployName
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: answers.deployName
                        }
                    },
                    spec:  {
                        containers: [{
                            name: answers.deployName,
                            image: answers.image,
                            imagePullPolicy: "IfNotPresent"
                            
                        }]
                    }
                }
            }
        };

        if (answers.usePVC) {
            deploymentAll.spec.template.spec.volumes = [{
                name: answers.volumeName,
                persistentVolumeClaim: {
                    claimName: answers.pvcName
                }
            }];
            deploymentAll.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.mountPath,
                name: answers.volumeName
            }];
        }

        if (answers.useHostPath) {
            deploymentAll.spec.template.spec.volumes = [{
                name: answers.volumeName,
                hostPath: {
                    path: answers.hpLocation,
                    type: answers.hpType
                }
            }];
            deploymentAll.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.mountPath,
                name: answers.volumeName
            }];
        }

        if (answers.resourceLimits) {
            deploymentAll.spec.template.spec.containers[0].resources = {
                    requests: answers.requests,
                    limits: answers.limits                
            };
        }

        if (answers.needCommand) {
            deploymentAll.spec.template.spec.containers[0].command = answers.command;
            deploymentAll.spec.template.spec.containers[0].args = answers.args;                            
        }

        if (answers.useNodeSelector) {
            deploymentAll.spec.template.spec.nodeSelector = answers.nodeselector;
        }

        var yamlContent = yaml.stringify(deploymentAll, inline);
        fs.write("deployment.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            name: "createDeploy",
            type: "list",
            message: "Create Deployment YAML?",
            choices: ["yes", "no"]
        },{
            type: "input",
            name: "deployName",
            message: "(Deployment) Name",
            default: "app-deploy",
            validate: val.isString,
            when: this.when.createDeploy
        },{
            type: "input",
            name: "namespace",
            message: "(Deployment)In which Namespace should be deployed?",
            default: "default",
            when: this.when.createDeploy,
            validate: val.isString
        },{
            type: "input",
            name: "image",
            message: "(Deployment) Which Docker image to use?",
            when: this.when.createDeploy,
            validate: val.isString
        },{
            type: "input",
            name: "replicas",
            message: "(Deployment) How much container replicas should be created?",
            default: 1,
            validate: val.isNumber,
            when: this.when.createDeploy,
            filter: val.parseInteger
        },{
            name: "needCommand",
            type: "list",
            message: "(Deployment) Want to specify Command and Args?",
            when: this.when.createDeploy,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "command",
            message: '(Deployment) Specify command in JSON format. Example - ["bash"]',
            default: "[]",
            when: this.when.needCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "args",
            message: '(Deployment) Specify args in JSON format. Example - ["-c","sleep 100"]',
            default: "[]",
            when: this.when.needCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "resourceLimits",
            type: "list",
            message: "(Deployment) Want to specify resource requests & limits?",
            when: this.when.createDeploy,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "requests",
            message: '(Deployment) Specify resource requests in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.resourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "limits",
            message: '(Deployment) Specify resource limits in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.resourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "usePVC",
            type: "list",
            message: "(Deployment) Want to use Persistent Volume Claims?",
            when: this.when.createDeploy,
            choices: ["no","yes"]
        },{
            name: "scName",
            type: "input",
            message: "(Deployment) Storage Class Name",
            validate: val.isString,
            when: this.when.usePVC
        },{
            name: "pvcName",
            type: "input",
            message: "(Deployment) Persistent Volume Claim Name. Example - pv-claim",
            validate: val.isString,
            when: this.when.usePVC
        },{
            type: "input",
            name: "volumeName",
            message: '(Deployment) Specify Volume Name. Example - pv-storage',
            default: "",
            when: this.when.usePVC,
            validate: val.isString
        },{
            name: "accessModes",
            type: "input",
            message: "(Deployment) Access Modes. Example - ReadWriteOnce",
            default: "ReadWriteOnce",
            validate: val.isString,
            when: this.when.usePVC
        },{
            name: "storageSize",
            type: "input",
            message: "(Deployment) Specify storage size. Example - 2Gi",
            default: "1Gi",
            validate: val.isString,
            when: this.when.usePVC
        },{
            type: "input",
            name: "mountPath",
            message: '(Deployment) Specify mount path. Example - /usr/share/nginx/html',
            default: "/",
            when: this.when.usePVC,
            validate: val.isString
        },{
            name: "useHostPath",
            type: "list",
            message: "(Deployment) Want to use HostPath?",
            when: this.when.createDeploy,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "volumeName",
            message: '(Deployment) Specify Volume Name. Example - host-volume',
            default: "host-volume",
            when: this.when.useHostPath,
            validate: val.isString
        },{
            name: "hpLocation",
            type: "input",
            message: "(Deployment) Host Path",
            default: "/tmp/something",
            validate: val.isString,
            when: this.when.useHostPath
        },{
            name: "hpType",
            type: "input",
            message: "(Deployment) Type of Host Path [DirectoryOrCreate, Directory, FileOrCreate, File etc]",
            default: "File",
            validate: val.isString,
            when: this.when.useHostPath
        },{
            type: "input",
            name: "mountPath",
            message: '(Deployment) Specify mount path. Example - /usr/share/nginx/html',
            default: "/tmp/something",
            when: this.when.useHostPath,
            validate: val.isString
        },{
            type: "input",
            name: "nodeselector",
            message: '(Deployment) Specify Node Selector in JSON format. Example - {"beta.kubernetes.io/arch":"ppc64le"}',
            default: "{}",
            when: this.when.useNodeSelector,
            validate: val.isString,
            filter: val.parseCommand
        }

    ];

        return prompts;
    },
    when: {
        createDeploy(answers) {
            return answers.createDeploy === "yes";
        },
        usePVC(answers) {
            return answers.usePVC === "yes";
        },
        useNodeSelector(answers) {
            return answers.useNodeSelector === "yes";
        },
        needCommand(answers) {
            return answers.needCommand === "yes";
        },
        resourceLimits(answers) {
            return answers.resourceLimits === "yes";
        },
        useHostPath(answers) {
            return answers.useHostPath === "yes";
        }
    }
}
