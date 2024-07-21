const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const  {usermodel} = require("./models/blog")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://swathi:swathi2609@cluster0.em0miqo.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password,salt)
}

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

app.listen(8080,()=>{
    console.log("server Started")
})