const AuthService = require('../services/auth.service');
const { LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } = require('../dtos/auth.dto');

class AuthController {
  static async login(req, res) {
    const data = LoginSchema.parse(req.body);
    res.json(await AuthService.login(data));
  }

  static async forgotPassword(req, res) {
    const data = ForgotPasswordSchema.parse(req.body);
    res.json(await AuthService.requestPasswordReset(data));
  }

  static async resetPassword(req, res) {
    const data = ResetPasswordSchema.parse(req.body);
    res.json(await AuthService.resetPassword(data));
  }
}

module.exports = AuthController;
