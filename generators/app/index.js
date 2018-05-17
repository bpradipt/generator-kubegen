"use strict";

var Generator = require("yeoman-generator");
var common = require("./base.js");
var ingress = require("../ingress/base.js");
var deploymentAll = require("../deployment/base.js");
var service = require("../service/base.js");
var pvc = require("../pvc/base.js");
var job = require("../job/base.js");

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
        this.argument("apply", { required: false });
    }

    initializing() {
        common.initializing(this);
    }

    prompting() {
      var prompts = common.getPrompts()
                    .concat(deploymentAll.getPrompts())
                    .concat(job.getPrompts())
                    .concat(pvc.getPrompts())
                    .concat(service.getPrompts())
                    .concat(ingress.getPrompts());

        return this.prompt(prompts).then((answers) => {
            this.answers = answers;
            answers.createDeploy = answers.createDeploy === "yes";
            answers.createJob = answers.createJob === "yes";
            answers.createSVC = answers.createSVC === "yes";
            answers.shouldExpose = answers.shouldExpose === "yes";
            answers.createPVC = answers.createPVC === "yes";
            answers.usePVC = answers.usePVC === "yes";
            answers.useHostPath = answers.useHostPath === "yes";
            answers.needCommand = answers.needCommand === "yes";
            answers.resourceLimits = answers.resourceLimits === "yes";
            answers.useNodeSelector = answers.useNodeSelector === "yes";
        });
    }

    configuring() {}

    default () {}

    writing() {
        this.destinationRoot("./" + this.answers.dirName);
        if (this.answers.createDeploy) {
            deploymentAll.write(this.fs, this.answers);
        }
        if (this.answers.createJob) {
            job.write(this.fs, this.answers);
        }
        if (this.answers.createSVC) {
            service.write(this.fs, this.answers);
        }
        if (this.answers.shouldExpose) {
            ingress.write(this.fs, this.answers);
        }
        if (this.answers.createPVC) {
            pvc.write(this.fs, this.answers);
        }
    }

    conflicts() {}

    install() {
        if (this.options.apply) {
            common.spawnKubectlCommand(this, this.destinationRoot(), "apply");
        }
    }

    end() {}
};
