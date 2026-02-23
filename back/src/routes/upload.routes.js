const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload.controller');
const { upload, handleMulterError } = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * @route   POST /api/upload/images
 * @desc    Subir múltiples imágenes (máx 10)
 * @access  Authenticated
 */
router.post(
  '/images',
  upload.array('images', 10),
  handleMulterError,
  UploadController.uploadImages
);

/**
 * @route   POST /api/upload/image
 * @desc    Subir una sola imagen
 * @access  Authenticated
 */
router.post(
  '/image',
  upload.single('image'),
  handleMulterError,
  UploadController.uploadSingleImage
);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Eliminar una imagen
 * @access  Authenticated
 */
router.delete('/:filename', UploadController.deleteImage);

module.exports = router;
