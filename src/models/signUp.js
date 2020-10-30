const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const signUpSchema= new mongoose.Schema({
    mail:{
        type: String
    },
    password:{
        type: String
    },
    confirmpassword:{
        type: String
    }
});

signUpSchema.pre('save', async function(next) {
    const sign = this;
    console.log('hash password!!!')
    if(sign.isModified('password'))
    {
       
        sign.password = await bcrypt.hash(sign.password,8);
        console.log('hiiiiiiii',sign.password);
    }
    next();
});

signUpSchema.methods.authenticationToken = async function(){
    console.log('autherization tokens')
    const sign = this;
    const token = jwt.sign({_id : sign._id.toString()},'mysecrete')
    sign.tokens=sign.tokens.concat({token})
    return token;
};

const signup = mongoose.model('UserDetails',signUpSchema);

module.exports = signup;