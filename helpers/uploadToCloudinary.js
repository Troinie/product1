// up ảnh
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

let streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// up lên cloud
module.exports = async (buffer) => {
    let result = await streamUpload(buffer);
    // console.log(result.url);
    return result.url;
}