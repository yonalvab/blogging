import multer from 'multer'

// almacenamiento de las foto de perfil
const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'fotoPerfil/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
export const fotoPerfil = multer({
  storage: storagePerfil,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      cb(new Error('solo se permiten imagenes jpg'))
    }
  }
})

// almacenamiento de las fotos en las publicaciones
const storagePubli = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imagenPubli/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
export const imagenPubli = multer({
  storage: storagePubli,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
      cb(null, true)
    } else {
      cb(new Error('solo se permiten imagenes jpg'))
    }
  }
})
