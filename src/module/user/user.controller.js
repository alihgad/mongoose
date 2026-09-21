import { Router } from "express";
import * as us from "./user.service.js"
import { multerCloud, multerMemoryCloud } from "../../common/middleware/multer.js";
import mimeTypes from "../../common/utils/mimeTypes.js";
import cloudinary from "../../common/utils/cloudinary.js";

let userRouter = Router()


userRouter.get("/", us.getAllUsers)



userRouter.post("/", multerCloud({ allowedTypes: mimeTypes.image }).single("image"), us.createUser)
userRouter.post("/login", us.login)
userRouter.post("/loginOtp", us.verifyLoginOtp)
userRouter.post("/otp", us.verifyOtp)


userRouter.post("/toggle2step", us.toggle2step)
userRouter.post("/otp2step", us.verify2StepOtp)


userRouter.post("/gmail", us.loginWithGoogle)






userRouter.put("/", multerCloud({ allowedTypes: mimeTypes.image }).single("image"), us.updateProfileImage)
userRouter.delete("/:email", us.deleteUser)

userRouter.post("/disk", multerCloud({ allowedTypes: mimeTypes.image }).single("image"),async (req,res)=>{
  let result = await cloudinary.uploader.upload(req.file.path)

  res.status(200).json({
    result
  })

})


userRouter.post("/image", multerMemoryCloud({ allowedTypes: [...mimeTypes.image] })
  .single("image"), async (req, res) => {
    console.log({f : req.file})
    let { secure_url, public_id } = cloudinary.uploader.upload_stream((err,result)=>{
      if(err){
        console.log(err)
        return res.status(500).json({
          err
        })
      }else{
        res.status(200).json({
          result
        })
        console.log(result)
      }

    }).end(req.file.buffer)


  })


export default userRouter