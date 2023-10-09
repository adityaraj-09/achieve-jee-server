const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware");
const User = require("../models/user");
const router=express.Router();

router.get("/api/get-paper/:id",auth,async (req,res)=>{
    try {
        let id=req.params
        const paper=await Paper.findById(id)

        req.status(200).json(paper)

    } catch (error) {
        res.status(500).json({error:error.message});
    }
})


router.get("/api/start-paper/:id",auth,async (req,res)=>{
    try {

        let id=req.params
        const paper=await Paper.findById(id)
        const qids=paper.qs
        let ques=[];
        for (let i = 0; i < qids.length; i++) {
            const q = await Question.findById(array[i]) 
            ques.push(q.toJSON())
            
        }
        res.status(200).json({...paper,ques})
        
    } catch (error) {
        res.status(500).json({error:error.message})

    }
})

router.get("/api/get-marks/:pid",auth,async (req,res)=>{
    try {
    const pid=req.params
    const {uid}=req.body
    const u=await User.findById(uid)
    const arr=u.attempts
    let r={}
    for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        if(e.details.paperId===pid){
            const m=e.marks.markedAns
            let t=0
            let p=0
            let c=0
            let ma=0
            let ca=0
            let tnm=0
            r.aq=m.length
            for (let index = 0; index < m.length; index++) {
                const mans = m[index];
                const q=await Question.findById(mans.q_id)
                if(q.ans===mans.marked){
                    ca++
                    t=t+q.marks[0]
                   
                    if(q.type===0){
                        p=p+q.marks[0]
                    }else if(q.type===1){
                       c =c+q.marks[0]
                    }else{
                        ma=ma+q.marks[0]
                    }
                }else{
                    tnm+=q.marks[1]
                    t=t+q.marks[1]
                    if(q.type===0){
                        p=p+q.marks[1]
                    }else if(q.type===1){
                       c =c+q.marks[1]
                    }else{
                        ma=ma+q.marks[1]
                    }
                }
            }
            r.t=t
            r.p=p
            r.c=c
            r.m=ma
            r.ca=ca
            r.tnm=tnm

        }
    }
        res.status(200).json(r)
    } catch (error) {
        res.status(500)._construct.json({error:error.message})
    }
    


})





module.exports=router