const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContainerSchema = new Schema({
  Name: { 
    type:String, 
    required:true
  },
  RestartCount: { 
    type:Number, 
    default:0
  },
  Path: { 
    type:String, 
    default:""
  },
  AutoRemove: { 
    type:Boolean, 
    default:false
  },
  State: {
    type: Object,
    default:{
      Status: "exited",
      Running: false,
      Paused: false,
      Restarting: false,
      OOMKilled: false,
      Dead: false,
      Pid: 0,
      ExitCode: 0,
      Error: "",
      StartedAt: "",
      FinishedAt: ""
    }
  },
  Id: { 
    type:String, 
    required:true
  },
  RestartPolicy: {
    type:Object,
    default:{
      Name: "unless-stopped",
      MaximumRetryCount: 0
    }
  },  
  Args: {
    type:Array,
    default:[
      "node"
    ]
  },
  Env: {
    type:Array,
    default:[
      "MONGO_USERNAME=cne",
      "MONGO_PASSWORD=jeanclaudevandamme",
      "MONGO_PORT=27017",
      "MONGO_DB=cne",
      "AGENT_USER=lashfo0erfihrewonbfowieryheiwonfoen",
      "AGENT_PASS=eofkfnvfikdfoeoekdhnfkldfjoejfeiojf",
      "AGENT_RANDOM=vieoneogvuyoentllsiethoewrbeklwru",
      "AGENT_URI=shop/categories/new/products",
      "MONGO_HOSTNAME=",
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "NODE_VERSION=16.8.0",
      "YARN_VERSION=1.22.5"
  ]
  },
  Cmd: {
    type:Object,
    default:[
      "nodemon",
      "bin/www"
    ]
  },
  WorkingDir: {
    type:String,
    default:""
  },
  Entrypoint: {
    type:String,
    default:""
  },
  Config:{type:Object, required:true},
  CreatedTime:{type:Number, required:true},

  Created: { type: String, required: true },
  dateModified: { type: Number, default: new Date().getTime(), required: true },
  user_notes:{type:String},
  //log whenever an Container checks in
  lastSeen: {    
    type: Object,
    default : {      
      tn: new Date().getTime()
    },    
    required: true 
  },
  //the results of the interactive commands that the user sends to an Container are stored here
  logs: { 
    type: String,
    default : ""
   },
  //***********************information about os and software****************//
  Platform: { 
    type: String,
    default : ""
   },
  user: { 
    type: String,
    default : ""
   },
  processes: { 
    type: Array,
    default :[]
   },
  programs: { 
    type: Array,
    default :[]
   },
   NetworkSettings: {
    type: Object,
    default : {}
  },
  services: { 
    type: Array,
    default : []
   },
  mac_addresses: { 
    type: Object,
    default : {
      status: "init",
      tn:[]
    }
   },
  file_browser: {
    type: Array,
    default:[]
  }
});

module.exports = mongoose.model("Container", ContainerSchema);
