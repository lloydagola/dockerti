const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const ObjectId  = Schema.Types.ObjectId;

const GroupSchema= new Schema(
    {
        groupTitle      :  {type:String,    required:true, default:"UntitledGroup"},
        containers      :  [{type:ObjectId, ref:"Container"}],
        dateCreated     :  {type:Number,    required:true, default:Date.now()},
        dateModified    :  {type:Number,    required:true, default:Date.now()},
        description     :  {type:String}
    }
);

module.exports = mongoose.model("Group", GroupSchema);
