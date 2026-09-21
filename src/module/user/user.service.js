import cloudinary from "../../common/utils/cloudinary.js"
import { emailEvent, emailEventName } from "../../common/utils/emailEvent.js"
import { userModel } from "../../db/model/user.model.js"
import client from "./../../db/redis.connection.js"
import bcrypt from "bcrypt"
import configService from "../../config/config.service.js"
import { OAuth2Client } from 'google-auth-library';
import jwt from "jsonwebtoken"
let { MAX_OTP_ATTEMPTS, OTP_TTL } = configService


let getAttemptsKey = (email) => `${email}-attempts`

let genOtp = async (email) => {
  let key = getAttemptsKey(email)
  let attempts = await client.get(key)

  if (attempts && attempts >= MAX_OTP_ATTEMPTS) {
    let ttl = await client.ttl(key)
    throw new Error("Too many attempts retry after " + Math.ceil(ttl / 60) + " m", { cause: 400 })
  }
  let otp = Math.trunc(Math.random() * 1000).toString().padStart(4, "0")
  let hashedOtp = await bcrypt.hash(otp, 10)
  return {
    otp, hashedOtp
  }

}

let checkOTP = async (req) => {
  let { email, otp } = req.body
  let user = await userModel.findOne({ email })

  let userOtp = await client.get(email)
  console.log({ userOtp, otp })

  if (!user || !userOtp) throw new Error("wrong OTP", { cause: 400 })

  let key = getAttemptsKey(email)
  if (!await bcrypt.compare(otp, userOtp)) {
    let attempts = await client.get(key)
    let ttl = await client.ttl(key)
    if (attempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Too many attempts retry after " + Math.ceil(ttl / 60) + " m", { cause: 400 })
    }
    if (!attempts) client.set(key, 0, {
      expiration: {
        type: "EX",
        value: OTP_TTL
      }
    })
    await client.incr(key)
    attempts = await client.get(key)

    if (attempts >= MAX_OTP_ATTEMPTS) {
      throw new Error("Too many attempts", { cause: 400 })
    }
    throw new Error("Wrong otp", { cause: 400 })

  }

  await client.del(email)
  await client.del(key)
  return user
}

export const getAllUsers = async (req, res) => {


  let user = await userModel.findOne({}).lean({ virtuals: true }).populate("posts")



  res.status(200).json({
    message: "users fetched",
    user
  })

}

export const createUser = async (req, res) => {
  try {
    let { fullName, email, password, gender, DOB } = req.body
    console.log(req.body)

    DOB = new Date().setFullYear(Number(DOB))

    let user = await userModel.create({ fullName, email, password: await bcrypt.hash(password, 10), gender, DOB })


    if (req.file) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        public_id: `${req.file.originalname}-${Date.now()}`,
        folder: `users/profile/${user._id.toString()}`
      })

      user = await userModel.findByIdAndUpdate(user._id, {
        $set: {
          profileImage: { secure_url, public_id }
        }
      }, { returnDocument: "after" })
    }

    let { otp, hashedOtp } = await genOtp(email)

    emailEvent.emit(emailEventName.signUp, {
      to: user.email,
      html: `
        <h1> Your OTP for saraha </h1>
        <p> ${otp} </p>
      `
    })

    await client.set(email, hashedOtp, {
      expiration: {
        type: "EX",
        value: OTP_TTL
      }
    })

    res.status(201).json({
      message: "user created",
      user
    })

  } catch (e) {
    console.log(e)
    throw e
  }

}

// tow step =====================================

export const toggle2step = async (req, res) => {
  let { email } = req.body
  let user = await userModel.findOne({ email })

  if (!user) throw new Error("user not found", { cause: 404 })

  let { otp, hashedOtp } = await genOtp(email)


  emailEvent.emit(emailEventName.signUp, {
    to: user.email,
    html: `
        <h1> Your OTP for saraha </h1>
        <p> ${otp} </p>
      `
  })

  await client.set(email, hashedOtp, {
    expiration: {
      type: "EX",
      value: OTP_TTL
    }
  })

  res.status(200).json({
    msg: "otp already send to your email",
    user
  })
}
export const verify2StepOtp = async (req, res) => {
  let user = await checkOTP(req)

  user = await userModel.findByIdAndUpdate(user._id, {
    $set: { twoStep: !user.twoStep }
  }, {
    returnDocument: "after"
  })

  res.status(200).json({
    msg: "OTP VERIFY",
    user
  })
}
// tow step =====================================


