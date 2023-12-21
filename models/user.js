const mongoose = require("mongoose");
const Paper=require("../models/paper");
const Question=require("../models/paper");

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
    }
});

userSchema.methods.getmarks=async function(pid){
    
   
    
    let r={}
    
    const paper=await Paper.findById(pid)
    let timeData=this.attempts.get(pid)[0].time
    let data=this.attempts.get(pid)[0].markedAns
    
            let t=0
            let time=[0,0,0]
            let p=[0,0,0,0] //[marks,correctq,negativemarks,"attempted"]
            let c=[0,0,0,0]
            let m=[0,0,0,0]
            
           
            
            let skip=paper.qs.length-Object.keys(data).length;
            
           
            for (let index = 0; index < paper.qs.length; index++) {
                const mans = data.get(`${index}`);
                const tpq=timeData.get(`${index}`)
                const questionId=paper.qs[index]
                const q=await Question.findById(questionId)
                if(mans.length==0){skip++}else{
                    if(q.type===0){
                        p[3]++;
                    }else if(q.type===1){
                        c[3]++
                    }else{
                        m[3]++
                    }
                
                
                if(arraysAreEqual(q.ans,mans)){
                   
                    t=t+q.marks[0]
                   
                    if(q.type===0){
                        p[1]++
                        p[0]=p[0]+q.marks[0]
                    }else if(q.type===1){
                        c[1]++
                
                       c[0] =c[0]+q.marks[0]
                    }else{
                        m[1]++
                        m[0]=m[0]+q.marks[0]
                    }
                }else{
                   
                    t=t+q.marks[1]
                    if(q.type===0){
                        p[0]=p[0]+q.marks[1]
                        p[2]=p[2]+q.marks[1]


                    }else if(q.type===1){
                       c[0] =c[0]+q.marks[1]
                       c[2] =c[2]+q.marks[1]
                    }else{
                        m[0]=m[0]+q.marks[1]
                        m[2]=m[2]+q.marks[1]
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




