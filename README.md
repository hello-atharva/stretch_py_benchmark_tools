# stretch_py_benchmark_tools
Benchmarking Tools for a Pythonic Stretch

## Run Pythonic Web Teleop Application

### Install Node.js

```shell
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

### Install Node dependencies
```shell
npm i
```

### Run Node server
```shell
node server.js
```

Now, open http://localhost:8080 in a web browser, preferably Google Chrome.

### Run Python Daemon
To pass commands to `stretch_body` through ZMQ, run

```shell
python3 python/stretch_body_zmq_client.py
```
