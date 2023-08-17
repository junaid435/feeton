
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public/admin_assets/img')
    },
    filename: function (req, file, cb) {

        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const bannerStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,  "./public/admin_assets/Banner");
    },
    filename: (req, file, cb) => {
      const name = Date.now() + "-" +file.originalname;
      cb(null, name);
    },
  });
const upload = multer({ storage: storage })
const bannerUpoload = multer({ storage: bannerStorageEngine});
module.exports = {
    upload,
    bannerUpoload
}