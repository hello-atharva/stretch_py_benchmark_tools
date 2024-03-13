var name = "remote_client";
var connectedUser = "server_client";

var conn = new WebSocket('ws://localhost:8080'); 

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

   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};

var yourConn; 
var dataChannel;
var remoteDataChannel;

send({
    type: "login",
    name: "remote_client"
});
 
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

    yourConn.ondatachannel = function(event) {
        remoteDataChannel = event.channel;
        remoteDataChannel.onmessage = function(event) {
            console.log("Got message:", event.data);
        };
    }		
   } 
};
 
// initiating an offer to server_client
connectedUser = "server_client";
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
