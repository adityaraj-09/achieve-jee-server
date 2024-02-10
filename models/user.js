const mongoose = require("mongoose");
const Paper=require("../models/paper");
const Question=require("../models/question");

const attemptSchema = mongoose.Schema({
    paperId: {
        type: String,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    finishTime: {
        type: Number,
        default: 0
    },
    markedAns: {
        type: Map,
        of: Array,
        default: {}
    },
    status: {

    }
})

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        required: true,
        type: String,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
                return value.match(re)
            },
            message: 'Please enter valid email'
        },
    },
    password: {
        required: true,
        type: String,
        validate: {
            validator: (value) => {
                return value.length > 6;
            },
            message: 'password must be more than 6 characters long'
        },
    },
    address: {
        type: Array,
        default: [],
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    image: {
        type: String,
        default: "",
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Map,
        of: Array,    // {"pid":[attemtschema]}
        default: {}
    },
    lastlogin: {
        type: Number,
        default: 0
    },
    lastpasschanged: {
        type: Number,
        default: 0
    },
    createdAt:{
        type:Number,
        default:Date.now()
    }
});

function arraysAreEqual( arr1, arr2,type,marks,partialMarking) { 
    var right=true
    if(type===0 || type===2 || type===3){
       right= (arr1[0]===arr2[0])
       return {right,marks:right?marks[0]:marks[1]}
    }else{
        if(!partialMarking){
            if(arr1.length!=arr2.length){
                right=false
                return {right,marks:marks[1]}
            }else{
                for (let i = 0; i < arr1.length; i++) {
                    const element = arr1[i];
                    if(!arr2.includes(element)){
                        right=false
                        return {right,marks:marks[1]}
                        
                    }else{
                        continue
                    }
                    
                }

                return {right,marks:marks[0]}
            }
        }else{
            for (let i = 0; i < arr2.length; i++) {
                const element = arr2[i];
                if(!arr1.includes(element)){
                    right=false
                    return {right,marks:marks[1]}
                    
                }else{
                    continue
                }
                
            }
            if(arr2.length===arr1.length){
                return {right,marks:marks[0]}
            } else{
                if(arr1.length===4 ){
                   return  {right,marks:arr2.length}
                }else if(arr1.length===3){
                    if(arr2.length===2){
                        return {right,marks:2}
                    }else{
                        return {right,marks:1}
                    }
                }else{
                    return {right,marks:2}
                }
            }
        }
    }
   
   
  
    
  }
userSchema.methods.getmarks=async function(pid){
    
   
    
    let r={}
    
    const paper=await Paper.findById(pid)
    let timeData=this.attempts.get(pid)[1].time
    let data=this.attempts.get(pid)[1].markedAns
    
            let t=0
            let time=[0,0,0]
            let p=[0,0,0,0] //[marks,correctq,negativemarks,"attempted"]
            let c=[0,0,0,0]
            let m=[0,0,0,0]
            
           
            
            let skip=paper.qs.length-Object.keys(data).length;
            
           
            for (let index = 0; index < paper.qs.length; index++) {
                const mans = data[`${index}`];
                const tpq=timeData[`${index}`]
                const questionId=paper.qs[index]
                const q = await Question.findById(questionId).catch(error => {
                    console.log("Error fetching question:", error);
                });
                console.log("q",questionId)
                if(mans.length==0){skip++}else{
                    if(q.type===0){
                        p[3]++;
                    }else if(q.type===1){
                        c[3]++
                    }else{
                        m[3]++
                    }
                
                const res=arraysAreEqual(q.ans,mans,q.type,q.marks,paper.partialMarking)
                if(res.right){
                   
                    t=t+res.marks
                   
                    if(q.type===0){
                        p[1]++
                        p[0]=p[0]+res.marks
                    }else if(q.type===1){
                        c[1]++
                
                       c[0] =c[0]+res.marks
                    }else{
                        m[1]++
                        m[0]=m[0]+res.marks
                    }
                }else{
                   
                    t=t+res.marks
                    if(q.type===0){
                        p[0]=p[0]+res.marks
                        p[2]=p[2]+res.marks


                    }else if(q.type===1){
                       c[0] =c[0]+res.marks
                       c[2] =c[2]+res.marks
                    }else{
                        m[0]=m[0]+res.marks
                        m[2]=m[2]+res.marks
                    }
                }}

                if(tpq){
                    if(q.type===0){
                        time[0]=time[0]+tpq
                    }else if(q.type===1){
                        time[1]=time[1]+tpq
                    }else{
                        time[2]=time[2]+tpq
                    }
                }
            }
            r.t=t
            r.p=p
            r.c=c
            r.m=m
           
           r.time=time
            r.skp=skip

            return r;
}

const User = mongoose.model("student", userSchema);
module.exports = User;




