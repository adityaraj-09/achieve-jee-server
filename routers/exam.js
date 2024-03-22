const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const jwt = require("jsonwebtoken")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware");
const User = require("../models/user");
const checkGuard = require("../middlewares/checkmiddleware");
const router=express.Router();

const cachedPapers={}
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
        let c=1
        let {id,resume}=req.params
        const paper=await Paper.findById(id)
        const qids=paper.qs
        let ques=[];
        let uid=req.user;
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
                   
                   let isNewAttempt = false;

                   if (!user.attempts) {
                       user.attempts = new Map();
                       isNewAttempt = true;
                   }
   
                   if (!user.attempts.has(id)) {
                       isNewAttempt = true;
                       user.attempts.set(id, []);
                   }
   
                 
                       user.attempts.get(id).push(u);
                       await user.save();
                       console.log("--pushed");
                   
             }else{
                 return res.status(404).json({msg:"user not found"})
             }
         }

        if(cachedPapers[id]){
            let t=Date.now()
            if(t-cachedPapers[id].time>43200000){
                for (let i = 0; i < qids.length; i++) {
                    const q = await Question.findById(qids[i]) 
                    ques.push(q.toJSON())
                }
                cachedPapers[id]={
                    time:t,
                    qs:ques
                }
            }else{
                ques=cachedPapers[id].qs;
            }

        }else{

            for (let i = 0; i < qids.length; i++) {
                const q = await Question.findById(qids[i]) 
                ques.push(q.toJSON())
            }
            cachedPapers[id]={
                time:Date.now(),
                qs:ques
            }
            
        }
        
        
         const token = jwt.sign({ id:uid }, "adityaMalekith09", { expiresIn: '24h' });
        res.status(200).json({ques,token})
        
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
        const {hashmaps,pid,time,index}=req.body
        
        const uid=req.user
      let user=await User.findById(uid)
      let image = user.image;
        let name = user.name;
     
      let paper=await Paper.findById(pid)
     
      user.attempts.get(pid)[index].markedAns= hashmaps;
      user.attempts.get(pid)[index].time= time;
      user.attempts.get(pid)[index].status=1;
      user.attempts.get(pid)[index].finishTime=Date.now()
      user.markModified('attempts');
    user= await user.save()
          let data=await user.getmarks(pid)
          
          if(image===""){
            image=" "
          }
        
         paper= await paper.addAttempt(uid,data,image,name, user.attempts.get(pid)[index].startTime);
      

      
     let papers=await Paper.find({})
    
      res.status(200).json({user,papers})
       
    } catch (error) {
        console.log(error)
        res.status(500).json({msg:error.message});
    }
})



router.post("/api/pause-paper",checkGuard,auth,async (req,res)=>{
    try {
        const {hashmaps,pid,time,index}=req.body
      
      const uid=req.user
      let user=await User.findById(uid)
      
      user.attempts.get(pid)[index].markedAns= hashmaps;
      user.attempts.get(pid)[index].time= time;
      user.attempts.get(pid)[index].status= 2;
      user.attempts.get(pid)[index].finishTime=Date.now()
      user= await user.save()
      let papers=await Paper.find({})
      res.status(200).json({user,papers})
      
    } catch (error) {
        res.status(500).json({msg:error.message});
    }

})





module.exports=router