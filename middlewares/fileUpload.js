const multer = require('multer');

const AppError = require('../utils/appError');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const multerFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  const error = isValid
    ? null
    : new AppError(
        'Invalid file type! Only png, jpeg, and jpg are allowed.',
        400
      );

  cb(error, isValid);
};

// const multerDiskStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Set the destination directory
//     cb(null, 'public/img/users');
//   },

//   filename: (req, file, cb) => {
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     // Generate a unique filename using userId and current timestamp
//     const uniqueName = `user-${req.user.id}-${Date.now()}.${ext}`;
//     cb(null, uniqueName);
//   }
// });

const multerMemoryStorage = multer.memoryStorage();

const fileUpload = multer({
  limits: { fileSize: 5e6 }, // converting 5 MB to bytes
  fileFilter: multerFilter,
  storage: multerMemoryStorage
});

module.exports = fileUpload;
