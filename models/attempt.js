
const mongoose= require("mongoose");

const attemptSchema=mongoose.Schema({
    paperId:{
        type:string,
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
module.exports= attemptSchema