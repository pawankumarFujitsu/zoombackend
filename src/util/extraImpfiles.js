const express = require('express');
const bcrypt = require('bcryptjs');
const toSignUp = require('../models/signUp')
const nodemailer = require('nodemailer')
const updateTask = async function (otp,id) {

    // this is to update otp
    try{
       const UpdatedUser = await toSignUp.findByIdAndUpdate(id,{'otp' : otp},{new:true})
       
       return UpdatedUser;
   }
   catch(e){

   }
}

const passwordMatch=async function (sendPassword,dataBasePassword)
{
    var isMatch;
    try{
       isMatch = await bcrypt.compare(sendPassword,dataBasePassword);
    }
    catch(e)
    {
        console.log(e)
    }
    return isMatch;
}

const tofindvalue = async function (mail)
{
    const user = await toSignUp.findOne({mail});
    return user;
};
const mailSender = function(mail){
   
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'pawankuchoudhary2015@gmail.com',
          pass: 'QWERTY@0987654321'
        }
      });
      
    var mailOptions = {
        from: 'pawankuchoudhary2015@gmail.com',
        to: mail,
        subject: 'Forgot password OTP',
        text: 'Your one time password is '+otp
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            console.log('mail sent!!!!!')
        }
    });
    return otp;
}

module.exports={
    updateTask: updateTask,
    tofindvalue: tofindvalue,
    passwordMatch: passwordMatch,
    mailSender: mailSender
}