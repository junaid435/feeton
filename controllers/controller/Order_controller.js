const Order=require('../../models/Order_Model')
const Cart=require('../../models/Cart_Models')
const User=require('../../models/User_Model');
const Product=require('../../models/Product_Model')
const Razorpay = require('razorpay');
const Coupon=require('../../models/Coupon_Model');
const { log } = require('console');


var instance = new Razorpay({
  key_id: process.env.Razorpay_KEY_ID,
  key_secret: process.env.Razorpay_KEY_SECRET,
});


const Proceed =async(req,res,next)=>{
     try {
         
       
        const code=req.session.code
    
       const userid =req.session.userid
       const address=req.body.address 
       const payment=req.body.payment
       const grandTotal=req.body.total
       const user = await User.findOne({ _id : userid })
       const cartData = await Cart.findOne({ userId : userid })
       
       
       const cartProducts = cartData.items
       let status = payment == 'cod' ? 'placed' : 'pending'
       const orderDate = new Date(); 
       const delivery = new Date(orderDate.getTime() + (10 * 24 * 60 * 60 * 1000)); // Add 10 days to the order date
       const deliveryDate = delivery.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-');

       const orderDataUser = await Order.find({ user: userid });

       function generateOrderID() {
         // Generate a random number between 1000 and 9999
         const randomNum = Math.floor(Math.random() * 900000) + 100000;
       
         // Concatenate date and time components with the random number
         const orderID = randomNum;
       
         return orderID;
       }
       
    
       
       if (!orderDataUser[0]) {
         orderIdSample = 0;
         orderIdSample = orderIdSample + generateOrderID();
       } else {
         orderIdSample = Number(orderDataUser[0].orderID) ;
     
         for (let i = 1; i <= orderDataUser.length; i++) {
      
            ab=orderIdSample+=1;  
           
         }
       }
       
       
       if(payment==='wallet'){
        const userid=req.session.userid
        await User.findByIdAndUpdate({_id:userid},{$inc:{wallet:-grandTotal},$push: {
          walletHistory: {
            date: new Date(),
            amount: -grandTotal,
            description: `Buy product with wallet - Order ${orderIdSample}`,
          },
        },})
        status='placed'
      
       }

      

       const order = new Order({
         user : userid,
         deliveryAddress : address,
         userName : user.name,
         totalAmount : grandTotal,
         status : status,
         date : orderDate,
         payment : payment,
         products : cartProducts,
         expectedDelivery : deliveryDate,
         orderID:orderIdSample
     })
 
     const orderData = await order.save() 
if(status=='placed'){
await Coupon.findOneAndUpdate({code:code},{$push:{user:userid}})
  res.json({ codSuccess:true})
  for(let i=0;i<cartProducts.length;i++){
    await Product.findByIdAndUpdate({_id:cartProducts[i].product_Id},{$inc:{
     stock:-cartProducts[i].quantity
    }})
  }
  await Cart.findOneAndDelete({userId:userid})  
}else{
  
  var options = {
    amount: orderData.totalAmount * 100,
    currency: "INR",
    receipt: "" + orderData._id,
    notes: code,
  };
  
instance.orders.create(options, function (err, order) {
  if (err) {
    console.error(err); // Handle any errors that occurred during the API call
   
  } else {
    
    res.json({ order }); // Send the order details back to the client
  }
});

}


      
     } catch (err) {
       next(err)
     }
 }  
 

 const loadOrderPlaced=async(req,res,next)=>{
     try {
           const id=req.session.userid
          const order=await Order.findOne({user:id}).populate(
            "products.product_Id"
          ).sort({date:-1})
    
         res.render('orderSuccessfully',{order})
         
     } catch (err) {
       next(err)
     }
 }
 


 const validatePaymentVerification = async (req, res) => {
  try {
    const  body  = req.body;
  
    const { userid } = req.session;
    var crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.Razorpay_KEY_SECRET);
    hmac.update(
      body.payment.razorpay_order_id + "|" + body.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac === body.payment.razorpay_signature) {
      
      const items = await Order.findByIdAndUpdate(
        { _id: body.order.receipt },
        { $set: { paymentId: body.payment.razorpay_payment_id } }
      );
      await Order.findByIdAndUpdate(
        { _id: body.order.receipt },
        { $set: { status: 'placed' } }
      );
      for (let item of items.products) {
        await Product.updateOne(
          { _id: item.product_Id },
          { $inc: { stock:-item.quantity } }
        );
      }
      await Cart.deleteOne({ userId: userid });
      res.json({ success: true });
    }if(body.order.notes){
      const code=body.order.notes.join('')
      await Coupon.findOneAndUpdate({code:code},{$push:{user:req.session.userid}})
    }
  } catch (error) {
    console.log(error.message);
  }
};


