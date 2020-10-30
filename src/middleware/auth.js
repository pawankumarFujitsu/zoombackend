const jwt = require('jsonwebtoken');
const userModel = require('../models/signUp');
const auth = async(req,resp,next) =>{
   try{
       console.log('auth methods')
        const token = req
    
        if(req.cookies.token==undefined)
        {  
            return resp.render('index');
        }
        const decode = jwt.verify(req.cookies.token,'mysecrete');
        
        const user = await userModel.findOne({_id:decode._id,'tokens.token':req.cookies.token});
        
        if(!user)
        {
            throw new Error();
        }
        req.token = req.cookies.token
        req.userLoged = user
        
   } catch(e){
        resp.cookies.set('token', {expires: Date.now()});   
       resp.status(401).send({error: 'please author'});
       resp.render('index')
   }
   next();
};


module.exports = auth;