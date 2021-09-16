const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const Container = require("../models/containers");

const app = require("../app");

function deleteDirectory(dir) {
  return fs.rm(dir, { recursive: true }, () => console.log('donge'));
}

//create an container
router.post("/:Id", (req, res, next) => {
  console.log("posting container...", req.body);
  
  let Id = req.params.Id,   
      Name = req.body.Name;  

  if (Id && Name) {
    //initialize a variable to hold the case to which the container belongs(if found/exists)

    console.log("so far so good...");

    //check to see if we have a valid case corresponding to the container making the request
    //every container must therefore have a case
    
    const newContainer = new Container({
      Id,
      ...req.body
    });

    newContainer.save()
      .then(container => {
        console.log({container});
        if (container || container != null) {
          app.publish(
            JSON.stringify({
              type: "NEW_CONTAINER",
              payload: container
            })
          );
          
          res.status(200).send({container});

          return;
        }
        throw new Error(
          "something happened and the container could not be saved"
        );
      })
      .catch(error => {
        console.log(error);
        res.status(500).send({error})
      });
      
  }
  else {
    console.log("could not save the container", req.body);
    res.status(500).send({error:"could not save the container"})
  }
});
  
//edit an container
router.patch("/:_id", (req, res, next) => {
  const _id = req.params._id;
  
  if (_id && req.body.attribute & req.body.data) {
        
    
    Container.findOneAndUpdate(
      { Id },
      { $set: {[req.body.attribute]:req.body.data} },
      { new: true }
    )
    .then(container => {
      if (!container) {
        throw new Error("could not find the requested container");
      }
      //notify the client UI that a new container was saved

      res.status(200).send({container});
    })
    .catch(error => {
      console.log("" + error)
      res.status(500).send({error})
    });
  }
});

//upload a file
router.post("/file/:_id", (req, res) => {
 
  
  const _id = req.params._id;
  const uploadPath = `./public/uploads/${_id}/files`;

  Container.findById(_id)
  .then(container => {    
     //set storage engine
  
    const storage = multer.diskStorage({   
      destination: uploadPath,
      filename: (req, file, cb) => {
        cb(
          null,

          `${file.originalname.split(".")[0]}___` +
          Date.now()
          +
          path.extname(file.originalname)
        );
      }
    });
    //init upload
    const upload = multer({
      storage: storage
    }).single("file");
    
    upload(req, res, err => {
      if (!req.file) {       
        console.log("could not upload the file", req.file);  
        
        throw new Error("no file chosen");   
      } 
      else {          
        res.status(200).send(container);
      }
    });
    
  })
  .catch(error => {
    console.log(error);
    
    res.status(500).send({error});
  });
});

//********************UI ENDPOINTS****************************
router.get("/", (req, res, next) => {
  Container.find({})
    .then(containers => res.status(200).send(containers))
    .catch(error =>
      res.status(500).send({ error })
    );
});

router.get("/:_id", (req, res, next) => {
  //check if a valid container exists with the given id

 
    Container.findById(req.params._id)
      .then(container => res.status(200).send({container}))
      .catch(error =>
        res.status(500).send({error})
      );
  
}); 

//upload notes
router.post("/notes/:_id", (req, res, next) => {
  
  const _id = req.params._id,
  uploadPath = `./public/uploads/${_id}/notes`;

  Container.findById(_id)
  .then(container => {    
     //set storage engine   
    const storage = multer.diskStorage({   
      destination: uploadPath,
      filename: (req, file, cb) => {
        cb(
          null,
         file.originalname
        );
      }
    });
    //init upload
    const upload = multer({
      storage: storage
    }).single("file");

    upload(req, res, next, err => {
      if (!req.file) {
        throw new Error("no file chosen");   
      }

      else res.status(200).send(container)  
    })    
    
  })
  .catch(error =>{ 
    console.log(error)
    res.status(501).send({ error})
  });
});

//hard delete container
router.delete("/:_id", (req, res, next) => {
  //remove the document(s) matching the given criteria
  Container.deleteOne({_id:req.params._id})
  .then(() => {
    console.log("document removed");

    return deleteDirectory(`./public/uploads/${req.params._id}`); 
  })
  .then(() => {    
    res.status(200).send({ status: "ok"});
  })
  .catch(error => {
    console.log("An error occurred while attempting to delete the container(s)");

    res.status(500).send({ error});
  });
});

//hard delete all containers
router.delete("/", (req, res, next) => {
  //remove the document(s) matching the given criteria
  Container.deleteMany({})
  .then(()=>{
    console.log("docs removed...");
    return deleteDirectory('./public/uploads');
  })
  .then(() => {
    console.log("purged all files...");

    res.status(200).send({ status: "ok"});
  })
  .catch(error => {
    console.log({error});
    

    res.status(500).send({error});
  });
});

module.exports = router;
