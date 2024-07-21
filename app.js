const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const  {usermodel} = require("./models/blog")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://swathi:swathi2609@cluster0.em0miqo.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
}

//api for signUp
app.post("/signup",async (req,res)=>{
    let input = req.body
    let hashedPassword = bcrypt.hashSync(req.body.password,10)
    console.log(hashedPassword)
    usermodel.find({email:input.email}).then(
        (items)=>{
            if (items.length>0) 
                {
                    res.json({"status":"email already exists"})
                } 
                else
                {
                   let result=new usermodel(input)
                   result.save() 
                   res.json({"status":"success"})
                }
        }
    ).catch((error)=>{})
})

//api for signIn
app.post("/signin",async(req,res)=>{
    let input = req.body
    let result=usermodel.find({email:req.body.email}).then(
        (response)=>{
            if(response.length>0){
                const passwordValidator = bcrypt.compare(input.password,response[0].password)
                    if(passwordValidator)
                        {
                        jwt.sign({email:input.email},"blog-app",{expiresIn:"1d"},
                            (error,token)=>{
                                if(error){
                                    res.json({"status":"error","errorMessage":error})
                                }
                                else{
                                    res.json({"status":"success","token":token,"userId":response[0]._id})
                                }
                            })
                    }
                    else{
                        res.json({"status":"incorrect password"})
                    }
                }
            else
            {
                res.json({"status":"Invalid Email Id"})
            }
                }).catch()
})
//api View User
app.post("/viewuser",(req,res)=>{
    let token = req.headers["token"]
    jwt.verify(token,"blog-app",(error,decoded)=>{
        if(error){
            res.json({"status":"unauthorized access"})
        }else{
            if(decoded){
                usermodel.find().then(
                    (response)=>{
                        res.json(response)
                    }
                ).catch()
            }
        }
    })
    })

app.listen(8080,()=>{
    console.log("server Started")
})