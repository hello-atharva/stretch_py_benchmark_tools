//require our websocket library 
var WebSocketServer = require('ws').Server;
// const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc');
 

var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.use(express.static(path.join(__dirname)));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
}
);

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});

//creating a websocket server at port 9090 
var wss = new WebSocketServer({port: 9090});
  
//when a user connects to our sever 
wss.on('connection', function(connection) {
  
   console.log("User connected");
	 
   //when server gets a message from a connected user 
   connection.on('message', function(message) {
	 
      var data; 
      //accepting only JSON messages 
      try { 
         data = JSON.parse(message); 
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }
		  
      //switching type of the user message 
      switch (data.type) { 		
         case "offer": 
            handleOffer(data.offer);
            break;
				
         case "answer": 
            handleAnswer(data.answer);
            break;
				
         case "candidate": 
            handleCandidate(data.candidate);
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
        sendTo(conn, {
            type: "candidate",
            candidate: event.candidate
        });
    }
}

dataChannel = conn.createDataChannel("web_teleop_channel", {reliable: true});

dataChannel.onopen = function () {
    console.log("data channel is open and ready to be used.");
}

dataChannel.onerror = function (error) {
    console.log("Error:", error);
};

dataChannel.onmessage = function (event) {
    console.log("Got message:", event.data);
};

dataChannel.onclose = function () {
    console.log("data channel is closed");
};

conn.ondatachannel = function (event) {
    remoteDataChannel = event.channel;
    remoteDataChannel.onmessage = function (event) {
        console.log("Got message:", event.data);
    };
}

function send(message) {
    message.name = "server_client";
    wss.send(JSON.stringify(message));
}

function handleOffer(offer) {
    conn.setRemoteDescription(new RTCSessionDescription(offer));
    conn.createAnswer(function (answer) {
        conn.setLocalDescription(answer);
        send({
            type: "answer",
            answer: answer
        });
    }, function (error) {
        alert("Error when creating an answer");
    });
}

function handleCandidate(candidate) {
    conn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleAnswer(answer) {
    conn.setRemoteDescription(new RTCSessionDescription(answer));
}
