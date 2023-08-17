const mongoose =require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_block:{
        type:Boolean,
        default:false
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_admin:{
        type:Number,
        default:0
    },
    wallet : {
        type : Number,
        default : 0
    },
    walletHistory: [
        {
          date: {
            type: Date,
          },
          amount: {
            type: Number,
          },
          description: {
            type: String,
          },
        },
      ],
})

module.exports= mongoose.model("User",userSchema)  