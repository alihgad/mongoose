import nodemailer from "nodemailer"
import configService from "../../config/config.service.js"
let { SMTP } = configService

let transporter = nodemailer.createTransport({
  auth: {
    user: SMTP.SMTP_FROM,
    pass: SMTP.SMTP_PASS
  },
  service : "gmail",
  host: SMTP.SMTP_HOST,
  port: Number(SMTP.SMTP_PORT),
  secure: SMTP.SMTP_SECURE,
})



try {
  console.log("start")
  let data = await transporter.verify()
  console.log("transporter is ready")
} catch (e) {
  console.log(e)
  throw new Error(e.message, { cause: 500 })
}

export const sendEmail = async ({ to, html, text, subject }) => {
  try {
    console.log({
      to
    })
    let info = await transporter.sendMail({
      from: SMTP.SMTP_FROM,
      to,
      subject: subject || "Your OTP for saraha",
      text: text || "",
      html: html || ""
    })

    console.log(info.accepted.length > 0 ? "mail send" : "mail not send")
  } catch (e) {
    console.log(e)
  }
}