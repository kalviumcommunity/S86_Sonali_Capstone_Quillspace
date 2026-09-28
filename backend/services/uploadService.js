const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-cleanname
    const ext = path.extname(file.originalname).toLowerCase();
    const rawName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = rawName.slice(0, 50) || 'image';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow image formats (JPG, JPEG, PNG, WEBP, GIF)
const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp|gif)$/i;
  const allowedMime = /^image\/(jpe?g|png|webp|gif|pjpeg|x-png)$/i;
  const extname = allowedExts.test(path.extname(file.originalname));
  const mimetype = allowedMime.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, JPEG, PNG, WEBP, GIF) are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
