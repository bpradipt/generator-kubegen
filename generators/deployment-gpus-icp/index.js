"use strict";

var Generator = require("yeoman-generator");
var common = require("../app/base.js");
var deploymentGpuICP = require("./base.js");


module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);
    }

    initializing() {
        common.initializing(this);
    }

    prompting() {
        var prompts = common.getPrompts()
            .concat(deploymentGpuICP.getPrompts());

        return this.prompt(prompts).then((answers) => {
            this.answers = answers;
        });
    }

    configuring() {}

    default () {}

    writing() {
        deploymentGpuICP.write(this.fs, this.answers);
    }

    conflicts() {}

    install() {}

    end() {}
};
