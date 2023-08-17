const User = require('../models/User_Model')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const category = require('../models/Category_Model')
const product = require('../models/Product_Model')
const address = require('../models/Address_Model')
const Order = require('../models/Order_Model')
const Cart=require('../models/Cart_Models')
require("dotenv").config();
const Wishlist = require('../models/Wishlist_Model')
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Banner=require('../models/BannerModel')

//To load Home page
const loadHome = async (req, res,next) => {
    try {
        const productData = await product.find({ blocked: false }).limit(6)
        const bannerData= await Banner.find({status:true})
    
        res.render('home', { product: productData,bannerData })

    } catch (err) {
        next(err)
    }
}


//To load Login page
const loadlogin = async (req, res,next) => {
    try {

        res.render('login')

    } catch (err) {
        next(err)
    }
}


// To load Sign_up page
const loadsign_up = async (req, res,next) => {
    try {
        res.render('register')
    } catch (err) {
        next(err)
    }
}

// To load Product page
const loadProduct = async (req, res,next) => {
    try {

        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        var page = 1;
        if (req.query.page) {
          page = req.query.page
    
        }

        const limit = 6;

        const categoryData = await category.find({ is_delete: false })
        const productData = await product.find({
            blocked: false, $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } }

            ]
        }).populate('category').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec()
        page = Number(page)
        const count = await product.find({
            $or: [
              { name: { $regex: '.*' + search + '.*', $options: 'i' } },
              { description: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
          }).populate('category').countDocuments()
        res.render('product', { category: categoryData, product: productData ,totalpages: Math.ceil(count / limit), currentpage: page, next:page+1,perve:page-1,search})
    } catch (err) {
        next(err)
    }
}


//  To secure the password of user 
const securePassword = async (Password) => {
    try {
        const passwordHash = await bcrypt.hash(Password, 10)
        return passwordHash;
    }
    catch (err) {
        next(err)
    }
}

// To sent mail for user
const sendVerifyMail = async (name, email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.ab,
                pass: process.env.pass
            }
        });
        const mailOption = {
            from: process.env.ab,
            to: email,
            subject: "For OTP verification",
            html:
                "<div style='font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2'>" +
                "<div style='margin:50px auto;width:70%;padding:20px 0'>" +
                "<div style='border-bottom:1px solid #eee'>" +
                "<a href='' style='font-size:1.4em;color: #F6511D;text-decoration:none;font-weight:600'><a style='color: orange;'>FEETON</a>" +
                "</div>" +
                "<p style='font-size:1.1em'>Hi,</p>" +
                "<p>Thank you for choosing FEETON. Use the following OTP to complete your Sign Up procedures. OTP is valid for few minutes</p>" +
                "<h2 style='background: #F6511D;margin: 0 auto;width: max-content;padding: 0 10px;color: white;border-radius: 4px;'>" +
                +otp +
                "</h2>" +
                "<p style='font-size:0.9em;'>Regards,<br />FEETON</p>" +
                "<hr style='border:none;border-top:1px solid #eee' />" +
                "<div style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'>" +
                "<p>FEETON</p>" +
                "<p>1600 Ocean Of Heaven</p>" +
                "<p>Pacific</p>" +
                "</div>" +
                "</div>" +
                "</div>"
        }

        transporter.sendMail(mailOption, (err, info) => {
            if (err) {
                next(err)
            }
            else {
                console.log(otp + 'email has been send:-', info.response);
            }
        })

    } catch (err) {
        next(err)
    }
}
//To inserting a user
const insertUser = async (req, res,next) => {


    const existingUser = await User.findOne({ email: req.body.email })

    if (existingUser) {
        res.render('register', { messageRed: ('Email already registered') })
    }
    else {
        try {
            const spassword = await securePassword(req.body.Password);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                Phone: req.body.MobileNumber,
                password: spassword,
                is_block: false,
                is_admin: 0,
                is_verified: 0,
                wallet: 0
            })

            const userData = await user.save();
            if (userData) {
                const otpGenarated = Math.floor(1000 + Math.random() * 9999);
                otp = otpGenarated;

                sendVerifyMail(req.body.name, req.body.email, otp)
                res.render("otp", { email: req.body.email });
            }
            else {
                res.render('register', { messageRed: "your registration has been failed" })
            }


        } catch (err) {
            next(err)
        }
    }
}

//To verifing the user 
const verifyLogin = async (req, res,next) => {
    try {
        const Email = req.body.email
        const Password = req.body.Password

        const userData = await User.findOne({ email: Email })
        if (userData) {

            if (userData.is_block == false) {


                const passwordMatch = await bcrypt.compare(Password, userData.password)

                if (passwordMatch) {
                    if (userData.is_verified === 0) {

                        res.render('login', { message: "please verify your mail" })
                    }
                    else {


                        req.session.userid = userData._id

                        res.redirect('/home')
                    }
                }
                else {
                    res.render('login', { message: "Email and  password is incorrect" })
                }

            } else {

                res.render('login', { message: "This User is blocked" })
            }
        }
        else {
            res.render('login', { message: "Email and  password is incorrect" })

        }
    }
    catch (err) {

        next(err)
    }
}

