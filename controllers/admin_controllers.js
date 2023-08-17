const admin = require('../models/Admin_Model')
const User = require('../models/User_Model')
const category = require('../models/Category_Model')
const nodemailer = require('nodemailer');
const Order = require('../models/Order_Model')
const Coupon = require('../models/Coupon_Model')
const Address = require('../models/Address_Model');
const { addAddress } = require('./controller/Address_controller');
const Product=require('../models/Product_Model')



const loadlogin = async (req, res,next) => {
  try {
    res.render('adminLogin')
  } catch (err) {
  next(err)
  }
}


const sendVerifyMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'muhammedjunaid127.d@gmail.com',
        pass: 'nxibnlsgcvbuqvdh'
      }
    });
    const mailOption = {
      from: 'muhammedjunaid127.d@gmail.com',
      to: email,
      subject: "For OTP verification",
      html:
        "<p>hai" +
        name +
        ',this is your otp :' +
        otp +
        " for your verification " +
        email +
        "</p>",
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

const verifyAdmin = async (req, res,next) => {
  try {

    const Email = req.body.email
    const Password = req.body.password


    const userData = await admin.findOne({ adminEmail: Email })
    if (userData) {
      const passwordMatch = Password === userData.adminPassword

      if (passwordMatch) {
        const otpGenarated = Math.floor(1000 + Math.random() * 9999);
        otp = otpGenarated;
        const email = req.body.email
        console.log(email);
        // sendVerifyMail(req.body.name, email, otp)
        req.session.admin = userData._id
        res.redirect("/admin/dashbord")
      }
      else {
        res.render('adminLogin', { message: "Email and  password is incorrect" })
      }

    }
    else {
      res.render('adminLogin', { message: "Email and  password is incorrect" })
    }



  } catch (err) {
  next(err)
  }
}


const userManagement = async (req, res,next) => {
  try {



    var page = 1;
    if (req.query.page) {
      page = req.query.page

    }

    const limit = 4;

    const userData = await User.find().limit(limit * 1).skip((page - 1) * limit).exec()
    page = Number(page)
    const count = await User.find().countDocuments()


    res.render('userManagement', { users: userData, totalpages: Math.ceil(count / limit), currentpage: page, next: page + 1, perve: page - 1 })

  }

  catch (err) {
  next(err)
  }
}

const userblock = async (req, res,next) => {
  try {
    _id = req.body.id

    const userdata = await User.findByIdAndUpdate({ _id }, { $set: { is_block: true } })
    res.json({ success: true })

  } catch (err) {
  next(err)
  }
}

const userUnblock = async (req, res,next) => {
  try {
    _id = req.body.id
    const userData = await User.findByIdAndUpdate({ _id }, { $set: { is_block: false } })
    res.json({ success: true })

  } catch (err) {
  next(err)
  }
}

const loadCategory = async (req, res,next) => {
  try {

    var search = '';
    if (req.query.search) {
      search = req.query.search
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page

    }


    const limit = 4;

    const userData = await category.find({ name: { $regex: '.*' + search + '.*', $options: 'i' } }).limit(limit * 1).skip((page - 1) * limit).exec()
    page = Number(page)
    const count = await category.find({ name: { $regex: '.*' + search + '.*', $options: 'i' } }).countDocuments()


    res.render('Category', { category: userData, totalpages: Math.ceil(count / limit), currentpage: page, next: page + 1, perve: page - 1, search })

  }


  catch (err) {
  next(err)
  }
}

const categoryEdit = async (req, res,next) => {
  try {
    id = req.query.id
    const userData = await category.findById({ _id: id })
    res.render('category_edit', { category: userData })
  } catch (err) {
  next(err)
  }
}

const categoryUpdate = async (req, res,next) => {
  try {
    const name = req.body.name.trim();
    if (name.length == 0) {
      res.redirect("/admin/category");
    } else {
      const alredy = await category.findOne({
        name: { $regex: name, $options: "i" },
      });

      if (alredy) {
        const data = await category.find()
        res.redirect('/admin/Category')

      } else {
        _id = id
        const userData = await category.findByIdAndUpdate({ _id: _id }, { $set: { name: req.body.name } })
        res.redirect('/admin/Category')
      }
    }
  } catch (err) {
  next(err)
  }
}

const categoryDelete = async (req, res,next) => {
  try {
    id = req.body.id

    const userData = await category.findByIdAndUpdate({ _id: id }, { $set: { is_delete: true } })
    res.json({ success: true })

  } catch (err) {
  next(err)
  }
}

const categoryUnDelete = async (req, res,next) => {
  try {
    id = req.body.id

    const userData = await category.findByIdAndUpdate({ _id: id }, { $set: { is_delete: false } })
    res.json({ success: true })

  } catch (err) {
  next(err)
  }
}

const categoryAdd = async (req, res,next) => {
  try {
    const name = req.body.Category.trim();
    if (name.length == 0) {
      res.redirect("/admin/category");
    } else {
      const alredy = await category.findOne({
        name: { $regex: name, $options: "i" }
      });

      if (alredy) {
        const data = await category.find()
        res.redirect("/admin/category");

      } else {

        const Category = new category({
          name: req.body.Category,
          is_delete: false

        })

        const userData = await Category.save();
        res.redirect('/admin/Category')

      }
    }
  } catch (err) {
  next(err)
  }
}

const loadDashbord = async (req, res,next) => {
  try {
    let currentDate = new Date();

    const categoryOrders = await Order.aggregate([
      {
        $match: {
          status: { $ne: "pending" }
        },
      },
      {
        $unwind: "$products",

      },
      {
        $match: {
          "products.status": { $ne: "cancelled" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_Id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $group: {
          _id: "$categoryData.name",
          totalQuantitySold: { $sum: "$products.quantity" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantitySold: 1,
          _id: 0,
        },
      },
    ]);

    let ordersCategory = {};

    categoryOrders.forEach((category) => {
      ordersCategory[category.category] = category.totalQuantitySold;

    });
    const Category = await category.find({});

 


    const paymentCod1 = await Order.aggregate([
      { $match: { payment: "cod", 'products.status': "delivered" } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      { $project: { total: 1, _id: 0 } }
    ])
    const paymentRazor1 = await Order.aggregate([
      { $match: { payment: 'razorpay', 'products.status': "delivered" } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      { $project: { total: 1, _id: 0 } }
    ])



let paymentRazor;
let paymentCod;
if(paymentRazor1.length>0){
  paymentRazor = parseInt(paymentRazor1[0].total)
}else{
  paymentRazor=0
}
     
if(paymentCod1.length>0){
  paymentCod = parseInt(paymentCod1[0].total)
}else{
    paymentCod=0
}
     
  
    

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
   


    const dailyOrders = await Order.aggregate([
      {
        $match: {
          status: {
            $ne: "pending"
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date"
            },

          },
          dailyrevenue: {
            $sum: "$totalAmount"
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      },
      {
        $limit: 7
      }
    ])

    const result = dailyOrders || 0
   
const Revenue=paymentCod+paymentRazor

const countOrder=await Order.find().countDocuments()

const countProduct=await Product.find().countDocuments()
const countCategory=await category.find().countDocuments()
  const countUser= await  User.find().countDocuments()
    res.render('Dashbord', { ordersCategory, Category, paymentCod, paymentRazor, result,Revenue ,countOrder,countCategory,countProduct,countUser})
  } catch (err) {
  next(err)
  }
}

const otpload = async (req, res,next) => {
  try {
    res.render('adminOtp', { message: 'incorrect otp' })
  } catch (err) {
  next(err)
  }
}

const otpVerify = async (req, res,next) => {
  try {

    const otpinput = req.body.otp;
    const adminid = req.query.id



    if (otpinput == otp) {
      req.session.admin = adminid

      res.redirect("/admin/dashbord")
    } else
      res.redirect("/admin/otp");
  } catch (error) {
    console.log(error.message);
  }
};

const loadOrder = async (req, res,next) => {
  try {
    const order = await Order.find({ status: "placed" }).populate(
      "products.product_Id"
    );

    res.render('Admin_Order', { order })

  } catch (err) {
  next(err)
  }
}

const UpdateOrderStatus = async (req, res,next) => {
  try {
    const productId = req.body.productID
    const value = req.body.value
    const orderId = req.body.orderid



    await Order.findOneAndUpdate({ _id: orderId, 'products.product_Id': productId }, { $set: { "products.$.status": value } })
    res.json({ success: true })
  } catch (err) {
  next(err)
  }
}

const coupenAdmin = async (req, res,next) => {
  try {
    res.render('coupon_admin')
  } catch (err) {
  next(err)
  }
}

const couponSet = async (req, res,next) => {
  try {


    const code = req.body.code
    const already = await Coupon.findOne({ code: code })

    if (already) {
      res.render('coupon_admin', { message: 'code already exists' })
    } else {
      const newCoupon = new Coupon({
        code: req.body.code,
        discountPercentage: req.body.discountPercentage,
        startDate: req.body.startDate,
        expireDate: req.body.expiryDate
      })

      await newCoupon.save()
      res.redirect('/admin/coupon')

    }


  } catch (err) {
  next(err)
  }
}

const loadCoupon = async (req, res,next) => {
  try {
    const couponData = await Coupon.find()
    res.render('coupon', { couponData })
  } catch (err) {
  next(err)
  }
}

const deleteCoupon = async (req, res,next) => {
  try {
    const id = req.body.id
    await Coupon.findByIdAndDelete({ _id: id })
    console.log('hai');
    res.json({ success: true })
  } catch (err) {
  next(err)
  }
}


const salesReport = async (req, res,next) => {
  try {

    const totalAmount = await Order.aggregate([
      { $unwind: '$products' },
      { $match: { 'products.status': 'delivered' } },
      { $group: { _id: null, total: { $sum: '$products.total' } } }
    ]);

    const totalSold = await Order.aggregate([
      { $unwind: '$products' },
      { $match: { 'products.status': 'delivered' } },
      { $group: { _id: null, total: { $sum: '$products.quantity' } } },
      { $project: { total: 1, _id: 0 } }
    ]);


    const product = await Order.find({ "products.status": 'delivered' }).populate('products.product_Id').populate('user')

    console.log( totalAmount,
      totalSold,
      product);

    res.render('sales-report', {
      totalAmount,
      totalSold,
      product,
    })


  } catch (err) {
    console.log((err.message));
  }
}

const
  sortSalesReport = async (req, res,next) => {
    try {
      let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : null;
      fromDate.setHours(0, 0, 0, 0);
      let toDate = req.body.toDate ? new Date(req.body.toDate) : null;
      toDate.setHours(23, 59, 59, 999);

      const currentDate = new Date();

      if (fromDate && toDate) {
        if (toDate < fromDate) {
          const temp = fromDate;
          fromDate = toDate;
          toDate = temp;
        }
      } else if (fromDate) {
        toDate = currentDate;
      } else if (toDate) {
        fromDate = currentDate;
      }
console.log("*/n*/n$");
   console.log(toDate,fromDate);
      var matchStage = {
      
        'products.status': 'delivered'
      };

      const totalAmount = await Order.aggregate([  {
        $match: {

        
          expectedDelivery: { $gte: fromDate, $lte: toDate },
        },
      },
        {
          $match: {
            expectedDelivery: { $gte:fromDate, $lte:toDate }
          }
        },
        { $unwind: '$products' },
        { $match: matchStage }, // This is where you would put your additional matching criteria if needed
        {
          $group: {
            _id: null,
            total: { $sum: '$products.total' }
          }
        }
      ]);
      

      const totalSold = await Order.aggregate([
        {
          $match: {
  
          
            expectedDelivery: { $gte: fromDate, $lte: toDate },
          },
        },
        { $unwind: '$products' },
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$products.quantity' } } },
        { $project: { total: 1, _id: 0 } },
      ]);

     
      const product = await Order.find({ expectedDelivery: { $gte: fromDate, $lte: toDate },"products.status": 'delivered' }).populate('products.product_Id').populate('user')
      console.log('hai');
      console.log( totalAmount,
        totalSold, 
        product);
      res.render('sales-report', {
        totalAmount,
        totalSold,
        product,
      })
      
    } catch (err) {
      console.log((err.message));
    }
  };


const userDetails = async (req, res,next) => {
  try {
    const id = req.query.id
    const userData = await User.findById({ _id: id })
    const addressData = await Address.findOne({ user: id })
    console.log(addressData);

    res.render('AdminUserDetail', { userData, addressData })
  } catch (err) {
  next(err)
  }
}

const orderDetails = async (req, res,next) => {
  try {
    const id = req.query.id
   const i=req.query.i
    const orderData = await Order.findById({
      _id: id

    })

    console.log(orderData);
    res.render('AdminOrderDetail', { orderData,i })
  } catch (err) {
  next(err)
  }
}

const logout = async (req, res,next) => {
  try {

      req.session.destroy()
      res.redirect('/admin')

  } catch (err) {
      next(err)
  }
}
module.exports = {
  loadlogin,
  verifyAdmin,
  userManagement,
  userblock,
  userUnblock,
  loadCategory,
  categoryEdit,
  categoryUpdate,
  categoryDelete,
  categoryAdd,
  loadDashbord,
  otpVerify,
  otpload,
  categoryUnDelete,
  loadOrder,
  UpdateOrderStatus,
  coupenAdmin,
  couponSet,
  loadCoupon,
  deleteCoupon,
  salesReport,
  sortSalesReport,
  userDetails,
  orderDetails,
  logout

}