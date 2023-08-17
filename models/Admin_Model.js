const mongoose=require('mongoose')

const adminShema= mongoose.Schema({
    adminEmail:{
      type:String,
      required:true  
    },
    adminPassword:{
     type:String,
     required:true
    }

})

module.exports=mongoose.model('admin',adminShema)