const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt")
const User = require("../models/user");
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const auth = require("../middlewares/authMiddleware")
const authrouter = express.Router();
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'aditya7903928568@gmail.com',
    pass: 'password',
  },
});

const generateOTP = () => {
  const otp=Math.floor(100000 + Math.random() * 900000).toString();
  const timestamp = Date.now();
  otpStore[userIdentifier] = { otp, timestamp };
  return otp;
};
const emailTemplate = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'email-template.ejs'), 'utf8'));

const sendOTPEmail = (toEmail, otp) => {
  const mailOptions = {
    from: 'aditya7903928568@gmail.com',
    to: toEmail,
    subject: 'Your OTP Code',
    html: emailTemplate({ otp: otp }),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP email:', error);
    } else {
      console.log('OTP email sent:', info.response);
    }
  });
};

function verifyOTP(userIdentifier, enteredOTP) {
  const storedOTP = otpStore[userIdentifier];

  if (!storedOTP) {
    return false;
  }

  const { otp, timestamp } = storedOTP;
  const currentTime = Date.now();
  const timeDifference = currentTime - timestamp;
  
  if (otp === parseInt(enteredOTP, 10) && timeDifference <= 600000) { // 10 minutes in milliseconds
    return true;
  } else {
    return false;
  }
}



authrouter.get("/api/verify-Otp",async (req,res)=>{
  const {otp,email,id}=req.body
  const d= verifyOTP(email,otp);
  if(d){

    let user=await User.findById(id)
    user.verified=true;
    user=await user.save();
    return res.status(200).json(user)
  }

  res.status(500).json({msg:"Invalid Otp or otp expired"})
  
})
authrouter.get("/",async (req,res)=>{
  
  res.status(200).json({msg:"Hii,welcome to achieve jee server"})
})
authrouter.post("/api/signup", async (req, res) => {
  try {

    const { name, email, password, address, phone, image } = req.body;
    const existingUser = await User.findOne({
      email: email
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User with same email already exists"
      });
    }


    const hash = await bcrypt.hash(password, 8);
    const otpCode = generateOTP();
    sendOTPEmail(email, otpCode);

    let user = new User({
      name: name,
      email: email,
      password: hash,
      address: address,
      phone: phone,
      image: image
    });

    user = await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

authrouter.post("/api/signin", async (req, res) => {
  try {

    const { email, password } = req.body;
    const user = await User.findOne({
      email: email
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "password not correct" });
    }

    const token = jwt.sign({ id: user._id }, "adityaMalekith09", { expiresIn: '24h' });
   
    return res.status(200).json({...user._doc,token})

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

})



authrouter.get("/api/getData", auth, async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({
    email: email
  });

  if (!user) {
    return res
      .status(400)
      .json({ msg: "User with this email does not exist!" });
  }

  res.status(200).json(user);
})

authrouter.post("/api/istokenvalid", async (req, res) => {
  try {
    const jwtToken = req.header("x-auth-token");
    if (jwtToken===null)
     return res.status(401).json({ msg: "No auth token, access denied" });
  
    const verified = jwt.verify(jwtToken, "adityaMalekith09");
    if (!verified ) {
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });
    }else{

     return res.status(200).json({msg:true})
    }
  } catch (error) {
    console.log("error")
    return res
      .status(401)
      .json({ error: error });
  }
  
  
})



authrouter.post('/api/refresh', (req, res) => {
  if (req.cookies?.jwt) {
      const refreshToken = req.cookies.jwt;
      jwt.verify(refreshToken,"rishabhMalekith09", 
      (err, decoded) => {
          if (err) {
              return res.status(406).json({ message: 'Unauthorized' });
          }
          else {
             
              const accessToken = jwt.sign({ id: "adityaMalekith09" }, "adityaMalekith09", { expiresIn: '10m' });
              return res.json({ accessToken });
          }
      })
  } else {
      return res.status(406).json({ message: 'Unauthorized' });
  }
})
module.exports = authrouter

