const sharp = require('sharp');

const processUploadedFile = (req, res, next) => {
  if (!req.file) return next();

  // define the filename of the uploaded image
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    // .resize(500, 500) // resize the image to 500x500 pixels
    .toFormat('jpeg') // convert the image to jpeg format
    .jpeg({ quality: 90 }) // compress the image to 90% quality
    .toFile(`public/img/users/${req.file.filename}`); // save the image to the file system

  return next();
};

module.exports = processUploadedFile;
