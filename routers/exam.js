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


router.get("/api/start-paper/:id/:resume",checkGuard,auth,async (req,res)=>{
    try {

        let {id,resume}=req.params
        const paper=await Paper.findById(id)
        const qids=paper.qs
        let ques=[];
        let uid=req.user;
        for (let i = 0; i < qids.length; i++) {
            const q = await Question.findById(qids[i]) 
            ques.push(q.toJSON())
        }
         if(resume==="false"){

             let user=await User.findById(uid)
             if(user){
     
                 let u = {
                     paperId: id,
                     startTime: Date.now(),
                     finishTime: 0,
                     markedAns: {},
                     status:0,
                     time:{}
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
         }

        
        
        res.status(200).json(ques)
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})

    }
})



  
  
router.get("/api/get-marks/:pid",checkGuard,auth,async (req,res)=>{
    try {
    const {pid}=req.params
    const uid=req.user
    const u=await User.findById(uid)
    
    const data=u.getmarks(pid)
    res.status(200).json(data)


    } catch (error) {
        res.status(500).json({error:error.message})
    }
    
})



 



router.post("/api/submit-answer",checkGuard,auth,async (req,res)=>{
    try {
        const {hashmaps,pid,time}=req.body
      
        const uid=req.user
      let user=await User.findById(uid)
      let u=user.attempts.get(pid).length
      let paper=await Paper.findById(pid)
      if(u===1){

          let data=user.getmarks(pid)
          
          await paper.addAttempt(uid,data,user.image,user.name);
      }

      
      user.attempts.get(pid)[u-1].markedAns= hashmaps;
      user.attempts.get(pid)[u-1].time= time;
      user.attempts.get(pid)[u-1].status=1;
      user.attempts.get(pid)[u-1].finishTime=Date.now()
      
     user= await user.save()
      res.status(200).json(user)
       
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
})



router.get("/api/pause-paper",checkGuard,auth,async (req,res)=>{
    try {
        const {hashmaps,pid,time}=req.body
      
      const uid=req.user
      let user=await User.findById(uid)
      let u=user.attempts.get(pid).length
      user.attempts.get(pid)[u-1].markedAns= hashmaps;
      user.attempts.get(pid)[u-1].time= time;
      user.attempts.get(pid)[u-1].status= 2;
      user.attempts.get(pid)[u-1].finishTime=Date.now()
      user= await user.save()
      res.status(200).json(user)
      
    } catch (error) {
        res.status(500).json({msg:error.message});
    }

})





module.exports=router