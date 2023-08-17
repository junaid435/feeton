const Banner = require("../../models/BannerModel");
const fs = require("fs");
const path = require("path");
let BANNERS_PER_PAGE = 5;
const bannerList = async (req, res,next) => {
  try {
   
    const page = parseInt(req.query.page) || 1;
    const totalBanners = await Banner.countDocuments();
    const totalPages = Math.ceil(totalBanners / BANNERS_PER_PAGE);
    const bannerData = await Banner.find()
      .skip((page - 1) * BANNERS_PER_PAGE)
      .limit(BANNERS_PER_PAGE);
   
    res.render("bannerList", { bannerData, totalPages, req });
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};

const addBannerLoad = async (req, res,next) => {
  try {
    res.render("addBanner");
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
const postAddBanner = async (req, res,next) => {
  try {
    const { description, title } = req.body;
    let imagearr = []; // Declare and initialize the 'image' variable as an empty array
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imagearr.push(req.files[i].filename);
      }
    }
    const banner = new Banner({
      title: title,
      description: description,
      image: imagearr,
    });
    await banner.save();
    res.redirect("/admin/bannerList");
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
const editBanner = async (req, res,next) => {
  try {
    const { id } = req.query;
    const banner = await Banner.findById({ _id: id });
    res.render("editBanner", { banner });
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
const postEditBanner = async (req, res,next) => {
  try {
    const { id, title, description } = req.body;
    const existingBanner = await Banner.findById(id)
    let imagearr = [];
    if(existingBanner && existingBanner.image && existingBanner.image.length>0 ){
      imagearr = existingBanner.image
    }
     // Declare and initialize the 'image' variable as an empty array
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        imagearr.push(req.files[i].filename);
      }
    }
    await Banner.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          description: description,
          image: imagearr,
        },
      }
    );
    res.redirect("/admin/bannerList");
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
const deleteBannerImage = async (req, res,next) => {
  try {

    const { img, bannerId } = req.body;
    fs.unlink(path.join(__dirname, "./public/admin_assets/Banner", img), () => {});

    const deleted = await Banner.updateOne(
      { _id: bannerId },
      { $pull: { image: img } }
    );
   
    res.send({ success: true });
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
const unlistBanner = async (req, res,next) => {
  try {
    const { id } = req.query;
    const banner = await Banner.findById({ _id: id });
    if (banner.status === true) {
      await Banner.updateOne({ _id: id }, { $set: { status: false } });
      res.redirect("/admin/bannerList");
    } else {
      await Banner.updateOne({ _id: id }, { $set: { status: true } });
      res.redirect("/admin/bannerList");
    }
  } catch (err) {
    console.log(err.message);
    next(err)
  }
};
module.exports = {
  deleteBannerImage,
  postEditBanner,
  addBannerLoad,
  postAddBanner,
  unlistBanner,
  bannerList,
  editBanner,
};