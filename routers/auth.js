const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt")
const User = require("../models/user");
const auth = require("../middlewares/authMiddleware")
const authrouter = express.Router();
const jwt = require("jsonwebtoken")

authrouter.get("/",async (res,res)=>{
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

      // Destructuring refreshToken from cookie
      const refreshToken = req.cookies.jwt;

      // Verifying refresh token
      jwt.verify(refreshToken,"rishabhMalekith09", 
      (err, decoded) => {
          if (err) {

              // Wrong Refesh Token
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

