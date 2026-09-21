import { Router } from "express";
import * as ps from "./post.service.js"

let postRouter = Router()



postRouter.get("/" , ps.getAllPosts)
// postRouter.get("/:id" , ps.getUserPosts)
postRouter.post("/" , ps.createPost)


export default postRouter