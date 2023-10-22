const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware")
const adminrouter=express.Router();
const checkGuard = require("../middlewares/checkmiddleware");

adminrouter.post("/api/add-question",checkGuard,async (req,res)=>{
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
        res.status(500).json({error:error.message});
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
        res.status(500).json({error:error.message});
    }
})


adminrouter.post("/api/edit-question/:id",checkGuard,auth,async (req,res)=>{
    try {
        const {type,marks,ans,imageurl,options,body,subject,paperId}=req.body;
        const id=req.params

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
        res.status(500).json({error:error.message});
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
        res.status(500).json({error:error.message});
    }
})

module.exports=adminrouter
