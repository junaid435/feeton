const express = require('express')
const user_route = express()
const user_controller = require('../controllers/user_controllers')
const address_controller = require('../controllers/controller/Address_controller')
const Cart_controller = require('../controllers/controller/Cart_controller')  
const Order_controller=require('../controllers/controller/Order_controller')
const wishlistController =require('../controllers/controller/WishlistController')
const errorHandler =require('../middleware/errorHandler')
require('dotenv').config();
const session=require('express-session')
user_route.use(session({secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false}))

user_route.set('view engine' , 'ejs')
user_route.set('views' , './views/user')
const user_auth=require('../middleware/user_auth')
const userblockCheck=require('../middleware/userBlock')



//TO load home page 
user_route.get('/' , user_controller.loadHome)
//TO load login page
user_route.get('/login' ,user_auth.UserisLogin, user_controller.loadlogin)
//TO verify the user
user_route.post('/login' , user_controller.verifyLogin)
//TO load signup page
user_route.get('/register',user_auth.UserisLogin,user_controller.loadsign_up)
//Insert the user 
user_route.post('/register',user_controller.insertUser)
//To load the otp page 
user_route.get('/otp',user_auth.UserisLogin,user_controller.loadotp)
//to verify the otp 
user_route.post('/otp',user_controller.verifyotp)
//To load the home 
user_route.get('/home', user_controller.loadHome)
//TO load the product page 
user_route.get('/product',user_controller.loadProduct)
//To filter the product 
user_route.post('/product',user_controller.loadProductFilter)
//To load the product detail page 
user_route.get('/detail',user_controller.loadDetail)
// To load profile page 
user_route.get('/profile',userblockCheck,user_auth.UserisLoginOut,user_controller.loadProfile)
// To update the user details 
user_route.post('/updateProfile',user_auth.UserisLoginOut,user_controller.updateProfile)
//to load the user passwordChange page 
user_route.get('/passwordChange',userblockCheck,user_auth.UserisLoginOut,user_controller.passwordChange)
//TO change the password 
user_route.post('/changepassword',user_controller.changepassword)
//To load the add Address page 
user_route.get('/addAddress',userblockCheck,user_auth.UserisLoginOut,address_controller.loadAddress)
//To create a address
user_route.post('/addAddress',address_controller.addAddress)
// TO load the edit address page 
user_route.get('/edit-address',userblockCheck,user_auth.UserisLoginOut,address_controller.loadEditAddress)
//To edit the address 
user_route.post('/edit-address',address_controller.EditAddress)
//To load the cart page 
user_route.get('/cart',userblockCheck,user_auth.UserisLoginOut,Cart_controller.loadcart)
//to remove the cart 
user_route.get('/CartRemove',userblockCheck,user_auth.UserisLoginOut,Cart_controller.CartRemove)
//TO add the product to the  cart 
user_route.post('/cart',user_auth.UserisLoginOut,Cart_controller.AddCart)
//to load the checkout page 
user_route.get('/Proceed',userblockCheck,user_auth.UserisLoginOut,Cart_controller.loadProceed)
//to create a order 
user_route.post('/orderPlace',Order_controller.Proceed)
//to update the Quantity of the product in cart
user_route.patch('/changes',Cart_controller.changes)
// To load the order placed page 
user_route.get('/order_Placed',userblockCheck,user_auth.UserisLoginOut,Order_controller.loadOrderPlaced)
// user logout 
user_route.get('/logout',user_auth.UserisLoginOut, user_controller.logout)
//To remove the user address
user_route.delete('/remove_address',user_auth.UserisLoginOut,user_controller.remove_address)
//TO load add address page in cart
user_route.get('/addAddressCart',userblockCheck,user_auth.UserisLoginOut,address_controller.loadAddressCart)
// to create the address in cart 
user_route.post('/addAddressCart',address_controller.addAddressCart)
//TO validatePaymentVerification Razorpay
user_route.post("/verifyPayment",Order_controller.validatePaymentVerification);
//To Cancel the order
user_route.patch("/orderCancel",Order_controller.orderCancel)
//To Return the order
user_route.patch('/orderReturn',Order_controller.orderReturn)
//To apply the coupon
user_route.patch('/CouponCheak',Order_controller.CouponCheak)
//To remove the coupon
user_route.patch('/CouponRemove',Order_controller.CouponRemove)
//To add product to the wishlist 
user_route.post('/addToWish',wishlistController.addWishlist)
//To load the wishlist page 
user_route.get('/wishlist',userblockCheck,user_auth.UserisLoginOut,user_controller.loadWishlist)
//To remove the  product from the wishlist 
user_route.delete('/wish-delete', wishlistController.deleteWishlist)
//TO load the order view page of user
user_route.get('/Order_view',userblockCheck,user_auth.UserisLoginOut,Order_controller.loadOrderView)
// To get the invoice of the order 
user_route.get('/invoice',userblockCheck,user_auth.UserisLoginOut,user_controller.invoiceDownload)
//To load Wallet History
user_route.get('/walletHistory',userblockCheck,user_auth.UserisLoginOut,user_controller.walletHistory)


// error handler 
user_route.use(errorHandler); 

module.exports = user_route
