const multer = require('multer');
const path = require('path');

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    console.log('multer:', path);
    let ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.webp') {
      cb(new Error('Unsupported file type!'), false);
      return;
    }
    cb(null, true);
  },
}).single('image');
