import mongoose, { Schema, Types } from "mongoose";

let postSchema = new Schema({
  name : String,
  content:{
    type : String,
    minLength : 5,
    maxLength : 5000,
    required : true
  },
  image: String,
  userId :{
    type : Types.ObjectId,
    ref: "users",
  },
  isDeleted:{
    type : Boolean,
    default : false
  }
},{
  timestamps : true ,
  strictQuery : "throw",
  strict : "throw",
  optimisticConcurrency : true
})

// postSchema.pre(/^find/ , function(doc){

//   let {admin }= this.getOptions()

//   let mainQuery = this.getQuery()
//   console.log(mainQuery)

//   this.setQuery({...mainQuery , ...( admin ? {} : {isDeleted:false} )})
  
//   console.log("pre find")
// })




export let postModel = mongoose.model("posts" , postSchema )