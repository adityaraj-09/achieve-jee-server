const express=require("express");
const mongoose=require("mongoose")
const cors =require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT =8000

const adminrouter=require("./routers/admin")
const app=express();
const DB="mongodb+srv://aditya:adi123@cluster0.pxaqtot.mongodb.net/?retryWrites=true&w=majority";
app.use(cors())
app.use(express.json())
app.use(adminrouter)
const httpserver=new createServer(app)
const io=new Server(httpserver,{})


mongoose.connect(DB,{ useFindAndModify: false }).then(async()=>{
    console.log("connected to mongodb")
}).catch((e) => {
    console.log(e);
});



httpserver.listen(PORT)
app.listen(PORT,"0.0.0.0",() =>{
    console.log(`connected at port ${PORT}`);
});