const orderCancel=async(req,res,next)=>{
  try {
   const orderId=req.body.OrderId
   const quantity=req.body.quantity
   const productId=req.body.productId
   const payment=req.body.payment
   const userid=req.session.userid
   const price =req.body.price
  
   const orderDAta=await Order.findOneAndUpdate({ _id: orderId,'products.product_Id':productId},{$set:{ "products.$.status":"cancelled"}})
   await Product.findByIdAndUpdate({_id:productId},{$inc:{stock:quantity}})
   if(payment=="razorpay"){

 await User.findByIdAndUpdate({_id:userid},{$inc:{wallet:price},$push: {
  walletHistory: {
    date: new Date(),
    amount: price,
    description: `Refunded for Order cancel - Order ${orderDAta.orderID}`,
  },
},})
   }
   res.json({ success: true });
  }

   catch (err) {
  next(err)
  }
}

const orderReturn=async(req,res,next)=>{
  try {
    const userid=req.session.userid
    const orderId=req.body.OrderId
    const price =req.body.price
    const productId=req.body.productId
    const quantity=req.body.quantity
   
    
 
    
    const orderDAta= await Order.findOneAndUpdate({ _id: orderId,'products.product_Id':productId},{$set:{ "products.$.status":"returned"}})
       await Product.findByIdAndUpdate({_id:productId},{$inc:{stock:quantity}})
       await User.findByIdAndUpdate({_id:userid},{$inc:{wallet:price},$push: {
        walletHistory: {
          date: new Date(),
          amount: price,
          description: `Refunded for order Return - Order ${orderDAta.orderID}`,
        },
      },})
    res.json({ success: true });
  } catch (err) {
  next(err)
  }
}

const CouponCheak =async(req,res,next)=>{
  try {
   const couponCode=req.body.couponCode
   const avgprice=[]
  const total = req.body.total
  const couponData = await Coupon.findOne({ code : couponCode })

  
  if(couponData) {
    const userExist = couponData.user.find((u) => u.toString() == req.session.userid)
    if(userExist) {
      res.json({failed:true})
    }else{
      req.session.code=couponCode
      const discountTotal = Math.floor((couponData.discountPercentage/100)*total)
      
        const cartDatacc=await Cart.findOneAndUpdate(
          { userId: req.session.userid },
          {
            $inc: { grandTotal: -discountTotal },
          $push: {
            cuoponCode: {
              code: couponCode,
              incprice: discountTotal
            }
          },
          
        }
        );
        const cartDataUpdate=await Cart.findOne({userId:req.session.userid})
          for(let i=0;i<cartDataUpdate.items.length;i++){
            avgprice.push(Math.floor(cartDataUpdate.items[i].total-(couponData.discountPercentage/100)*cartDataUpdate.items[i].total))
          }
        
      for (let i = 0; i < avgprice.length; i++) {
         await Cart.findOneAndUpdate(
          { userId: req.session.userid, "items._id": cartDatacc.items[i]._id },
          { $set: { "items.$.total": avgprice[i] } },
          { new: true }
        );
      }
     
      
     res.json({success:true})
      }
   }else{
    res.json({failed:true})
   }
  } catch (err) {
  next(err)
  }
}

const CouponRemove=async(req,res,next)=>{
  try {
    const value=req.body.value
    const avgprice=[]
   const cartDatacc =await Cart.findOneAndUpdate(
      { userId: req.session.userid },
      {
        $inc: { grandTotal: value },
        $unset: { cuoponCode:1 }
      }
    );
    req.session.code=null
    for(let i=0;i<cartDatacc.items.length;i++){
      avgprice.push(cartDatacc.items[i].quantity*cartDatacc.items[i].price)
    }
  
    for (let i = 0; i < avgprice.length; i++) {
      ab = await Cart.findOneAndUpdate(
      { userId: req.session.userid, "items._id": cartDatacc.items[i]._id },
      { $set: { "items.$.total": avgprice[i] } },
      { new: true }
    );
  }

    res.json({success:true})
  } catch (err) {
  next(err)
  }
}

const loadOrderView=async(req,res,next)=>{
  try {
    const id= req.query.id
   
     const userId= req.session.userid
    const order=await Order.findOne({user:userId,status:"placed",orderID:id}).populate(
      "products.product_Id"
    );
   
    res.render('Order_detail',{order})
    
  } catch (err) {
  next(err)
  }
}
module.exports={
     Proceed,
     loadOrderPlaced,
     validatePaymentVerification,
     orderCancel,
     orderReturn,
     CouponCheak,
     CouponRemove,
     loadOrderView
}