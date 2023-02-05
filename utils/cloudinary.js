require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dauptgx4q',
    api_key: '323516433647223',
    api_secret: 'KO8bfH-ncuYjXlHTe1S-V84i0Hw',
});

module.exports = { cloudinary };