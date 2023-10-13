
const mongoose= require("mongoose");

const markSchema=mongoose.Schema({
    total:{
        type:Number,
        default:0
    },
    phy:{
        type:Number,
        default:0
    }
    ,
    chem:{
        type:Number,
        default:0
    }
    ,
    math:{
        type:Number,
        default:0
    },
    markedAns:{
        type:Array, //{"q_id":"nsnnc5cs5cs6cbzz",marked:[1]}
        default:[]
    },
    
    })

module.exports=markSchema