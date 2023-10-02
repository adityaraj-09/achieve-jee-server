const express=require("express");
const mongoose=require("mongoose")
const cors =require("cors")
const PORT =8000

const authRouter=require("./routers/auth");
const adminrouter=require("./routers/admin")
const examrouter=require("./routers/exam")
const app=express();
const DB="mongodb+srv://aditya:adi123@cluster0.pxaqtot.mongodb.net/?retryWrites=true&w=majority";
app.use(cors())
app.use(express.json())
app.use(authRouter)
app.use(adminrouter)
app.use(examrouter)
mongoose.connect(DB).then(()=>{
    console.log("connection sucessful")
}).catch((e) => {
    console.log(e);
});

app.listen(PORT,"0.0.0.0",() =>{
    console.log(`connected at port ${PORT}`);
});



