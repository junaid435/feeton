const express=require('express')
const admin_route =express()
const admin_controller=require('../controllers/admin_controllers')
const product_controller=require('../controllers/controller/Product_controllers')
const admin_auth=require('../middleware/admin_auth')
const upload = require('../middleware/uploadImage')

const errorHandler =require('../middleware/errorHandler')
const bannerController=require('../controllers/controller/BannerController')
const session=require('express-session')
require('dotenv').config();
admin_route.use(session({secret:process.env.SESSIONSECRET,resave:false,saveUninitialized:false}))
admin_route.set('view engine' , 'ejs')
admin_route.set('views' , './views/admin')

//To load the admin login page 
admin_route.get('/', admin_auth.adminisLoginOut, admin_controller.loadlogin)
//To load the admin login page 
admin_route.get('/login',admin_auth.adminisLoginOut,admin_controller.loadlogin)
//To verify the admin
admin_route.post('/login',admin_controller.verifyAdmin)
//To load the user Management page
admin_route.get('/user',admin_auth.adminisLogin,admin_controller.userManagement)
//To block the user 
admin_route.patch('/Block_user',admin_auth.adminisLogin,admin_controller.userblock)
//To unblock the user 
admin_route.patch('/Unblock_user',admin_auth.adminisLogin,admin_controller.userUnblock)
//To load the Category Management page 
admin_route.get('/Category',admin_auth.adminisLogin,admin_controller.loadCategory)
//To load category edit page 
admin_route.get('/category_edit',admin_auth.adminisLogin,admin_controller.categoryEdit)
//To update the category 
admin_route.post('/category_edit',admin_controller.categoryUpdate)
//To unlist the category
admin_route.patch('/category_delete',admin_auth.adminisLogin,admin_controller.categoryDelete)
//To list the category
admin_route.patch('/category_Undelete',admin_controller.categoryUnDelete)
//To add the category 
admin_route.post ('/category_add',admin_controller.categoryAdd)
//To load the product Management page
admin_route.get('/product',admin_auth.adminisLogin,product_controller.loadProduct)
//To load product add page 
admin_route.get('/productAdd',admin_auth.adminisLogin, product_controller.loadproductAdd)
//To add product 
admin_route.post('/productAdd',upload.upload.array('ProductImage',3), product_controller.productAdd)
// To load product edit page 
admin_route.get('/product_edit',admin_auth.adminisLogin,product_controller.loadProductEdit)
//To Unlist product 
admin_route.patch('/product_delete',admin_auth.adminisLogin,product_controller.unlistProduct)
//To list product 
admin_route.patch('/product_Undelete',admin_auth.adminisLogin,product_controller.listProduct)
//To load  admin dashbord
admin_route.get('/dashbord',admin_auth.adminisLogin,admin_controller.loadDashbord)
// To update the product
admin_route.post('/product_update',upload.upload.array('Image',3),product_controller.ProductUpdate)

// admin_route.get('/otp',admin_controller.otpload)
// admin_route.post('/otp',admin_controller.otpVerify) 

// admin logout 
admin_route.get('/logout',admin_auth.adminisLogin, admin_controller.logout)
//TO load Order page 
admin_route.get('/Order',admin_auth.adminisLogin,admin_controller.loadOrder)
//To update order 
admin_route.patch('/OrderUpdate',admin_controller.UpdateOrderStatus)
//To load  couponAdd page
admin_route.get('/addCoupon',admin_auth.adminisLogin,admin_controller.coupenAdmin)
//To add the coupon
admin_route.post('/addCoupon',admin_controller.couponSet)
//To delete the coupon
admin_route.delete('/delete-coupon',admin_auth.adminisLogin,admin_controller.deleteCoupon)
// To load  the cuopon show page
admin_route.get('/coupon',admin_auth.adminisLogin,admin_controller.loadCoupon)
//To load the sales report page 
admin_route.get('/sales-report'  ,admin_auth.adminisLogin, admin_controller.salesReport)
//To sort the sales report page 
admin_route.post('/sales-report' , admin_controller.sortSalesReport)
//To load user datail page 
admin_route.get('/userDetails',admin_auth.adminisLogin,admin_controller.userDetails)
//To load user order datail page 
admin_route.get('/orderDetails',admin_auth.adminisLogin,admin_controller.orderDetails)
//To load Banner list page 
admin_route.get('/bannerList',admin_auth.adminisLogin,bannerController.bannerList)
//TO load Add banner page
admin_route.get('/addBanner',admin_auth.adminisLogin,bannerController.addBannerLoad)
//To add the Banner 
admin_route.post('/addBanner',admin_auth.adminisLogin,upload.bannerUpoload.array('image',5),bannerController.postAddBanner)
//To load the edit page of Bannner
admin_route.get('/editBanner',admin_auth.adminisLogin,bannerController.editBanner)
//To upadate the Banner
admin_route.post('/editBanner',admin_auth.adminisLogin,upload.bannerUpoload.array('image',5),bannerController.postEditBanner)
// TO delele image only 
admin_route.put('/deleteBannerImage',admin_auth.adminisLogin,bannerController.deleteBannerImage)
//TO update Bannner list and unlist 
admin_route.get('/unlistBanner',admin_auth.adminisLogin,bannerController.unlistBanner)
//To delete Product Image
admin_route.put('/deleteProductImage',admin_auth.adminisLogin,product_controller.deleteProductImage)
// error handler 
admin_route.use(errorHandler);

module.exports=admin_route