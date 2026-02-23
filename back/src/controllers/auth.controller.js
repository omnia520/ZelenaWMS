const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../middlewares/auth');
const UsuarioModel = require('../models/usuario.model');

class AuthController {
  // Registro de usuario
  static async register(req, res, next) {
    try {
      const { nombre, nombre_usuario, email, telefono, rol, password } = req.body;

      // Validaciones básicas
      if (!nombre || !nombre_usuario || !password || !rol) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, nombre de usuario, rol y contraseña son requeridos'
        });
      }

      // Verificar que el nombre_usuario no exista
      const existingUser = await UsuarioModel.findByNombreUsuario(nombre_usuario);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya está registrado'
        });
      }

      // Si se proporciona email, verificar que no exista
      if (email) {
        const existingEmailUser = await UsuarioModel.findByEmail(email);
        if (existingEmailUser) {
          return res.status(409).json({
            success: false,
            message: 'El email ya está registrado'
          });
        }
      }

      // Validar rol
      const rolesValidos = ['Vendedor', 'Jefe_Bodega', 'Operario', 'Facturacion', 'Administrador'];
      if (!rolesValidos.includes(rol)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido',
          rolesPermitidos: rolesValidos
        });
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const newUser = await UsuarioModel.create({
        nombre,
        nombre_usuario,
        email,
        telefono,
        rol,
        password_hash
      });

      // Generar tokens
      const token = generateToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            usuario_id: newUser.usuario_id,
            nombre: newUser.nombre,
            nombre_usuario: newUser.nombre_usuario,
            email: newUser.email,
            rol: newUser.rol
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { nombre_usuario, password } = req.body;

      // Validaciones básicas
      if (!nombre_usuario || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de usuario y contraseña son requeridos'
        });
      }

      // Buscar usuario
      const user = await UsuarioModel.findByNombreUsuario(nombre_usuario);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.activo) {
        return res.status(403).json({
          success: false,
          message: 'Usuario inactivo. Contacte al administrador'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generar tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            usuario_id: user.usuario_id,
            nombre: user.nombre,
            nombre_usuario: user.nombre_usuario,
            email: user.email,
            rol: user.rol,
            telefono: user.telefono
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req, res, next) {
    try {
      const user = await UsuarioModel.findById(req.user.usuario_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva son requeridas'
        });
      }

      // Buscar usuario con contraseña
      const user = await UsuarioModel.findByEmail(req.user.email);

      // Verificar contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Hash de la nueva contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      await UsuarioModel.updatePassword(req.user.usuario_id, password_hash);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
