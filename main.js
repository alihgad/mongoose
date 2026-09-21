import express from 'express'
import connection from "./src/db/connection.js"
import userRouter from './src/module/user/user.controller.js'
import postRouter from './src/module/post/post.controller.js'
import cors from "cors"



export const app = express()
const port = 3000


app.use(express.json())
app.use(cors())


connection()

app.use("/users", userRouter)
app.use("/posts", postRouter)
app.get('/', (req, res) => res.send('Hello World!'))



app.use((err, req, res, next) => {
  res.status(err.status || err.cause || 500).json({
    message: err.message || "internal server error",
    stack: err.stack
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

export default app