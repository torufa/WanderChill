import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  PORT: process.env.PORT,
  APP_URL: process.env.APP_URL,
  BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND
};