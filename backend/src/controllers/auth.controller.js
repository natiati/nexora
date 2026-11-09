const AuthService = require('../services/auth.service');
const { LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } = require('../dtos/auth.dto');
const { ok } = require('../utils/http-response');

class AuthController {
  // POST /login → 200 con el token
  static async login(datos) {
    const data = LoginSchema.parse(datos);
    return ok(await AuthService.login(data));
  }

  // POST /password/forgot → 200
  static async forgotPassword(datos) {
    const data = ForgotPasswordSchema.parse(datos);
    return ok(await AuthService.requestPasswordReset(data));
  }

  // POST /password/reset → 200
  static async resetPassword(datos) {
    const data = ResetPasswordSchema.parse(datos);
    return ok(await AuthService.resetPassword(data));
  }
}

module.exports = AuthController;
