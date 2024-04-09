//require our websocket library 
var WebSocketServer = require('ws').Server;
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');

// Set up ZMQ pub server at port 3000
const zmq = require('zeromq');
const sock = new zmq.Publisher();

async function connectZMQPub() {
    await sock.bind("tcp://127.0.0.1:3000");
}

connectZMQPub();

// Set up a new worker thread to handle ZMQ sub client

const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
    const worker = new Worker(__dirname + '/workers/zmq_sub_worker.js');
    worker.on('message', (msg) => {
        // console.log('Message from worker:', msg);
        // Send teleop command over WebRTC
        if (remoteDataChannel) {
            remoteDataChannel.send(msg);
        }
    }
    );
} else {
    parentPort.postMessage('ACK from worker');
}

// Set up a new worker thread to handle ZMQ pull server
const worker2 = new Worker(__dirname + '/workers/zmq_pull_worker.js');
worker2.on('message', (msg) => {
    console.log('Message from worker2:');
    // Send image over WebRTC
    if (remoteDataChannel) {
        // check if remoteDataChannel is open
        if (remoteDataChannel.readyState === 'open') {
            console.log('Sending image over WebRTC');
            remoteDataChannel.send(msg);
        }
        // remoteDataChannel.send(msg);
    }
});


// Utility function to publish a message over ZMQ
async function sendZMQ(topic, message) {
    await sock.send([topic, message]);
    await new Promise(resolve => { setTimeout(resolve, 500) });
}

// Set up Express.js server for the web teleop UI
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.use(express.static(path.join(__dirname + '/static')));

// Serve our teleop webpage at the root
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/static/index.html'));
}
);

app.listen(8080, function () {
    console.log('Open Web Teleop App at localhost:8080!');
});

//creating a websocket server at port 9090 
var wss = new WebSocketServer({port: 9090});
var robotConnection;
  
//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("User connected");
   robotConnection = connection;
	 
   //when server gets a message from a connected user 
   connection.on('message', function(message) {
	 
      var data; 
      //accepting only JSON messages 
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
         return;
      }
		  
      //switching type of the user message 
      switch (data.type) { 		
         case "offer": 
            handleOffer(connection, data.offer);
            break;
				
         case "answer": 
            handleAnswer(connection, data.answer);
            break;
				
         case "candidate": 
            handleCandidate(connection, data.candidate);
            break;

         default: 
            sendTo(connection, { 
               type: "error", 
               message: "Command not found: " + data.type 
            }); 			
            break;
      }  
   });
   connection.on("close", function() { 
        console.log("remote_client disconnected");
   });
});
  
function sendTo(connection, message) { 
   connection.send(JSON.stringify(message)); 
}

// Server WebRTC Listener
var dataChannel;
var remoteDataChannel;
var conn = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun2.1.google.com:19302"
        }
    ]
});

conn.onicecandidate = function (event) {
    if (event.candidate) {
        send({
            type: "candidate",
            candidate: event.candidate
        });
    }
}

dataChannel = conn.createDataChannel("web_teleop_channel", {reliable: true});

dataChannel.onopen = function () {
    console.log("[RTC] data channel is open and ready to be used.");
}

dataChannel.onerror = function (error) {
    console.log("[RTC] Error:", error);
};

dataChannel.onmessage = function (event) {
    // console.log("[RTC] Got message:", event.data);
    // console.log("Sending to ZMQ...")
    sendZMQ('stretch_teleop_commands', event.data);
};

dataChannel.onclose = function () {
    console.log("[RTC] data channel is closed");
};

conn.ondatachannel = function (event) {
    // We need to store remote client's RTC datachannel to be able to receive data
    remoteDataChannel = event.channel;
    remoteDataChannel.onmessage = async function (event) {
        // console.log("[RTC] Got message from operator:", event.data);
        // // Send teleop command over ZMQ
        // console.log("Sending to ZMQ...")
        await sendZMQ('stretch_teleop_commands', event.data);
    };
}

function send(message) {
    message.name = "server_client";
    robotConnection.send(JSON.stringify(message));
}

function handleOffer(ws_connection, offer) {
    conn.setRemoteDescription(new RTCSessionDescription(offer));
    conn.createAnswer(function (answer) {
        conn.setLocalDescription(answer);
        sendTo(ws_connection, {
            type: "answer",
            answer: answer
        });
    }, function (error) {
        alert("Error when creating an answer");
    });
}

function handleCandidate(ws_connection, candidate) {
    conn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(ws_connection, answer) {
    conn.setRemoteDescription(new RTCSessionDescription(answer));
}
