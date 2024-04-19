# stretch_py_benchmark_tools
NodeJS server for stretch_web_teleop

## Installation

Set up the repos:

```
mkdir web_teleop && cd web_teleop
git clone git@github.com:hello-atharva/stretch_py_benchmark_tools.git
git checkout node-server
git clone git@github.com:hello-robot/stretch_web_teleop.git
git checkout exps
git clone git@github.com:hello-robot/stretchpy.git
git checkout exps
```

Install Node dependencies

```
cd stretch_py_benchmark_tools/node
npm i node-pre-gyp
npm i -D ts-node
npm i
```

Copy in certificates from `ament_ws`.

```
cp ~/ament_ws/src/stretch_web_teleop/certificates/* ./stretch_web_teleop/certificates/
cp ~/ament_ws/src/stretch_web_teleop/.env ./stretch_web_teleop/.env
```

## Running Stretch Web Teleop Interface

In a new terminal, compile web teleop frontend (recompile whenever needed)
```
cd web_teleop/stretch_web_teleop
npm --name="stretch_web_teleop" -- run localstorage
```

Hit Ctrl+C once the TypeScript build finishes.

Now, run the web server

```
export NODE_EXTRA_CA_CERTS="/home/hello-robot/ament_ws/src/stretch_web_teleop/certificates/rootCA.pem"
node server.js
```

Next, run the Python server

```
cd web_teleop/stretchpy
python send_stretch_body.py
```

In a new terminal, run the NodeJS server
```
cd web_teleop/stretch_py_benchmark_tools/node
export NODE_EXTRA_CA_CERTS="/home/hello-robot/ament_ws/src/stretch_web_teleop/certificates/rootCA.pem"
npx ts-node node_server.ts
```

Open up a browser, preferably Chrome, and go to [https://localhost/operator](https://localhost/operator)

If you ever see the operator screen go white (and errors in the console), go to console and enter `localStorage.clear()`
