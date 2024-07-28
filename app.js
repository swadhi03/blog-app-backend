const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const  usermodel = require("./models/blog")
const postmodel = require("./models/post")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://swathi:swathi2609@cluster0.em0miqo.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0")


//api for signUp
app.post("/signup",async (req,res)=>{
    let input = req.body
    let hashedPassword = bcrypt.hashSync(req.body.password,10)
    console.log(hashedPassword)
    req.body.password=hashedPassword
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
    let input=req.body
    let result=usermodel.find({email:req.body.email}).then(
        (items)=>{
        if (items.length>0) {
            const passwordValidator=bcrypt.compareSync(req.body.password,items[0].password)
            if (passwordValidator) {
                jwt.sign({email:req.body.email},"blog-app",{expiresIn:"1d"},
                    (error,token)=>{
                        if (error) {
                            res.json({"status":"error","errorMessage":error})
                        } else {
                            res.json({"status":"success","token":token,"userId":items[0]._id})
                        }
                    })
            } else {
                res.json({"status":"Incorrect Password"})
            }
        } else {
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
//api createPost
app.post("/create",async(req,res)=>{
    let input=req.body
    let token=req.headers.token
    jwt.verify(token,"blog-app",async(error,decoded)=>{
        if (decoded && decoded.email) {
            let result=new postmodel(input)
            await result.save()
            res.json({"status":"success"})
        } else {
           res.json({"status":"Invalid authentication"}) 
        }
    })
})

//api viewAll
app.post("/viewall",(req,res)=>{
    let token=req.headers.token
    jwt.verify(token,"blog-app",(error,decoded)=>{
        if (decoded && decoded.email) {
            postmodel.find().then(
                (items)=>{
                    res.json(items)
            }).catch(
                (error)=>{
                res.json({"status":"error"})
            })
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
})

//api View My Post
app.post("/mypost",(req,res)=>{
    let input = req.body
    let token=req.headers.token
    jwt.verify(token,"blog-app",(error,decoded)=>{
        if (decoded && decoded.email) {
            postmodel.find(input).then(
                (items)=>{
                    res.json(items)
            }).catch(
                (error)=>{
                res.json({"status":error})
            })
        } else {
            res.json({"status":"Invalid Authentication"})
        }
    })
})

app.listen(8080,()=>{
    console.log("server Started")
})