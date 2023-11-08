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
        if(user){

            let u = {
                paperId: id,
                startTime: Date.now(),
                finishTime: 0,
                markedAns: {},
                status:0
              };
              
          if(!user.attempts){
            user.attempts =new Map();
            
          }
          if(!user.attempts.has(id)){
            let a=[]
            a.push(u)
            user.attempts.set(id,a)
          }else{
            user.attempts.get(id).push(u)
          }
           user=await user.save()
        }else{
            return res.status(404).json({msg:"user not found"})
        }

        
        
        res.status(200).json(ques)
        
    } catch (error) {
        res.status(500).json({error:error.message})

    }
})
function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false; // Arrays have different lengths, so they can't be equal
    }
  
    return arr1.every((element, index) => element === arr2[index]);
  }
  
router.get("/api/get-marks/:pid",checkGuard,auth,async (req,res)=>{
    try {
    const {pid}=req.params
    const uid=req.user
    const u=await User.findById(uid)
    
    let r={}
    const paper=await Paper.findById(pid)
    let data=u.attempts.get(pid).markedAns
    
            let t=0
            let p=0
            let c=0
            let ma=0
            let ca=0
            let tnm=0
           
            for (let index = 0; index < paper.qs.length; index++) {
                const mans = data.get(`${index}`);
                const questionId=paper.qs[index]
                const q=await Question.findById(questionId)
                if(arraysAreEqual(q.ans,mans)){
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
   
        
        res.status(200).send(r)


    } catch (error) {
        res.status(500).json({error:error.message})
    }
    
})


module.exports=router