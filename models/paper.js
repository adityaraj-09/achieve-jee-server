const mongoose= require("mongoose");

const paperschema=mongoose.Schema({
    category:{
        required:true,
        type:Number  //11th-0  12th-1 11+12-2 
    },
    title:{
        required:true,
        type:String
    },
    exam:{
        required:true,
        type:Number // jee Advanced-0, jee main-1
    },
    total_q:{
        required:true,
        type:Number
    },
    marks:{
        required:true,
        type:Number
    }
    ,
    qs:{
        type:Array,
        default:[]
    },
    createdAt:{
       type:Date
    }

    
})

const Paper=mongoose.model("paper",paperschema)
module.exports=Paper