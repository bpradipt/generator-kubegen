# Yeoman generator for Kubernetes boilerplate code

kubegen is a tool to create boilerplate Kubernetes Deployment, Service, PVC, Ingress yamls

kubegen is a [Yeoman](http://yeoman.io) generator, so you'll need to have [NodeJS](https://nodejs.org/) installed.

This is based on the work done by sesispla that is available here - https://github.com/sesispla/generator-kubegen

# Pre-requisite
Ensure recent version of Node is installed. The version of Node in Ubuntu is pretty old.

```bash
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
```

Detailed instructions mentioned in the following link for installing recent versions of Node on Ubuntu:
[Install latest Node on Ubuntu](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)

# Installation

To install kubegen, you need to execute the following command:

```bash
git clone https://github.com/bpradipt/generator-kubegen
sudo npm install -g yo
sudo npm install -g ./generator-kubegen
```

For validating the generated YAMLs, you can use kubeval.
On Mac you can install using Homebrew
```bash
brew tap garethr/kubeval
brew install kubeval
```
For details refer to the source repository - https://github.com/garethr/kubeval

# Usage

Follwing commands are available at the moment:

| Command                | Description                                                                                                | Arguments                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| yo kubegen             | Starts a full Kubernetes file generation wizard. All generated files are stored in a specified folder.     | --apply: Spawns a "kubectl apply -f " to all files generated immediately |
| yo kubegen:deployment  | Starts the Deployment subgenerator. 'deployment.yml' file is created, in the specified folder.             |                                                                          |
| yo kubegen:service     | Starts the Service subgenerator. 'service.yml' file is created, in the specified folder.                   |                                                                          |
| yo kubegen:ingress     | Starts the Replication Controller subgenerator. 'deployment.yml' file is created, in the specified folder. |                                                                          |
| yo kubegen:lego        | Starts the Let's Encrypt subgenerator. All the internal components required by a TLS Ingress with kube-lego is created by this subgen |                                               | 
| yo kubegen:pvc         | Starts the Persistent Volume Claim subgenerator. 'pvc.yml' file is created, in the specified folder.       |                                                                          |

```bash
$ yo kubegen

 |  |/  / |  |  |  | |   _  \  |   ____| /  _____||   ____||  \ |  |
 |  '  /  |  |  |  | |  |_)  | |  |__   |  |  __  |  |__   |   \|  |
 |    <   |  |  |  | |   _  <  |   __|  |  | |_ | |   __|  |  . `  |
 |  .  \  |  `--'  | |  |_)  | |  |____ |  |__| | |  |____ |  |\   |
 |__|\__\  \______/  |______/  |_______| \______| |_______||__| \__|

Welcome to Kubernetes Generator (kubegen)!. Generate Deployment/Service/PVC/Ingress YAMLs
Validate the generated YAML schema using kubeval - https://github.com/garethr/kubeval

? Directory to store the YAML? (app-demo)
```

**Note:** You'll need to run it as a non-root user

# Contributing

Contribution is welcome! Just:

- Fork this project
- install the NPM dependencies:

```bash
npm install
```

- Link this folder to npm

```bash
npm link
/usr/local/lib/node_modules/generator-kubegen -> /Users/User/generator-kubegen
```

- Edit the project with your favorite text editor or tool

# Debugging

For your conveniente, this project comes with a pre-built configuration to debug the solution with [Visual Studio Code](https://code.visualstudio.com). Just go to the "Debug" menu on the left, select "Yeoman generator" in the dropdown (beside "play button") and then click "play" to start debugging.

![debug with VSCode](docs/debug.png)
