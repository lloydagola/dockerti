const express = require('express');
const router = express.Router();
const multer = require("multer");

const Group = require('../models/groups');

router.get('/', (req, res) => {

    Group.find({})
    .populate('containers')
    .exec((error, groups) => {
        if(error){
           throw new Error({error})
        }
        res.status(200).send({groups});
    })
    .catch(error => {
      console.log(error)
      res.status(500).send({error})
    });
});

router.get('/:_id', (req, res) => {

    Group.findById(req.params._idg)
    .populate('containers')
    .exec((error, group) => {
        if(error){
           throw new Error(error)
        }
        res.status(200).send({group});

    })
    .catch(error => {
      console.log(error)
      res.status(500).send({error})
    });
});

//upload notes
router.post("/notes/:_id", (req, res, next) => {
  
    let targetAgent;
    const _id = req.params._id;
    const uploadPath = `./public/uploads/${_id}/notes`;
  
    Group.findById(req.params._id) 
    .then(targetGroup => {
     if( !targetGroup.groupAuthor) throw new Error("group not found");
     console.log("4");
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
      return upload(req, res, next, err => {
        if (!req.file) {
          console.log("5.1");
          console.log("could not upload the file", err);           
          
          throw new Error("no file chosen");   
        }
      })    
      
    })
    .then(() => res.status(200).send({ error:false, message:"notes saved"}))
    .catch(error => res.status(401).send({ error:true, message:error + "could not save notes"}));
  });

router.post('/', (req, res) => {

    const newGroup = new Group(req.body);
    newGroup.save((error, savedGroup) => {
      if(error){
        throw new Error(error)
     }

     res.status(200).send(savedGroup)
          
        
    })
    .catch(error => {
      console.log(error)
      res.status(500).send({error})
    });

});

router.put('/:_id', (req, res) => {

    Group.updateOne({_id:req.params.id}, { $set: req.body}, (error, validGroup) => {

        if(error){
            console.log('Could not update group...', error);
            res.status(500).send({status:'error',error:"Could not update group..."});
        }else{

            console.log('updating group...');
            res.status(200).send({status:'ok',validGroup});
        }
    });

});

router.put('/containers', (req, res) => {

    Group.updateOne(req.body.criteria, { $addToSet: req.body.data}, (error, validGroup) => {
        if(error){
            console.log('Could not update group...', error);
            res.status(500).send({status:'error',error:"Could not update group..."});
        }else{

            console.log('updating group...');
            res.status(200).send({status:'ok', validGroup});
        }
    });

});

//delete a single group
router.delete('/:_id', (req, res) => {

  Group.findByIdAndUpdate(req.params._id, {deleted:{tn:true, date:Date.now(), deletedBy:req.user._id}, status:"Deleted"})
  .then(() =>  res.status(200).send({ error:false, message:"deleted successfully" }))
  .catch(error => res.status(401).send({ error:true, message:"incorrect credentials"}));

});




module.exports = router;
