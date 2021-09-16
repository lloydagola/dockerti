const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { check, validationResult } = require("express-validator/check");

const expressValidator = require("express-validator");

const containerRouter = require("./routes/containers");
const groupsRouter = require("./routes/groups");
const { log } = require("console");
const app = express();

const aedes = require('aedes')();
const httpServer = require('http').createServer();
const ws = require('websocket-stream');
const port = 3030;
let online = false;

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) //mandatory (as per the Node.js docs)
})

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_URL,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const options = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
};

const mongo_url = `mongodb://${MONGO_URL}:${MONGO_PORT}/${MONGO_DB}`;

const mongo_authentication = [
  mongo_url, 
  {
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    auth: { "authSource": "admin" },
    user:MONGO_USERNAME,
    pass:MONGO_PASSWORD
  }
]

mongoose.connect(...mongo_authentication)
.then(() => {console.log("db connected...")})
.catch(error => {
  console.log("could not connect to the database..."); 
  console.log("mongo_authentication", mongo_authentication); 
  console.log("error", error);   
});

// mongoose.connect(_mongo_url, options)
//   .then( function() {
//     console.log('MongoDB is connected');
//   })
//   .catch( function(err) {
//   console.log("mongoose err", err);
//   console.log("_mongo_url", _mongo_url);
// });
const db = mongoose.connection;
db.on("error", () => console.log("console", "connection error:"));
db.once("open", () => console.log("database connected..."));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressValidator());


function logErrors (err, req, res, next) {
  console.log("something",err);
  console.error(err.stack)
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    console.log("error: 'Something failed!' ", err);
    res.status(500).send()
  } else {
    next(err)
  }
}

function errorHandler (err, req, res, next) {
  console.log("error: 'Something failed!' ", err);
  res.status(500).send({})
  //res.render('error', { error: err })
}

app.use("/containers", containerRouter);
app.use("/groups",  groupsRouter);

//app.get("/", (req, res) => res.end())
const publish = (topic, payload) => {
  console.log("publishing message...");
  if (online) {
    console.log({topic, payload});
    aedes.publish({topic, payload});
  }
}

try{
  console.log("setting up aedes...");
  
  ws.createServer({ server: httpServer }, aedes.handle)
  
  httpServer.listen(port, function () {
    console.log('aedes listening on port ', port);
    online = true;
    //aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id });
  })
  
   // fired when a client connects
   aedes.on('client', function (client) {
    console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
   })
  
   aedes.on('subscribe', function (subscriptions, client) {
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
        '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
  
        //aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id });
   })

}
catch(error){
  console.log("an error occurred while attempting to set up aedes server", error);
  online = false;
}

//static folder
app.use(express.static(path.join(__dirname, 'build')));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((err, req, res, next) => {
  // This check makes sure this is a JSON parsing issue, but it might be
  // coming from any middleware, not just body-parser:

  console.log("weird tf error...");

  if (err instanceof Error) {
      console.error("error...", err);
      return res.sendStatus(400); 
  }

  next();
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
});
// // error handler
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)







module.exports = app;
exports.publish = publish;
