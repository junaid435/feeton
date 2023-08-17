
const Wishlist=require('../../models/Wishlist_Model')


const addWishlist=async(req,res,next)=>{
    try {
        const product = req.body.proId
        const userId = req.session.userid
 
        if(userId===undefined){
            res.json({ NoUser: true})
        }

        const wishData = await Wishlist.findOne({ user: userId })
 
        if (wishData) {
            
            const existProduct = await Wishlist.findOne({ user: userId, 'products.productId': product })
            console.log(existProduct);
          
            if (existProduct) {
                res.json({ success: false, message: 'Product already exists' })
               

            } else {
                await Wishlist.findOneAndUpdate({ user: userId }, { $push: { products: { productId: product } } })
              
                res.json({ success: true })
            }

        } else {

            const wishlist = new Wishlist({
                user: userId,
                products: [{
                    productId: product
                }]
            })
               console.log(wishlist);
            const newWish = await wishlist.save()
          
          
            if (newWish) {
                res.json({ success: true })
            } else {
                res.json({ success: false, message: 'Something went wrong' })
            }
        }

    } catch (err) {
        next(err)
    }
}



const deleteWishlist = async (req , res , next) => {
    try {

        const productId = req.body.proId
        const wishData = await Wishlist.findOne({ user : req.session.userid })
        console.log(wishData);
        console.log(wishData.products.length);

        if(wishData.products.length === 1) {
            await Wishlist.deleteOne({ user : req.session.userid})
            
            res.json({ success : true })
        }else{
            await Wishlist.findOneAndUpdate({ user : req.session.userid } , {
                $pull : { products : { productId : productId }}
            })

            res.json({ success : true })
        }
        
    } catch (err) {
        next(err)
    }
}

module.exports = {

    addWishlist,
    deleteWishlist
}
