const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  let ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
    cb(new Error('Unsupported file type!'), false);
    return;
  }
  cb(null, true);
};

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: fileFilter,
}).fields([
  { name: 'image_cover_large', maxCount: 1 },
  { name: 'image_cover_medium', maxCount: 1 },
  { name: 'image_cover_small', maxCount: 1 },
  { name: 'image_min_large', maxCount: 1 },
  { name: 'image_min_medium', maxCount: 1 },
  { name: 'image_min_small', maxCount: 1 },
]);
