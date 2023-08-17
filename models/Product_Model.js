const mongoose =require('mongoose')

const productSchema = new mongoose.Schema({
 ProductId:{
    type:String,
    required:true
 },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true

    },

    image:{
        type:Array,
        required:true
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        requre:true

    },
    stock:{
        type:Number,
        required:true
    },
    blocked :{
        type : Boolean,
        default : false
    }

},
{
    timestamps: true
})



module.exports=mongoose.model('product',productSchema)