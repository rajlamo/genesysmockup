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
   console.log("Body"+JSON.stringify(body));
   let shouldSendWsMessage = false;
   switch (body.type) {
      case 'initialize':
          console.log("initialize");
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
   console.log("Express App running at http://127.0.0.1:5600/ -- ");
});

const wss = new WebSocket.Server({ server, path: "/genesysWs" });

wss.on("connection", (ws) => {
   clientWs = ws;
     console.log("wss connection 72"+ws);
   ws.on("message", (message) => {
       console.log("Message received line number 74"+message);
      let data = "Not Processed";
      try {
         const fusionData = JSON.parse(message);
         console.log("data value"+fusionData+"-->Messge"+message);
         if(fusionData.type === 'login' && fusionData.username && fusionData.region)
         {
            console.log('Login event received:', fusionData.username, 'Region:', fusionData.region); 
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
