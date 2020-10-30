const express = require('express')
const cors = require('cors')
const auth = require('../middleware/auth')
const toSignUp = require('../models/signUp')
require('../db/mongoose')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs');
const {updateTask,tofindvalue,passwordMatch,mailSender} = require('../util/extraImpfiles')
const loginRouter = express.Router();


// for new registration user
loginRouter.post('/register',(request,response)=>{
    console.log('add user regiseration',request.body.mail);
    const signUpDetail= new toSignUp(request.body);
    console.log(signUpDetail);
    signUpDetail.save().then((res)=>{
        console.log(res);
       return response.status(200).json({status: request.body.mail+'Registered' });
    }).catch((e)=>{
        console.log(e.message)
    });


    //response.render('index');
});






// use for login controller
loginRouter.post('/login',async (request,response) =>{
    console.log('login'+request.body.mail);
    if(request.body.mail == '')
    {
        return response.json({Status:'credential not correct'});
    }
    else{
        var valueOfSign = await tofindvalue(request.body.mail);
        console.log(valueOfSign)
        
        var isMatch = await passwordMatch(request.body.password,valueOfSign.password)
        
        if(!isMatch)
        {
            response.json({Status:'credential not correct'});
        }
        else{
            //const user = new toSignUp(valueOfSign);
            //console.log(user)
            var token = await valueOfSign.authenticationToken();
            //response.cookie('token',token,{ maxAge:  600000, httpOnly: true ,secure:false})\
            response.status(200).json({
                'token' : token,
                'isloggedIn' : true
            })
            console.log(token)
        }
       // return response.send({'email' : 'pawan.kumar@fujitsu.com'})
        //return response.status(401).send('no user exists in db to update');
       // response.redirect('/readMembers')
    }
});



loginRouter.post('/logout',auth,(request,Response)=>{
    request.userLoged.token=[];
    request.userLoged.save();
    response.render('index')
})

module.exports = loginRouter