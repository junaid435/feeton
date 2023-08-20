const admin = require('../../models/Admin_Model')
const User = require('../../models/User_Model')
const category = require('../../models/Category_Model')
const product = require('../../models/Product_Model')

const fs = require("fs");
const path = require("path");

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
    const limit = 4;

    const productData = await product.find({
      $or: [
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


    res.render('product_view', { product: productData, totalpages: Math.ceil(count / limit), currentpage: page, next: page + 1, perve: page - 1, search })


  } catch (err) {
    next(err)
  }
}
const productAdd = async (req, res,next) => {
  try {

 
  const peoductData= await product.find()

    function generateProductID() {
      // Generate a random number between 1000 and 9999
      const randomNum = Math.floor(Math.random() * 900000) + 100000;
    
      // Concatenate date and time components with the random number
      const ProductID = randomNum;
    
      return ProductID;
    }

    if (!peoductData[0]) {
      productIdSample = 0;
      productIdSample = productIdSample + generateProductID();
    } else {
      productIdSample = Number(peoductData[0].ProductId) ;
  
      for (let i = 1; i <= peoductData.length; i++) {
   
         ab=productIdSample+=1;  
        
      }
    }

    let arrimage = []

    if (req.files && req.files.length) {
      for (let i = 0; i < req.files.length; i++) {

        arrimage.push(req.files[i].filename)
      }
    }
    const productData = new product({
      ProductId:productIdSample,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: arrimage,
      category: req.body.category,
      stock: req.body.stock,
      blocked: false
    })

    const userData = await productData.save()

    const Data = await product.find()
    res.redirect('/admin/product')

  } catch (err) {
    next(err)
  }
}


const loadproductAdd = async (req, res,next) => {
  try {
    const categoryData = await category.find()
    res.render('AddProduct', { category: categoryData })
  } catch (err) {
    next(err)
  }
}

const loadProductEdit = async (req, res,next) => {
  try {
    id = req.query.id
    const categoryData = await category.find()
    const productData = await product.findById({ _id: id })
    res.render('product_edit', { product: productData, categoryData: categoryData })

  } catch (err) {
    next(err)
  }
}

const ProductUpdate = async (req, res,next) => {
  try {
    const {
      product_id,
      name,
      Price,
      description,
      stock,
      category,
    } = req.body;
    const existingProduct = await product.findById(product_id)
   let  imageArr = [];
    if(existingProduct && existingProduct.image && existingProduct.image.length>0 ){
      imageArr = existingProduct.image
    }
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imageArr.push(req.files[i].filename);
      }
    }
    if (req.files && req.files.length > 0) {
      await product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: name,
            price:Price,
            stock: stock,
            category: category,
            description: description,
            image: imageArr,
          }
        }
      )
      res.redirect('/admin/product')
    } else {

      await product.findByIdAndUpdate(
        { _id: product_id },
        {
          $set: {
            name: name,
            stock: stock,
            price: Price,
            description: description,
            category: category,
          }
        }
      )
      res.redirect('/admin/product')
    }
  } catch (err) {
    next(err)
  }
}


const unlistProduct = async (req, res,next) => {
  try {
    id = req.body.id
    const userData = await product.findByIdAndUpdate({ _id: id }, { $set: { blocked: true } })
    res.json({success:true})

  } catch (err) {
    next(err)
  }
}

const listProduct = async (req, res,next) => {
  try {
    id = req.body.id
    const userData = await product.findByIdAndUpdate({ _id: id }, { $set: { blocked: false } })
    res.json({success:true})

  } catch (err) {
    next(err)
  }
}

const deleteProductImage = async (req, res,next) => {
  try {

    const { img, bannerId } = req.body;
    fs.unlink(path.join(__dirname,"./public/admin_assets/img", img), () => {});

    const deleted = await product.updateOne(
      { _id: bannerId },
      { $pull: { image: img } }
    );
 
    res.send({ success: true });
  } catch (err) {
    next(err)
   next(err)
  }
};
module.exports = {
  productAdd,
  loadProduct,
  loadproductAdd,
  loadProductEdit,
  ProductUpdate,
  unlistProduct,
  listProduct,
  deleteProductImage
}