const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware");
const User = require("../models/user");
const checkGuard = require("../middlewares/checkmiddleware");
const router=express.Router();

router.get("/api/get-paper/:id",checkGuard,auth,async (req,res)=>{
    try {
        let id=req.params
        const paper=await Paper.findById(id)

        req.status(200).json(paper)

    } catch (error) {
        res.status(500).json({error:error.message});
    }
})

router.get("/api/papers",checkGuard,auth,async (req,res)=>{
    try {
        const papers=await Paper.find()
        res.json(papers)
    } catch (error) {
        res.status(500).json({error:error.message});
    }
})


router.get("/api/start-paper/:id",checkGuard,auth,async (req,res)=>{
    try {

        let {id}=req.params
        const paper=await Paper.findById(id)
        const qids=paper.qs
        let ques=[];
        let uid=req.user;
        for (let i = 0; i < qids.length; i++) {
            const q = await Question.findById(qids[i]) 
            ques.push(q.toJSON())
            
        }
         
        let user=await User.findById(uid)
        user.attempts[id].paperId=id
        user.attempts[id].startTime=Date.now()
       await user.save()

        
        
        res.status(200).json(ques)
        
    } catch (error) {
        res.status(500).json({error:error.message})

    }
})

router.get("/api/get-marks/:pid",checkGuard,auth,async (req,res)=>{
    try {
    const {pid}=req.params
    const {uid}=req.body
    const u=await User.findById(uid)
    
    let r={}
    const paper=await Paper.findById(pid)
    let data=u.attempts[pid].markedAns
    
            let t=0
            let p=0
            let c=0
            let ma=0
            let ca=0
            let tnm=0
            r.aq=m.length
            for (let index = 0; index < data.length; index++) {
                const mans = data[index];
                const questionId=paper.qs[index]
                const q=await Question.findById(questionId)
                if(q.ans===mans){
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
   
        
        res.status(200).json(r)


    } catch (error) {
        res.status(500)._construct.json({error:error.message})
    }
    
})


module.exports=router