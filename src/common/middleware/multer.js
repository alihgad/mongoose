import multer from "multer";
import fs from "node:fs"
import path from "node:path"


export const multerLocal = ({ customPath, allowedTypes } = {}) => {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folderPath = `uploads/${customPath ? customPath : ""}`
      let exists = fs.existsSync(path.resolve(folderPath))
      if (!exists) {
        fs.mkdirSync(folderPath, { recursive: true })
      }
      cb(null, folderPath)
    },
    filename: (req, file, cb) => {
      let prefix = Date.now()

      cb(null, `${prefix}-${Math.trunc(Math.random() * 100000)}-${file.originalname}`)
    }
  })

  let fileFilter = function (req, file, cb) {
    let mt = file.mimetype
    if (allowedTypes.includes(mt)) {
      cb(null, true)
    } else {
      cb(new Error("unexpected file type"), false)
    }
  }

  return multer({
    storage, fileFilter
    // ,limits : {
    // fileSize : 5 * 1024 * 1024
    // }
  })
}

export const multerCloud = ({allowedTypes} = {}) => {
  return multer({
    storage: multer.diskStorage({}),
    // fileFilter: function (req, file, cb) {
    //   let mt = file.mimetype
    //   if (allowedTypes.includes(mt)) {
    //     cb(null, true)
    //   } else {
    //     cb(new Error("unexpected file type"), false)
    //   }
    // }
  })
}

export const multerMemoryCloud = ({allowedTypes} = {}) => {
  return multer({
    storage: multer.memoryStorage({}),
    // fileFilter: function (req, file, cb) {
    //   let mt = file.mimetype
    //   if (allowedTypes.includes(mt)) {
    //     cb(null, true)
    //   } else {
    //     cb(new Error("unexpected file type"), false)
    //   }
    // }
  })
}