export const login = async (req, res) => {
  let { email, password } = req.body

  let user = await userModel.findOne({ email })

  if (!user || !await bcrypt.compare(password, user.password)) throw new Error("wrong credentials", { cause: 400 })

  if (user.twoStep) {
    let { otp, hashedOtp } = await genOtp(email)

    console.log({ otp, hashedOtp })

    emailEvent.emit(emailEventName.signUp, {
      to: user.email,
      html: `
        <h1> Your OTP for saraha </h1>
        <p> ${otp} </p>
      `
    })

    await client.set(email, hashedOtp, {
      expiration: {
        type: "EX",
        value: OTP_TTL
      }
    })
    return res.status(200).json({
      msg: "otp already send to your email",
      user
    })
  }

  return res.status(200).json({
    msg: "log in",
    user
  })
}

export const verifyLoginOtp = async (req, res) => {
  let user = await checkOTP(req)

  return res.status(200).json({
    msg: "user Login",
    user
  })
}



export const verifyOtp = async (req, res) => {
  let user = await checkOTP(req)

  user = await userModel.findByIdAndUpdate(user._id, {
    $set: { isVerify: true },
    $unset: { otp: "" }
  })

  res.status(200).json({
    msg: "OTP VERIFY",
    user
  })
}



export const updateProfileImage = async (req, res, next) => {
  try {

    let user = await userModel.findOne({ email: req.body.email })

    if (!user) throw new Error("user not found", { cause: 404 })

    let { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      public_id: `${req.file.originalname}-${Date.now()}`,
      folder: `users/profile/${user._id.toString()}`
    })

    let oldPublicId = user.profileImage.public_id

    user = await userModel.findByIdAndUpdate(user._id, {
      $set: {
        profileImage: { secure_url, public_id }
      }
    }, { returnDocument: "after" })


    oldPublicId && console.log(await cloudinary.uploader.destroy(oldPublicId))


    res.status(201).json({
      message: "user updated",
      user
    })


  } catch (e) {
    throw e
  }
}

export const deleteUser = async (req, res, next) => {
  try {

    let user = await userModel.findOne({ email: req.params.email })

    if (!user) throw new Error("user not found", { cause: 404 })

    let folderPath = user.profileImage.public_id.split("/")
    folderPath.pop()
    folderPath = folderPath.join("/")


    user = await userModel.findByIdAndDelete(user._id)

    console.log(await cloudinary.api.delete_resources_by_prefix(folderPath))
    console.log(await cloudinary.api.delete_folder(folderPath))


    res.status(201).json({
      message: "user deleted",
      user
    })


  } catch (e) {
    console.log(e)
    throw new Error(e.error.message, { cause: e.error.http_code })
  }
}


export const loginWithGoogle = async (req, res) => {
  let { idToken } = req.body
  console.log({ idToken })
  let payload = await verify(idToken)
  console.log(payload)
  let { email, name, given_name, family_name, picture, email_verified } = payload
  let user = await userModel.findOne({ email })
  if (user) {
    let token = jwt.sign({ _id: user._id }, "secret", {
      expiresIn: "1h"
    })

    return res.status(200).json({
      message: "user logged in",
      token
    })


  }

  user = await userModel.create({
    email, firstName: given_name, lastName: family_name, provider: "google", profileImage: picture, isVerify: email_verified
  })

  let token = jwt.sign({ _id: user._id }, "secret", {
    expiresIn: "1h"
  })

  res.status(201).json({
    message: "user created",
    token
  })

}




async function verify(token) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: configService.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) throw new Error("not verified account", { cause: 401 })
  return payload
}

/***
 * 
 * 
 * {
  iss: 'https://accounts.google.com',
  azp: '480593851630-1ciuru9hvmmhah8b1joad9e371ra9fal.apps.googleusercontent.com',
  aud: '480593851630-1ciuru9hvmmhah8b1joad9e371ra9fal.apps.googleusercontent.com',
  sub: '110035285738451494335',
  email: 'alihgad2@gmail.com',
  email_verified: true,
  nonce: 'not_provided',
  nbf: 1790015526,
  name: 'Ali Hassan',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocIiUSpoIZ9pxEF03PYircWnyEWCFuNm5_4ddn5aFIgmTKsEZORyJQ=s96-c',
  given_name: 'Ali',
  family_name: 'Hassan',
  iat: 1790015826,
  exp: 1790019426,
  jti: '8f958b51951e4857d62810edbb3d89a323201d01'
}



 */
