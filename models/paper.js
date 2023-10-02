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
    for:{
        required:true,
        type:Number // jee Advanced-0, jee main-1
    },
    questions_no:{
        required:true,
        type:Number
    },
    marks:{
        required:true,
        type:Number
    }
    ,
    questions:{
        type:Array,
        default:[]
    },
    createdAt:{
       
    }

    
})

const Paper=mongoose.model("paper",paperschema)
module.exports=Paper