import express from 'express'
import { PORT } from './config.js'
import { fotoPerfil, imagenPubli } from './config/multer.js'
import { crearUsuario, editarUsuarioId, eliminarUsuarioId, crearPublicacion, editarPublicacionId, eliminarPublicacionId, publicacionesAll, publiPorCategorias, publiPorNombre, usuariosAll, crearCategoria, categoriasAll, eliminarCategoriaId, editarCategoriaId, crearComentario, editarComentarioID, eliminarComentarioId, publiConComentariosId } from './controllers/routers.controller.js'

import swaggerUi from 'swagger-ui-express'
import fs from 'fs'

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf-8'))

const app = express()
app.use(express.json())

// CORS

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')

  next()
})

// mostrar todos los usuarios
app.get('/perfil', usuariosAll)

// crear un perfil de usuario
app.post('/perfil', fotoPerfil.single('perfilFoto'), crearUsuario)

// actualizar un perfil de usuario
app.put('/perfil/:id', fotoPerfil.single('perfilFoto'), editarUsuarioId)

// borrar un perfil de usuario
app.delete('/perfil/:id', eliminarUsuarioId)

// crear una publicacion
app.post('/publi', imagenPubli.single('publicacionImagen'), crearPublicacion)

// editar su propia publicacion del usuario
app.put('/publi', imagenPubli.single('publicacionImagen'), editarPublicacionId)

// eliminar su propia publicacion del usuario
app.delete('/publi/:id', eliminarPublicacionId)

// mostrar todas las publicaciones
app.get('/publi', publicacionesAll)

// buscar y obtener publicaciones por su Categoria
app.get('/publi/categorias/:id', publiPorCategorias)

// buscar y obtener una publicacion por su nombre
app.get('/publi/:titulo', publiPorNombre)

// mostrar todas las categorias
app.get('/categorias', categoriasAll)

// crear una categoria siendo Admin
app.post('/categorias', crearCategoria)

// editar una categoria por su ID siendo Admin
app.put('/categorias/:id', editarCategoriaId)

// eliminar categoria por su ID siendo Admin
app.delete('/categorias/:id', eliminarCategoriaId)

// crear un comentario en una publicacion
app.post('/comentarios', crearComentario)

// editar su propio comentario del usuario
app.put('/comentarios/:id', editarComentarioID)

// eliminar su propio comentario del usuario
app.delete('/comentarios/:id', eliminarComentarioId)

// mostrar cada publicacion con sus comentarios
app.get('/comentarios/:id', publiConComentariosId)

// ruta al swagger de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => console.log(`servidor levantado en http://localhost:${PORT}`))
