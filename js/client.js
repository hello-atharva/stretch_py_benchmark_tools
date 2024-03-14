var name = "remote_client";
var connectedUser;

var conn = new WebSocket('ws://localhost:9090'); 

conn.onopen = function () { 
   console.log("Connected to the signaling server");
};
 
conn.onmessage = function (msg) { 
   console.log("Got message" + msg.data); 
   var data = JSON.parse(msg.data); 
	
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break;
      default: 
         break; 
   } 
}; 

conn.onerror = function (err) { 
   console.log("Got error", err); 
}; 

function send(message) { 
    //attach the other peer username to our messages
    if (connectedUser) { 
       message.name = connectedUser; 
    } 
     
    conn.send(JSON.stringify(message)); 
 };

var yourConn; 
var dataChannel;
var remoteDataChannel;
 
function handleLogin(success) { 

   if (success === false) {
      alert("Error connecting to the server"); 
   } else { 
    
    var configuration = { 
        "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
    }; 
    
    yourConn = new webkitRTCPeerConnection(configuration, {optional: [{RtpDataChannels: true}]}); 
    
    yourConn.onicecandidate = function (event) { 
        if (event.candidate) { 
        send({ 
            type: "candidate", 
            candidate: event.candidate 
        }); 
        } 
    }; 
    
    dataChannel = yourConn.createDataChannel("web_teleop_channel", {reliable:true}); 

    dataChannel.onopen = function (event) {
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

    // // initiating an offer to server_client
    // // connectedUser = "server_client";

    yourConn.createOffer(function (offer) {
        send({
            type: "offer",
            offer: offer
        });
        yourConn.setLocalDescription(offer);
        }, function (error) {
            alert("Error when creating an offer");
        }
    );

    yourConn.ondatachannel = function(event) {
        remoteDataChannel = event.channel;
        remoteDataChannel.onmessage = function(event) {
            console.log("Got message:", event.data);
        };
    }		
   } 
};

function handleOffer(offer, name) { 
   console.log("Got an offer from " + name);
   connectedUser = name; 
   yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
	
   yourConn.createAnswer(function (answer) { 
      yourConn.setLocalDescription(answer); 
      send({ 
         type: "answer", 
         answer: answer 
      }); 
   }, function (error) { 
      alert("Error when creating an answer"); 
   });
	
};
 
function handleAnswer(answer) { 
    console.log("Got an answer from " + connectedUser);
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
};
 
function handleCandidate(candidate) { 
   yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};

// Button DOM elements
var forwardButton = document.getElementById("forwardBtn");
var moveByButton = document.getElementById("moveByBtn");
var moveToButton = document.getElementById("moveToBtn");
var homeButton = document.getElementById("homeBtn");
var runstopButton = document.getElementById("runstopBtn");
var connectButton = document.getElementById("connectBtn");

// Click event listeners
forwardButton.addEventListener("click", function() {
    if (remoteDataChannel) {
        const data = {
            type: "forward",
            value: 1
        };
        remoteDataChannel.send(JSON.stringify(data));
    }
});

moveByButton.addEventListener("click", function() {
    if (remoteDataChannel) {
        const data = {
            type: "moveBy",
            value: 0.5
        };
        remoteDataChannel.send(JSON.stringify(data));
    }
});

moveToButton.addEventListener("click", function() {
    if (remoteDataChannel) {
        const data = {
            type: "moveTo",
            value: 0.5
        };
        remoteDataChannel.send(JSON.stringify(data));
    }
});

homeButton.addEventListener("click", function() {
    if (remoteDataChannel) {
        const data = {
            type: "home"
        };
        remoteDataChannel.send(JSON.stringify(data));
    }
});

runstopButton.addEventListener("click", function() {
    if (remoteDataChannel) {
        const data = {
            type: "runstop"
        };
        remoteDataChannel.send(JSON.stringify(data));
    }
});

connectButton.addEventListener("click", function() {
    handleLogin(true);
});
