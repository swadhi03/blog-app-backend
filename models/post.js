const mongoose = require("mongoose")
const schema=mongoose.Schema(
    {
        userId:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
        message:{type:String},
        postdate:{type:String}
    }
)
var postmodel=mongoose.model("posts",schema)
module.exports=postmodel