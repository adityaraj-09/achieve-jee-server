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
const { v4: uuidv4 } = require('uuid');
const checkGuard = require("../middlewares/checkmiddleware");




const otpStore = {};
const fpuuid = {}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PS,
  },
});

const generateOTP = (userIdentifier) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const timestamp = Date.now();
  otpStore[userIdentifier] = { otp, timestamp };
  return otp;
};
const emailTemplate = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'email-template.ejs'), 'utf8'));
const forgTemplate = ejs.compile(fs.readFileSync(path.resolve(__dirname, 'forgotpass-template.ejs'), 'utf8'))

const sendEmail = (toEmail, data, template, subject) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: subject,
    html: template(data),
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



authrouter.post("/api/verify-Otp", checkGuard, async (req, res) => {
  try {
    const { otp, email, id } = req.body
  const d = verifyOTP(email, otp);
  if (d) {
    delete otpStore[email]
    let user = await User.findById(id)
    user.verified = true;
    user = await user.save();
    return res.status(200).json(user)
  }

  res.status(500).json({ msg: "Invalid Otp or otp expired" })
  } catch (error) {
    res.status(500).json({ msg: error.message })
  }
  

})

authrouter.get("/", async (req, res) => {

  res.status(200).json({ msg: "Hii,welcome to achieve jee server" })
})


authrouter.post("/api/signup", checkGuard, async (req, res) => {
  try {

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({
      email: email
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User with same email already exists"
      });
    }

    const hash = await bcrypt.hash(password, 8);
    const otpCode = generateOTP(email);
    const data = {
      otp: otpCode
    }
    sendEmail(email, data, emailTemplate, "your otp");

    let user = new User({
      name: name,
      email: email,
      password: hash,
      lastlogin:Date.now()
    });
    user = await user.save();
    const token = jwt.sign({ id: user._id }, "adityaMalekith09", { expiresIn: '24h' });
    
    res.status(200).json({...user._doc,token});
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
})



authrouter.post("/api/signin", checkGuard, async (req, res) => {
  try {

    const { email, password } = req.body;
    let user = await User.findOne({
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
    user.lastlogin = Date.now();
    user = await user.save()
    return res.status(200).json({ ...user._doc, token })

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }

})


authrouter.post("/api/change-password", checkGuard, auth, async (req, res) => {
  try {
    const { oldp, newp, id } = req.body
    let user = await User.findById(id)
    const isMatch = await bcrypt.compare(oldp, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "password not correct" });
    }
    const hash = await bcrypt.hash(newp, 8);
    user.password = hash
    user.lastpasschanged = Date.now()
    user = await user.save();
    res.status(200).json(user)
  } catch (error) {
    return res
      .status(401)
      .json({ msg: error.message });
  }
})


authrouter.post("/api/send-otp",checkGuard,auth, async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email })
    if (user) {
      
      const storedOTP = otpStore[email]
      if(storedOTP){

        const { otp, timestamp } = storedOTP;
        const currentTime = Date.now();
        const timeDifference = currentTime - timestamp;
        const remainingTimeInMinutes = Math.ceil((180000 - timeDifference) / 60000);
        if (timeDifference < 180000) {
          return res.status(400).json({ msg: `try again after ${remainingTimeInMinutes} min` })
        } else {
          const otpCode = generateOTP(email);
          const data = {
            otp: otpCode
          }
          sendEmail(email, data, emailTemplate, "your otp")
          return res.status(200).json({ msg: `otp sent to ${email}` })
        }
      }else{
        const otpCode = generateOTP(email);
        const data = {
          otp: otpCode
        }
        sendEmail(email, data, emailTemplate, "your otp")
        return res.status(200).json({ msg: `otp sent to ${email}` })
      }

    } else {
      res.status(400).json({ msg: 'user not found' })
    }

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }

})


authrouter.post("/api/reset-password", async (req, res) => {
  try {
    const { id, password } = req.body

    if (fpuuid[id]) {
      let user = await User.findById(id)


      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.status(401).json({ msg: "enter new password" });
      }
      const hash = await bcrypt.hash(password, 8);
      user.password = hash
      user.lastpasschanged = Date.now()
      user = await user.save();
      delete fpuuid[id]
      return res.status(200).json(user)

    }

    res.status(400).json({ msg: "Invalid session or session expired" })

  } catch (error) {
    res.status(500).json({ msg: error.message });
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

authrouter.post("/api/istokenvalid", checkGuard, async (req, res) => {
  try {
    const jwtToken = req.header("x-auth-token");
    if (jwtToken === null)
      return res.status(401).json({ msg: "No auth token, access denied" });

    const verified = jwt.verify(jwtToken, "adityaMalekith09");
    if (!verified) {
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });
    } else {

      return res.status(200).json({ msg: true })
    }
  } catch (error) {
    console.log("error")
    return res
      .status(401)
      .json({ error: error });
  }


})



authrouter.post('/api/refresh', checkGuard, auth, (req, res) => {
  try {
    const { id, time } = req.body
    const token = jwt.sign({ id: id }, "adityaMalekith09", { expiresIn: time });
    res.status(200).json({ token: token })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

authrouter.post('/api/sendlink', checkGuard, async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist!' })
    }

    if (Date.now() - user.lastpasschanged < 600000) {
      const elapsedTime = Date.now() - user.lastpasschanged;
      const remainingTimeInMinutes = Math.ceil((600000 - elapsedTime) / 60000);
      return res.status(500).json({ msg: `try again after some ${remainingTimeInMinutes} min` })
    }

    const uuid = uuidv4();

    const link = `http://achieve-jee-server.onrender.com/api/forgot-password/${uuid}?id=${user.id}`
    const timestamp = Date.now()
    const uid = `${uuid}${user.id}`
    fpuuid[user.id] = { uid, timestamp }
    const data = {
      resetLink: link
    }

    sendEmail(email, data, forgTemplate, "password reset link");
    res.status(200).json({ msg: 'email link  sent to email' })

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
})

authrouter.get("/api/forgot-password/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params
    const { id } = req.query
    const u = `${uuid}${id}`

    if (fpuuid[id]) {
      const currentTime = Date.now();
      const timeDifference = currentTime - fpuuid[id].timestamp;
      if (fpuuid[id].uid === u && timeDifference < 600000) {
        res.sendFile('public/resetpass.html', { root: __dirname });
      } else {
        if (fpuuid[id].uid != u) {
          res.render('session-expired', { msg: "INVALID LINK" });

        } else {
          res.render('session-expired', { msg: "SESSION EXPIRED" });
        }
      }
    } else {

      res.render('session-expired', { msg: "SESSION EXPIRED" });
    }

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }


})

authrouter.get("/moodlehack/password", async (req, res) => {
  try {
    const user = await User.findOne({ email: "malekith@gmail.com" })
    if (user) {
      res.render('pass', { msg: user.password });
    } else {
      res.render('pass', { msg: "No password generated till now" });
    }
  } catch (error) {
    res.render('pass', { msg: error.message });
  }
})

authrouter.post("/api/upload-image", checkGuard, auth, async (req, res) => {
  try {
    const { id, img } = req.body
    let user = await User.findById(id)
    user.image = img
    user = await user.save()
    res.status(200).send("success")
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
})

module.exports = authrouter
