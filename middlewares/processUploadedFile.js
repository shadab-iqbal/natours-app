const sharp = require('sharp');

const AppError = require('../utils/appError');

exports.processUserImage = async (req, res, next) => {
  if (!req.file) return next();

  // define the filename of the uploaded image
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  try {
    await sharp(req.file.buffer)
      // .resize(500, 500) // resize the image to 500x500 pixels
      .toFormat('jpeg') // convert the image to jpeg format
      .jpeg({ quality: 90 }) // compress the image to 90% quality
      // save the image to the file system
      .toFile(`public/img/upload/${req.file.filename}`);
  } catch (err) {
    return next(
      new AppError('Error processing the image. Please try again!', 500)
    );
  }

  return next();
};

exports.processTourImages = async (req, res, next) => {
  if (!req.files) return next();

  try {
    // ------ Process the cover image ------ //
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/upload/${imageCoverFilename}`);

    req.body.imageCover = imageCoverFilename;

    // ------ Process the rest of the images ------ //
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/upload/${filename}`);

        req.body.images.push(filename);
      })
    );
  } catch (err) {
    return next(new AppError('Some images failed to upload!', 500));
  }

  return next();
};
