const mongoose= require("mongoose");

const questionschema=mongoose.Schema({
    type:{
        required: true,
        type:Number,        // single correct-0  
                            //multiple coorect-1  
    },                      //integer type-2     //numerical -3  //matrix-match-4
    body:{
        required:true,
        type:String
    },
    options:{
        required :true,
        type:Array
    },
    marks:{
        required:true,
        type:Array
    },
    ans:{
        required:true,
        type:Array
    },
    subject:{
        required:true,//p-0,c-1
        type:Number
    },
    imageurl:{
        type:String,
        default:""
    },
    topic:{
        type:String,
        default:""
    },
    paperId:{ 
        type:String,
        default:""
    },
    
})



const Question=mongoose.model( "question",questionschema);
module.exports=Question;



















































