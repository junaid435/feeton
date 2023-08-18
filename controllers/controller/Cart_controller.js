const Cart = require('../../models/Cart_Models')
const Product = require('../../models/Product_Model')
const address = require('../../models/Address_Model')
const mongoose = require("mongoose");
const User = require('../../models/User_Model')
const coupon = require('../../models/Coupon_Model')




const loadcart = async (req, res,next) => {
    try {
        const userid = req.session.userid;
        const products = await Cart.findOne({ userId: userid }).populate(
            "items.product_Id"
        );
  
        res.render("Cart", { products });
    } catch (err) {
       next(err)
    }
}


const loadProceed = async (req, res,next) => {
    try {
        let date=new Date()
        const couponData = await coupon.find()
        if(couponData){
for(let i=0;i<couponData.length;i++){
    if(couponData[i].expireDate<date){
await coupon.findByIdAndDelete({_id:couponData[i]._id})
    }
   
}
        }
        
        const userid = req.session.userid;
        const UserData=await User.findById({_id:userid})
        const products = await Cart.findOne({ userId: userid }).populate(
            "items.product_Id"
        );
        const dataAddress = await address.findOne({ user: userid })


        res.render('Proceed', { products, dataAddress, couponData,UserData })

    } catch (err) {
       next(err)
    }
}


const AddCart = async (req, res,next) => {
    try {
        const userid = req.session.userid
        const quantity = req.body.product_quantity
        const product_Id = req.body.product_Id

        const promises = [await Cart.findOne({ userId: userid }),
        await Product.findOne({ _id: product_Id })]
        const result = await Promise.all(promises)
        const cartdata = result[0]
        const productData = result[1]
        const total = quantity * productData.price
        
        if (cartdata) {
            const findProduct = await Cart.findOne({
                userId: userid,
                "items.product_Id": new mongoose.Types.ObjectId(product_Id),
            });
            if (findProduct) {
                const cartProduct = cartdata.items.find(
                    (product) => product.product_Id.toString() === product_Id
                );
                if (cartProduct.quantity < productData.stock) {
                    await Cart.findOneAndUpdate({
                        userId: userid,
                        'items.product_Id': new mongoose.Types.ObjectId(product_Id)
                    }, {
                        $inc: {
                            'items.$.quantity': quantity,
                            'items.$.total': total,
                            grandTotal: total
                        }
                    }
                    )
                    res.json({ count: 'ADDED' });
                }else{
                    res.json({ limit: "limit exceeded" });
                }
            } else {
                await Cart.updateOne(
                    { userId: userid },
                    {
                        $push: {
                            items: {
                                product_Id: new mongoose.Types.ObjectId(product_Id),
                                quantity: quantity,
                                total: total,
                                price: productData.price
                            },
                        },
                        $inc: { count: 1, grandTotal: total },
                    }
                );
                res.json({ count:'ADDED'});
            }
        }
        else {
            const NewCart = new Cart({
                userId: userid,
                items: [{
                    product_Id: new mongoose.Types.ObjectId(product_Id),
                    quantity: quantity,
                    total: total,
                    price: productData.price
                }],
                grandTotal: total,
                count: 1
            })

            const data = await NewCart.save()

        }
    }
    catch (err) {
       next(err)
    }
}


const changes = async (req, res,next) => {
    try {
        const count = req.body.count;
        const productId = req.body.productId;

        const cart = await Cart.findOne({ userId: req.session.userid });
        const product = await Product.findOne({ _id: productId });

        const cartProduct = cart.items.find(
            (product) => product.product_Id.toString() === productId
        );

        if (count == 1) {
            if (cartProduct.quantity < product.stock) {
                 await Cart.findOneAndUpdate(
                    { userId: req.session.userid, 'items.product_Id': productId }, {
                    $inc: {
                        'items.$.quantity': 1,
                        'items.$.total': product.price,
                        grandTotal: product.price

                    }
                })
                const value=await Cart.findOne({userId:req.session.userid})
            console.log(value);
                res.json({ success:true,value});
            } else {
                res.json({ success: false, message: `The maximum quantity available for this product is ${product.stock} . Please adjust your quantity.` })
            }
        } else if (count == -1) {
            if (cartProduct.quantity >= 2) {
              await Cart.findOneAndUpdate(
                    { userId: req.session.userid, 'items.product_Id': productId }, {
                    $inc: {

                        'items.$.quantity': -1,
                        'items.$.total': -product.price,
                        grandTotal: -product.price
                    }
                })
                 const value=await Cart.findOne({userId:req.session.userid})
               
                res.json({ success: true,value})

            } else {
                res.json({ success: false, message: 'Cannot decrement the quantity anymore' })
            }
        } else {
            res.json({ success: false, message: 'Invalid count value' })
        }
    } catch (err) {
       next(err)
    }
}


const CartRemove = async (req, res,next) => {
    try {
        const id = req.query.id
        const userid = req.session.userid
        const price = req.query.price

        console.log(price);
      await Cart.findOneAndUpdate(
            { userId: userid},
            { $inc: { grandTotal: -price } }
        );

        const ab=await Cart.findOneAndUpdate({ userId: userid }, { $pull: { 'items': { product_Id: id } } })
       
        if(ab.items.length==1){
            await Cart.findOneAndDelete({userId:userid})
        }
        res.redirect("/Cart")

    } catch (err) {
       next(err)
    }
}

module.exports = {
    loadcart,
    loadProceed,
    AddCart,
    changes,
    CartRemove


}