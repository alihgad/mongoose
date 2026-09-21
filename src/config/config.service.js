import { config } from "dotenv"
import { resolve } from "path"

config({
  path: resolve(".env")
})

export default {
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  DB_URI: process.env.DB_URI,
  SMTP: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_PASS: process.env.SMTP_PASS,
  },
  MAX_OTP_ATTEMPTS : Number(process.env.MAX_OTP_ATTEMPTS),
  OTP_TTL : Number(process.env.OTP_TTL),
  GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET : process.env.GOOGLE_SECRET
}