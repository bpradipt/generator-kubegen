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
                namespace: answers.jnamespace
            },
            spec:{
                template: {
                    metadata: {
                        name: answers.jobName
                    },
                    spec:  {
                        containers: [{
                            name: answers.jobName,
                            image: answers.jimage,
                            imagePullPolicy: "IfNotPresent"
                            
                        }],
                        restartPolicy: "Never"
                    }
                },
                backoffLimit: 4
            }
        };

        if (answers.jusePVC) {
            job.spec.template.spec.volumes = [{
                name: answers.jvolumeName,
                persistentVolumeClaim: {
                    claimName: answers.jpvcName
                }
            }];
            job.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.jmountPath,
                name: answers.jvolumeName
            }];
        }

        if (answers.jresourceLimits) {
            job.spec.template.spec.containers[0].resources = {
                    requests: answers.jrequests,
                    limits: answers.jlimits                
            };
        }

        if (answers.jneedCommand) {
            job.spec.template.spec.containers[0].command = answers.jcommand;
            job.spec.template.spec.containers[0].args = answers.jargs;                            
        }

        if (answers.juseNodeSelector) {
            job.spec.template.spec.nodeSelector = answers.jnodeselector;
        }

        var yamlContent = yaml.stringify(job, inline);
        fs.write("job.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            name: "createJob",
            type: "list",
            message: "Create Job YAML?",
            choices: ["no", "yes"]
        },{
            type: "input",
            name: "jobName",
            message: "(Job) Name",
            default: "app-job",
            validate: val.isString,
            when: this.when.createJob
        },{
            type: "input",
            name: "jnamespace",
            message: "(Job)In which Namespace should be deployed?",
            default: "default",
            when: this.when.createJob,
            validate: val.isString
        },{
            type: "input",
            name: "jimage",
            message: "(Job) Which Docker image to use?",
            when: this.when.createJob,
            validate: val.isString
        },{
            name: "jneedCommand",
            type: "list",
            message: "(Job) Want to specify Command and Args?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "jcommand",
            message: '(Job) Specify command in JSON format. Example - ["bash"]',
            default: "[]",
            when: this.when.jneedCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "jargs",
            message: '(Job) Specify args in JSON format. Example - ["-c","sleep 100"]',
            default: "[]",
            when: this.when.jneedCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "jresourceLimits",
            type: "list",
            message: "(Job) Want to specify resource requests & limits?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "jrequests",
            message: '(Job) Specify resource requests in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.jresourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "jlimits",
            message: '(Job) Specify resource limits in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.createJob && this.when.jresourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "jusePVC",
            type: "list",
            message: "(Job) Want to use Persistent Volume Claims?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            name: "jscName",
            type: "input",
            message: "(Job) Storage Class Name",
            validate: val.isString,
            when: this.when.jusePVC
        },{
            name: "jpvcName",
            type: "input",
            message: "(Job) Persistent Volume Claim Name. Example - pv-claim",
            validate: val.isString,
            when: this.when.jusePVC
        },{
            type: "input",
            name: "jvolumeName",
            message: '(Job) Specify Volume Name. Example - pv-storage',
            default: "",
            when: this.when.jusePVC,
            validate: val.isString
        },{
            name: "jaccessModes",
            type: "input",
            message: "(Job) Access Modes. Example - ReadWriteOnce",
            default: "ReadWriteOnce",
            validate: val.isString,
            when: this.when.jusePVC
        },{
            name: "jstorageSize",
            type: "input",
            message: "(Job) Specify storage size. Example - 2Gi",
            default: "1Gi",
            validate: val.isString,
            when: this.when.jusePVC
        },{
            type: "input",
            name: "jmountPath",
            message: '(Job) Specify mount path. Example - /usr/share/nginx/html',
            default: "/",
            when: this.when.jusePVC,
            validate: val.isString
        },{
            name: "juseNodeSelector",
            type: "list",
            message: "(Job) Want to use Node Selector?",
            when: this.when.createJob,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "jnodeselector",
            message: '(Job) Specify Node Selector in JSON format. Example - {"beta.kubernetes.io/arch":"ppc64le"}',
            default: "{}",
            when: this.when.juseNodeSelector,
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
        jusePVC(answers) {
            return answers.jusePVC === "yes";
        },
        juseNodeSelector(answers) {
            return answers.juseNodeSelector === "yes";
        },
        jneedCommand(answers) {
            return answers.jneedCommand === "yes";
        },
        jresourceLimits(answers) {
            return answers.jresourceLimits === "yes";
        }
    }
}
