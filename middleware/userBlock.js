const user=require('../models/User_Model')
 
 const userblockCheck=async(req,res,next)=>{
    if(req.session.userid!==undefined){
        const userData=await user.findById({_id:req.session.userid})
       
        if (userData.is_block===true) {
            req.session.destroy()
            res.redirect('/login')
        }else{
            next()
        }
    }else{
        next()
    }
 }

module.exports=userblockCheck