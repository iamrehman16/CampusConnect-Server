import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";


export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET must be defined');
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  };
});