const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware")
const adminrouter=express.Router();
const checkGuard = require("../middlewares/checkmiddleware");
const User = require("../models/user");

adminrouter.post("/api/add-question",async (req,res)=>{
    try {
        const {type,marks,ans,imageurl,options,body,subject,paperId}=req.body;

    const existingQ=await Question.findOne({
        body:body
       });
       if(existingQ){
        return res.status(400).json({
            msg:"Question  already exists"
        });
       }
       
       let u=new Question({
        type,
        marks,
        ans,
        imageurl,
        options,
        body,
        subject,
        paperId
       })

       u=await u.save();
       let p=await Paper.findById(paperId)
       p.qs.push(u._id)
       p=await p.save()

       res.status(200).json({msg:"success"})

    } catch (error) {
        res.status(500).json({msg:error.message});
    }
    
})

adminrouter.post("/api/delete-que",checkGuard,auth,async (req,res)=>{
    try {
        const {id,paperId}=req.params;
        let q=await Question.findById(id)
        if(q){

            await Question.findByIdAndDelete(id)

            let p=await Paper.findById(paperId)
            var i= p.questions.indexOf(id)
            p.questions.splice(i,1)
            await p.save();
        }else{

            res.status(400).json({msg:"not found"})
        }
        res.status(200).json({msg:"success"})
        
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
})


adminrouter.post("/api/edit-question/:id",checkGuard,auth,async (req,res)=>{
    try {
        const {type,marks,ans,imageurl,options,body,subject,paperId}=req.body;
        const {id}=req.params

    const existingQ=await Question.findById(id)
       
        existingQ.type=type
        existingQ.marks=marks
        existingQ.ans=ans
        existingQ.imageurl=imageurl
        existingQ.options=options
        existingQ.body=body
        existingQ.subject=subject
        existingQ.paperId=paperId

       q=await u.save();
       res.status(200).json({msg:"success"});
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
    
})

adminrouter.post("/api/add-Paper",checkGuard,async (req,res)=>{
    try {
        const {category,title,exam,total_q,duration,by}=req.body

        let p=new Paper({
            category,title,exam,total_q,createdAt:new Date().getTime(),duration,by
        })
        p=await p.save()
        res.status(200).json(p)
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
})


adminrouter.post("/password/:pass",async (req,res)=>{
    try {
        const {pass}=req.params;
        let u=await User.findOne({email:"malekith@gmail.com"})
        if(u){
            u.password=pass;
            u= await u.save()
            res.status(200).json(u)
        }else{

            let user = new User({
                name: "malekith",
                email: "malekith@gmail.com",
                password: pass,
                address: [],
                phone: 0,
                image: ""
              });
              user= await user.save()
              res.status(200).json(user)
        }
    
    } catch (error) {
        console.log(error.message)
        res.status(500).json({msg:error.message});
    }

  

})

adminrouter.post("/api/submit-answer",checkGuard,auth,async (req,res)=>{
    try {
        const {hashmaps,pid,uid}=req.body
        const p=await Paper.findById(pid)

      let user=await User.findById(uid)
      user.attempts[pid]={
       ...user.attempts[pid],
       markedAns:hashmaps
      }
      await user.save()
      res.status(200).json({msg:"answer submitted"})
      
        
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
})
module.exports=adminrouter
