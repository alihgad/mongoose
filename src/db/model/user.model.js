import mongoose, { Schema } from "mongoose";
import * as bcrypt from "bcrypt"
import { postModel } from "./post.model.js";
import mongooseLeanVirtuals  from "mongoose-lean-virtuals"

let userSchema = new Schema({
  firstName: {
    type : String,
    required : true,
    minLength : 2
  },
  lastName: {
    type : String,
    required : true,
    minLength : 2
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 2,
    maxLength: 100
  },
  password: {
    type:String,
    required : function(){
      return this.provider == "system"
    }
  },
  isVerify: {
    default: false,
    type: Boolean
  },
  DOB: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superAdmin"],
    default: "user"
  },
  gender: {
    type: "string",
    enum: ["male", "female"]
  },
  profileImage:{
    secure_url : String,
    public_id : String
  },
  twoStep:{
    type : Boolean,
    default : false
  },
  provider:{
    type : "string",
    enum : ["google" , "system"],
    default : "system"
  }
}, {
  timestamps: true,
  // strictQuery: "throw",
  // strict: "throw",
  // optimisticConcurrency: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
})  

userSchema.plugin(mongooseLeanVirtuals)


// userSchema.pre("save" ,function(){
//   console.log(this)
//   if(this.isModified("password")){
//     this.password = bcrypt.hashSync(this.password , 10)  
//   }
//   console.log(this)
//   console.log("pre save")
// })

// userSchema.pre("findOne" , function(doc){

//   let {admin }= this.getOptions()

//   let mainQuery = this.getQuery()
//   console.log(mainQuery)

//   this.setQuery({...mainQuery , ...( admin ? {} : {isDeleted:false} )})

//   console.log("pre find")
// })

// userSchema.post("deleteOne" ,async function(){
//   console.log(this.getQuery())
//   let {_id : userId} = this.getQuery()

//   console.log(await postModel.deleteMany({userId}))

//   console.log("pre delete")
// })

userSchema.virtual("fullName").set(function(value){
  console.log(value)
  let [firstName,lastName ] = value.split(" ")
  this.firstName = firstName
  this.lastName = lastName
}).get(function () {
  return `${this.firstName} ${this.lastName}`
})


userSchema.virtual("posts",{
  ref : "posts",
  localField : "_id",
  foreignField : "userId"
})

export let userModel = mongoose.model("users", userSchema)