# stretch_py_benchmark_tools
NodeJS server for stretch_web_teleop

## Installation

This repository assumes that you have an up-to-date `ament_ws` installed by `stretch_install`

Set up the workspace

```
cd ~
mkdir -p teleop_ws/src && cd teleop_ws/src
git clone git@github.com:hello-atharva/stretch_py_benchmark_tools.git
```

Install Node dependencies

```
cd stretch_py_benchmark_tools/node
npm i node-pre-gyp
npm i -D ts-node
npm i
```

## Running Stretch Web Teleop Interface

In a new terminal, compile web teleop frontend
```
cd ~/ament_ws/src/stretch_web_teleop
npm --name="stretch_web_teleop" -- run localstorage
```

Hit Ctrl+C once the TypeScript build finishes.

Now, run the web server

```
export NODE_EXTRA_CA_CERTS="/home/hello-robot/ament_ws/src/stretch_web_teleop/certificates/rootCA.pem"
node server.js
```

In a new terminal, run the NodeJS server
```
cd ~/teleop_ws/src/stretch_py_benchmark_tools/node
export NODE_EXTRA_CA_CERTS="/home/hello-robot/ament_ws/src/stretch_web_teleop/certificates/rootCA.pem"
npx ts-node node_server.ts
```

Open up a browser, preferably Chrome, and go to [https://localhost/operator](https://localhost/operator)

