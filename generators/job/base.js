"use strict";

var yaml = require("yamljs");
var val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var job = {
            apiVersion: "batch/v1",
            kind: "Job",
            metadata: {
                name: answers.jobName,
                namespace: answers.namespace
            },
            spec:{
                template: {
                    metadata: {
                        name: answers.jobName
                    },
                    spec:  {
                        containers: [{
                            name: answers.jobName,
                            image: answers.image,
                            imagePullPolicy: "IfNotPresent"
                            
                        }],
                        restartPolicy: "Never"
                    }
                },
                backoffLimit: 4
            }
        };

        if (answers.usePVC) {
            job.spec.template.spec.volumes = [{
                name: answers.volumeName,
                persistentVolumeClaim: {
                    claimName: answers.pvcName
                }
            }];
            job.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.mountPath,
                name: answers.volumeName
            }];
        }

        if (answers.resourceLimits) {
            job.spec.template.spec.containers[0].resources = {
                    requests: answers.requests,
                    limits: answers.limits                
            };
        }

        if (answers.needCommand) {
            job.spec.template.spec.containers[0].command = answers.command;
            job.spec.template.spec.containers[0].args = answers.args;                            
        }

        if (answers.useNodeSelector) {
            job.spec.template.spec.nodeSelector = answers.nodeselector;
        }

        var yamlContent = yaml.stringify(job, inline);
        fs.write("job.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            name: "createJob",
            type: "list",
            message: "Create Job YAML?",
            choices: ["yes", "no"]
        },{
            type: "input",
            name: "jobName",
            message: "(Job) Name",
            default: "app-job",
            validate: val.isString,
            when: this.when.createJob
        },{
            type: "input",
            name: "namespace",
            message: "(Job)In which Namespace should be deployed?",
            default: "default",
            when: this.when.createJob,
            validate: val.isString
        },{
            type: "input",
            name: "image",
            message: "(Job) Which Docker image to use?",
            when: this.when.createJob,
            validate: val.isString
        },{
            name: "needCommand",
            type: "list",
            message: "(Job) Want to specify Command and Args?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "command",
            message: '(Job) Specify command in JSON format. Example - ["bash"]',
            default: "[]",
            when: this.when.needCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "args",
            message: '(Job) Specify args in JSON format. Example - ["-c","sleep 100"]',
            default: "[]",
            when: this.when.needCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "resourceLimits",
            type: "list",
            message: "(Job) Want to specify resource requests & limits?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "requests",
            message: '(Job) Specify resource requests in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.resourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "limits",
            message: '(Job) Specify resource limits in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.resourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "usePVC",
            type: "list",
            message: "(Job) Want to use Persistent Volume Claims?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            name: "scName",
            type: "input",
            message: "(Job) Storage Class Name",
            validate: val.isString,
            when: this.when.usePVC
        },{
            name: "pvcName",
            type: "input",
            message: "(Job) Persistent Volume Claim Name. Example - pv-claim",
            validate: val.isString,
            when: this.when.usePVC
        },{
            type: "input",
            name: "volumeName",
            message: '(Job) Specify Volume Name. Example - pv-storage',
            default: "",
            when: this.when.usePVC,
            validate: val.isString
        },{
            name: "accessModes",
            type: "input",
            message: "(Job) Access Modes. Example - ReadWriteOnce",
            default: "ReadWriteOnce",
            validate: val.isString,
            when: this.when.usePVC
        },{
            name: "storageSize",
            type: "input",
            message: "(Job) Specify storage size. Example - 2Gi",
            default: "1Gi",
            validate: val.isString,
            when: this.when.usePVC
        },{
            type: "input",
            name: "mountPath",
            message: '(Job) Specify mount path. Example - /usr/share/nginx/html',
            default: "/",
            when: this.when.usePVC,
            validate: val.isString
        },{
            name: "useNodeSelector",
            type: "list",
            message: "(Job) Want to use Node Selector?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "nodeselector",
            message: '(Job) Specify Node Selector in JSON format. Example - {"beta.kubernetes.io/arch":"ppc64le"}',
            default: "{}",
            when: this.when.useNodeSelector,
            validate: val.isString,
            filter: val.parseCommand
        }

    ];

        return prompts;
    },
    when: {
        createJob(answers) {
            return answers.createJob === "yes";
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
        }
    }
}
