const mongoose=require("mongoose");
const express=require("express");
const bcrypt=require("bcrypt")
const Question=require("../models/question");
const Paper=require("../models/paper");
const auth=require("../middlewares/authMiddleware")
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
        const qids=paper.questions
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



module.exports=router