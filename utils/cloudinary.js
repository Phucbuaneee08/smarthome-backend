const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
cloudinary.config({
    cloud_name: 'dauptgx4q',
    api_key: '323516433647223',
    api_secret: 'KO8bfH-ncuYjXlHTe1S-V84i0Hw'
});

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    params: {
      folder: 'SmartHome'
    }
  });

  const uploadCloud = multer({ storage });

  module.exports = uploadCloud;