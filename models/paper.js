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
        default:0,
        type:Number
    },
    qs:{
        type:Array,
        default:[]
    },
    createdAt:{
       type:Number
    },
    duration:{
        type:Number,
        default:180
    },
    by:{
        type:String,
    },
    validTill:{
        default:0,
        type:Number
    },
    AttemptedBy: {
        type: [
            {
                uid: { type: String, required: true },
                name:{type:String,required:true},
                image:{type:String,required:true},
                marks: { type: Number, required: true },
                phy:{type:Array,required:true},
                chem:{type:Array,required:true},
                math:{type:Array,required:true},
                time:{type:Array,required:true},
                startedAt:{type:Number,required:true}
                
            },
        ],
        default: [],
    },
    partialMarking:{
        type:Boolean,
        default:true
    } 

})

paperschema.methods.addAttempt = async function (uid,data,image,name,startedAt) {
   const phy=data.p 
   const chem=data.c 
   const math=data.m
   const marks=data.p[0]+data.c[0]+data.m[0] 
   const time=data.time   
   console.log("data",data)
   
    const attempt = { uid,name,image,marks,phy,chem,math,time,startedAt};

    // Add the attempt to the array
    this.AttemptedBy.push(attempt);

    // Sort the attempts array in descending order based on marks
    this.AttemptedBy.sort((a, b) => b.marks - a.marks);

    // Save the document
    await this.save();

    return this;
};

const Paper=mongoose.model("paper",paperschema)
module.exports=Paper