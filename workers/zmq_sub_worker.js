const zmq = require("zeromq");
const { Worker, isMainThread, parentPort } = require('worker_threads');

// Set up ZMQ sub client to listen for teleop commands
const zmqSub = new zmq.Subscriber();

async function connectZMQSub() {
    await zmqSub.connect("tcp://127.0.0.1:3001");
    await zmqSub.subscribe();
}

connectZMQSub();

async function receiveZMQ() {
    for await (const [topic, msg] of zmqSub) {
        // console.log("received message");
        // console.log(msg);
        // console.log('Received a message related to:', topic.toString(), 'containing message:', msg.toString());
        parentPort.postMessage(msg.toString());
    }
}

receiveZMQ();
