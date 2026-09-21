import { postModel } from "../../db/model/post.model.js"
import { userModel } from "../../db/model/user.model.js"

export const getAllPosts = async (req, res) => {
  let posts = await postModel.find({}).populate({
    path:"userId",
    model:"users",
  }).select("content").skip(1).limit(2).sort({_id : -1})

  res.status(200).json({
    message: "posts fetched",
    posts
  })

}


export const createPost = async (req, res) => {
  try {
    let { content, userId } = req.body

    if (!await userModel.findById(userId)) {
      throw new Error("user not found", { cause: 404 })
    }

    let user = await postModel.create({ content, userId })
    res.status(201).json({
      message: "post created",
      user
    })
  } catch (e) {
    throw e
  }

}