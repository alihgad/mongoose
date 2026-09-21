import mongoose from "mongoose"
import configService from "../config/config.service.js"

export default async ()=>{
  try{
    await mongoose.connect(configService.DB_URI,{
      connectTimeoutMS : 1000
    })
    console.log("Database connected")
  }catch(e){
    console.log(e)
  }
}