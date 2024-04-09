const zmq = require('zeromq');
const { Worker, isMainThread, parentPort } = require('worker_threads');

// Set up a new ZMQ PULL server to receive images from the robot
const zmq_pull = new zmq.Pull();

async function connectZMQPull() {
    console.log('Binding to port 3002');
    await zmq_pull.connect("tcp://127.0.0.1:3002");
}

connectZMQPull();

// Send the image over port 3003
const zmq_pub = new zmq.Push();

async function connectZMQPub() {
    console.log('Binding to port 3003');
    await zmq_pub.bind("tcp://127.0.0.1:3003");
}

connectZMQPub();

// Function to push the image to the ZMQ PUB server
async function sendZMQ(image) {
    await zmq_pub.send(image);
}

async function receiveZMQ() {
    for await (const [msg] of zmq_pull) {
        // image is a buffer
        console.log('Received image');
        // console.log(msg.toString());
        parentPort.postMessage(msg.toString());
        sendZMQ(msg);
    }
}

receiveZMQ();
