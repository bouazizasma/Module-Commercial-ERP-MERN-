const User = require("../Models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const createUser = async (req, res) => { 
  const{name,email,password}=req.body; 
const salt=await bcrypt.genSalt(10); 
const hash=await bcrypt.hash(password,salt); 
    const newUser=new User({ 
      name:name, 
      email:email, 
      password:hash, 
      }); 
      try { 
         await newUser.save(); 
  
         res.status(201).json(newUser ); 
     } catch (error) { 
         res.status(409).json({ message: error.message }); 
     } 
 }
 const generateAccessToken=(user) =>{ 
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' 
}); 
 
  } 
  const getuserBYEmail = async (req, res) => {  
    try { 
        const{email,password}=req.body; 
        const user = await User.findOne({email}); 
       if(user==""){  res.status(401).send('utilisateur non existant'); 
        return} ; 
        const isMatch=await bcrypt.compare(password,user.password); 
        if(!isMatch) res.status(400).json({msg:'mot de passe incorrect'}) 
        const accessToken = generateAccessToken(user); 
       res.status(200).json({ 
        accessToken 
      }) 
    } catch (error) { 
        res.status(404).json({ message: error.message }); 
    } 
} 
module.exports={createUser,getuserBYEmail};