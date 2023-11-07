
const mongoose= require("mongoose");

const attemptSchema=mongoose.Schema({
    paperId:{
        type:String,
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    finishTime:{
        type:Date,
        required:true
    }
    
})
