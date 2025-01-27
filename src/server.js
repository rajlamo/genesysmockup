let express = require('express');
let cors = require('cors')
let app = express();
let fs = require("fs");
const WebSocket = require("ws");

let clientWs;

let eventDetails = {
   ANI: '',
   eventId: '',
   connectionId: '',
   eventName: '',
   direction: ''
}

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
});

app.post('/genesys/events', (req, res) => {
   const body = req.body;
   console.log(body);
   let shouldSendWsMessage = false;
   switch (body.type) {
      case 'initialize':
         eventDetails.eventName = 'EventRegistered';
         shouldSendWsMessage = true;
         break;
      case 'ring':
         eventDetails.eventName = 'EventRinging';
         eventDetails.ANI = body.ANI;
         eventDetails.eventId = body.eventId;
         eventDetails.connectionId = body.connectionId;
         eventDetails.direction = 'inbound';
         shouldSendWsMessage = true;
         break;
      case 'makeCall':
         eventDetails.direction = 'outbound';
         eventDetails.ANI = body.toNumber;
         eventDetails.connectionId = body.connectionId;
         eventDetails.eventId = body.connectionId;
         eventDetails.eventName = 'EventEstablished';
         shouldSendWsMessage = true;
         break;
      case 'Reject':
         eventDetails.connectionId = body.connectionId;
         eventDetails.eventName = 'EventReleased';
         shouldSendWsMessage = true;
         break;
      default:
         break;
   }
   res.json({ status: 'Success' });
   if (shouldSendWsMessage) {
      clientWs?.send(JSON.stringify(eventDetails));
   }
});

let server = app.listen(5600, function () {
   console.log("Express App running at http://127.0.0.1:5600/ ++");
});

const wss = new WebSocket.Server({ server, path: "/genesysWs" });

wss.on("connection", (ws) => {
   clientWs = ws;
   ws.on("message", (message) => {
      let data = "Not Processed";
      try {
         data = JSON.parse(message);
         console.log("data value"+data+"-->Messge"+message);
         if(data.type === 'login' && data.username && data.region)
         {
            console.log('Login event received:', data.username, 'Region:', data.region); 
         }
      } catch (err) {
         console.log(`Error while parsing message : `, message);
      }
      console.log(data);
   });

   ws.on("error", () => {
      console.log("Error occured");
   });
});
