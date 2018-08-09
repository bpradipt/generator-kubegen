"use strict";

var yaml = require("yamljs");
var val = require("../validations.js");

module.exports = {
    write: function (fs, answers, inline = 10) {
        var daemonsetAll = {
            apiVersion: "apps/v1",
            kind: "DaemonSet",
            metadata: {
                labels: {
                    name: answers.daemonsetName
                },
                name: answers.daemonsetName,
                namespace: answers.dsnamespace
            },
            spec: {
                selector: {
                    matchLabels: {
                        app: answers.daemonsetName
                    }
                },
                template: {
                    metadata: {
                        labels: {
                            app: answers.daemonsetName
                        }
                    },
                    spec:  {
                        hostPID: false,
                        hostIPC: false,
                        hostNetwork: false,
                        containers: [{
                            name: answers.daemonsetName,
                            image: answers.dsimage,
                            imagePullPolicy: "IfNotPresent"
                            
                        }]
                    }
                }
            }
        };

        if (answers.dsusePVC) {
            daemonsetAll.spec.template.spec.volumes = [{
                name: answers.dsvolumeName,
                persistentVolumeClaim: {
                    claimName: answers.dspvcName
                }
            }];
            daemonsetAll.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.dsmountPath,
                name: answers.dsvolumeName
            }];
        }

        if (answers.dsuseHostPath) {
            daemonsetAll.spec.template.spec.volumes = [{
                name: answers.dshpVolumeName,
                hostPath: {
                    path: answers.dshpLocation,
                    type: answers.dshpType
                }
            }];
            daemonsetAll.spec.template.spec.containers[0].volumeMounts = [ {
                mountPath: answers.dshpMountPath,
                name: answers.dshpVolumeName
            }];
        }

        if (answers.dsresourceLimits) {
            daemonsetAll.spec.template.spec.containers[0].resources = {
                    requests: answers.dsrequests,
                    limits: answers.dslimits
            };
        }

        if (answers.needCommand) {
            daemonsetAll.spec.template.spec.containers[0].command = answers.dscommand;
            daemonsetAll.spec.template.spec.containers[0].args = answers.dsargs;
        }

        if (answers.useNodeSelector) {
            daemonsetAll.spec.template.spec.nodeSelector = answers.dsnodeselector;
        }

        var yamlContent = yaml.stringify(daemonsetAll, inline);
        fs.write("daemonset.yml", yamlContent);
    },
    getPrompts: function () {
        var prompts = [{
            name: "createDaemonset",
            type: "list",
            message: "Create Daemonset YAML?",
            choices: ["yes", "no"]
        },{
            type: "input",
            name: "daemonsetName",
            message: "(Daemonset) Name",
            default: "app-deploy",
            validate: val.isString,
            when: this.when.createDaemonset
        },{
            type: "input",
            name: "dsnamespace",
            message: "(Daemonset)In which Namespace should be deployed?",
            default: "default",
            when: this.when.createDaemonset,
            validate: val.isString
        },{
            type: "input",
            name: "dsimage",
            message: "(Daemonset) Which Docker image to use?",
            when: this.when.createDaemonset,
            validate: val.isString
        },{
            name: "dsneedCommand",
            type: "list",
            message: "(Daemonset) Want to specify Command and Args?",
            when: this.when.createDaemonset,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "dscommand",
            message: '(Daemonset) Specify command in JSON format. Example - ["bash"]',
            default: "[]",
            when: this.when.dsneedCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "dsargs",
            message: '(Daemonset) Specify args in JSON format. Example - ["-c","sleep 100"]',
            default: "[]",
            when: this.when.dsneedCommand,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "dsresourceLimits",
            type: "list",
            message: "(Daemonset) Want to specify resource requests & limits?",
            when: this.when.createDaemonset,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "dsrequests",
            message: '(Daemonset) Specify resource requests in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.dsresourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            type: "input",
            name: "dslimits",
            message: '(Daemonset) Specify resource limits in JSON format. Example - {"cpu":"10m","memory":"500Mi","alpha.kubernetes.io/nvidia-gpu": 1}',
            default: "{}",
            when: this.when.dsresourceLimits,
            validate: val.isString,
            filter: val.parseCommand
        },{
            name: "dsusePVC",
            type: "list",
            message: "(Daemonset) Want to use Persistent Volume Claims?",
            when: this.when.createDaemonset,
            choices: ["no","yes"]
        },{
            name: "dsscName",
            type: "input",
            message: "(Daemonset) Storage Class Name",
            validate: val.isString,
            when: this.when.dsusePVC
        },{
            name: "dspvcName",
            type: "input",
            message: "(Daemonset) Persistent Volume Claim Name. Example - pv-claim",
            validate: val.isString,
            when: this.when.dsusePVC
        },{
            type: "input",
            name: "dsvolumeName",
            message: '(Daemonset) Specify Volume Name. Example - pv-storage',
            default: "",
            when: this.when.dsusePVC,
            validate: val.isString
        },{
            name: "dsaccessModes",
            type: "input",
            message: "(Daemonset) Access Modes. Example - ReadWriteOnce",
            default: "ReadWriteOnce",
            validate: val.isString,
            when: this.when.dsusePVC
        },{
            name: "dsstorageSize",
            type: "input",
            message: "(Daemonset) Specify storage size. Example - 2Gi",
            default: "1Gi",
            validate: val.isString,
            when: this.when.dsusePVC
        },{
            type: "input",
            name: "dsmountPath",
            message: '(Daemonset) Specify mount path. Example - /usr/share/nginx/html',
            default: "/",
            when: this.when.dsusePVC,
            validate: val.isString
        },{
            name: "dsuseHostPath",
            type: "list",
            message: "(Daemonset) Want to use HostPath?",
            when: this.when.createDaemonset,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "dshpVolumeName",
            message: '(Daemonset) Specify Volume Name. Example - host-volume',
            default: "host-volume",
            when: this.when.dsuseHostPath,
            validate: val.isString
        },{
            name: "dshpLocation",
            type: "input",
            message: "(Daemonset) Host Path",
            default: "/tmp/something",
            validate: val.isString,
            when: this.when.dsuseHostPath
        },{
            name: "dshpType",
            type: "input",
            message: "(Daemonset) Type of Host Path [DirectoryOrCreate, Directory, FileOrCreate, File etc]",
            default: "File",
            validate: val.isString,
            when: this.when.dsuseHostPath
        },{
            type: "input",
            name: "dshpMountPath",
            message: '(Daemonset) Specify mount path. Example - /usr/share/nginx/html',
            default: "/tmp/something",
            when: this.when.dsuseHostPath,
            validate: val.isString
        },{
            name: "dsuseNodeSelector",
            type: "list",
            message: "(Daemonset) Want to use Node Selector?",
            when: this.when.createDaemonset,
            choices: ["no","yes"]
        },{
            type: "input",
            name: "dsnodeselector",
            message: '(Daemonset) Specify Node Selector in JSON format. Example - {"beta.kubernetes.io/arch":"ppc64le"}',
            default: "{}",
            when: this.when.dsuseNodeSelector,
            validate: val.isString,
            filter: val.parseCommand
        }

    ];

        return prompts;
    },
    when: {
        createDaemonset(answers) {
            return answers.createDaemonset === "yes";
        },
        dsusePVC(answers) {
            return answers.dsusePVC === "yes";
        },
        dsuseNodeSelector(answers) {
            return answers.dsuseNodeSelector === "yes";
        },
        dsneedCommand(answers) {
            return answers.dsneedCommand === "yes";
        },
        dsresourceLimits(answers) {
            return answers.dsresourceLimits === "yes";
        },
        dsuseHostPath(answers) {
            return answers.dsuseHostPath === "yes";
        }
    }
}
