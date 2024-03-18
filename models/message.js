const mongoose =require("mongoose")

const msgSch=mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    images:{
        type:Array,
        default:[]
    },
    sendAt:{
        type:Number,
        default:Date.now()
    },
    sentBy:{
        type:String,
        required:true
    },
})

const Message=mongoose.model("message",msgSch)
module.exports=Message