// To load the product detail page
const loadDetail = async (req, res,next) => {
    try {

        const id = req.query.id
        const productData = await product.findById({ _id: id }).populate('category')
        res.render('productDetail', { product: productData })

    } catch (err) {
        next(err)
    }
}


// To load the otp page of user 
const loadotp = async (req, res,next) => {
    try {
        const email = req.query.id
        res.render('otp', { message: 'incorrect otp', email })
    } catch (err) {
        next(err)
    }
}

// to verify the otp code
const verifyotp = async (req, res,next) => {
    try {

        const otpinput = req.body.otp;




        if (otpinput == otp) {


            const userData = await User.findOneAndUpdate(
                { email: req.query.email },
                { $set: { is_verified: 1 } }
            );

            res.render("login", { messageS: " OTP verification success..!!!" });
        } else
            res.redirect("/otp?id=" + req.query.email);
    } catch (error) {
        next(err)
    }
};

// To load the user profile 
const loadProfile = async (req, res,next) => {
    try {
        id = req.session.userid
        const userdata = await User.findById({ _id: id })
        const dataAddress = await address.findOne({ user: id })
        const order = await Order.find({ user: id, status: "placed" }).populate(
            "products.product_Id"
        ).sort({date:-1})

        res.render('profile', { user: userdata, dataAddress, order })

    } catch (err) {
        next(err)
    }
}

//To update the user details 
const updateProfile = async (req, res,next) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const Phone = req.body.phone
        const userData = await User.findOneAndUpdate({ email: email }, { $set: { name: name, Phone: Phone } })
        res.redirect('/profile')
    } catch (err) {
        next(err)
    }
}

//TO load the password changing page 
const passwordChange = async (req, res,next) => {
    try {
        id = req.query.id
        res.render('passwordChange', { id: id })
    } catch (err) {
        next(err)
    }
}

//To chage the password of user 
const changepassword = async (req, res,next) => {
    try {
        id = req.query.id
        const userData = await User.findById({ _id: id })
        let password = req.body.currentPassword
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (passwordMatch) {
            const spassword = await securePassword(req.body.newPassword);
            const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { password: spassword } })
            res.redirect('/profile')

        } else {
            res.redirect('/passwordChange')
        }

    } catch (err) {
        next(err)
    }
}

//user logout 
const logout = async (req, res,next) => {
    try {

        req.session.destroy()
        res.redirect('/')

    } catch (err) {
        next(err)
    }
}

// To remove the user address
const remove_address = async (req, res,next) => {
    try {
       
        const id = req.session.userid
        const Dataid = req.body.id
       
        await address.findOneAndUpdate({ user: id }, { $pull: { 'address': { _id: Dataid } } })
          res.json({ RemoveSuccess: true })

    } catch (err) {
        next(err)
    }
}

//TO filtering the product by category
const loadProductFilter = async (req, res,next) => {
    try {
        const selectedCategory = req.body.category;
        
let filteredProducts;
        if(selectedCategory==='All'){
             filteredProducts = await product.find({ blocked: false});
        }else{
            filteredProducts = await product.find({ blocked: false, category: selectedCategory });
        }
       

        res.json(filteredProducts);
    } catch (err) {
        next(err)
    }
}
// TO  load the wishlist page of user
const loadWishlist = async (req, res,next) => {
    try {
        
        const wishlist = await Wishlist.findOne({ user: req.session.userid }).populate('products.productId')
        res.render('wishlist', { session: req.session.userid, wish: wishlist })

    } catch (err) {
        next(err)
    }
}

// To get the invoice of the order 
const invoiceDownload = async (req, res,next) => {
    try {
        const { orderId } = req.query
        const userId = req.session.userid
        let sumTotal = 0
        const userData = await User.findById(userId)
        const orderData = await Order.findById(orderId).populate('products.product_Id')

        orderData.products.forEach(item => {
            const total = item.product_Id.price * item.quantity
            sumTotal += total
        })

        const date = new Date()
        const data = {
            order: orderData,
            user: userData,
            date,
            sumTotal
        }

        const filepathName = path.resolve(__dirname, "../views/user/invoice.ejs")
        const html = fs.readFileSync(filepathName).toString()
        const ejsData = ejs.render(html, data)
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(ejsData, { waitUntil: "networkidle0" });
        const pdfBytes = await page.pdf({ format: "Letter" });
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename= order invoice.pdf"
        );
        res.send(pdfBytes);
    } catch (error) {
        next(err)
    }
}

const walletHistory = async (req, res,next) => {
    try {
      const  userId  = req.session.userid
      const walletData = await User.aggregate([
        { $match: { _id:new mongoose.Types.ObjectId(userId)} },
        {$project:{walletHistory:1}},
        { $unwind: "$walletHistory" },
        { $sort: { "walletHistory.date": -1 } },
      ]);
      console.log(walletData);
      res.render("walletHistory", { walletData });
    } catch (err) {
console.log(err.message);
     next(err)
    }
  };

  
module.exports = {
    loadHome
    , loadlogin,
    loadsign_up,
    loadProduct,
    insertUser,
    verifyLogin,
    loadDetail,
    verifyotp,
    loadotp,
    loadProfile,
    updateProfile,
    passwordChange,
    changepassword,
    logout,
    remove_address,
    loadProductFilter,
    loadWishlist,
    invoiceDownload,
    walletHistory,
 



}
