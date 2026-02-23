const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../middlewares/upload');

class UploadController {
  // Subir una o múltiples imágenes
  static async uploadImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se recibieron archivos'
        });
      }

      // Construir URLs de las imágenes subidas
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `${baseUrl}/uploads/averias/${file.filename}`
      }));

      res.status(201).json({
        success: true,
        message: `${uploadedFiles.length} imagen(es) subida(s) exitosamente`,
        data: uploadedFiles
      });
    } catch (error) {
      next(error);
    }
  }

  // Subir una sola imagen
  static async uploadSingleImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const uploadedFile = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `${baseUrl}/uploads/averias/${req.file.filename}`
      };

      res.status(201).json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: uploadedFile
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar una imagen
  static async deleteImage(req, res, next) {
    try {
      const { filename } = req.params;

      // Validar que el filename no contenga rutas maliciosas
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo inválido'
        });
      }

      const filePath = path.join(uploadDir, filename);

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      // Eliminar el archivo
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UploadController;
