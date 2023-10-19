const express=require("express");
const mongoose=require("mongoose")
const cors =require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT =8000
const adminrouter=require("./routers/admin")
const userrouter=require("./routers/auth")
const examrouter=require("./routers/exam");
const { Socket } = require("dgram");
const app=express()
const DB="mongodb+srv://aditya:adi123@cluster0.pxaqtot.mongodb.net/?retryWrites=true&w=majority"
app.use(cors())
app.use(express.json())
app.use(express.static('public'));
app.use(adminrouter)
app.use(userrouter)
app.use(examrouter)
const httpserver=new createServer(app)
const io=new Server(httpserver,{ 
  cors: {
    origin: true,
   
  },
  allowEIO3: true,})


  



io.on("connection",(Socket)=>{
    Socket.on("start-timer",async ({uid,pid,dur})=>{
      if(!io.sockets.adapter.rooms.get(uid+pid)){

        Socket.join(uid+pid)
      }
        let time=dur;
        function gameInterval() {
          if (time >= 0) {
            const timeFormat = calculateTime(time);
            console.log(time)
            io.to(uid + pid).emit("timer", {
              countDown: timeFormat,
              msg: "Time Remaining"
            });
    
            time--;
          }
        }
        gameInterval();
    
        const timerId = setInterval(gameInterval, 1000);
    
        
        if (time < 0) {
          clearInterval(timerId);
        }
    })
})
const calculateTime=(time) =>{
    let min=Math.floor(time/60);
    let sec=time%60;
    return `${min}:${sec<10?"0"+sec:sec}`;
    
  }
  

mongoose.connect(DB).then(async()=>{
    console.log("connected to mongodb")
}).catch((e) => {
    console.log(e);
});


httpserver.listen(PORT,"0.0.0.0",() =>{
    console.log(`connected at port ${PORT}`);
});



