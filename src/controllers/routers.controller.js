import { pool } from '../db.js'

// validar si es admin
export const validarAdmin = async (userEmail, userPassword, res) => {
  const [user] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND password = ?', [userEmail, userPassword])

  if (user.length === 0) {
    throw new Error('Usuario o contraseña incorrectos')
  }

  if (user[0].rol_id !== 1) {
    return false
  }
  return true
}

// mostrar todos los usuarios para el admin
export const usuariosAll = async (req, res) => {
  const { userEmail, userPassword } = req.body
  try {
    const isAdmin = await validarAdmin(userEmail, userPassword, res)
    if (!isAdmin) {
      return res.status(403).json({ message: 'no tienes permiso' })
    }
    const [rows] = await pool.query('SELECT * FROM usuarios')
    res.json(rows)
  } catch (error) {
    return res.status(500).json({ message: 'algo anda mal' })
  }
}

// crear un usuario o perfil
export const crearUsuario = async (req, res) => {
  const { nombres, apellidos, fechaNacimiento, sexo, email, password, rolId } = req.body
  const perfilFoto = req.file ? req.file.filename : null

  if (!nombres || !apellidos || !fechaNacimiento || !sexo || !email || !password || !rolId) {
    return res.status(400).json({
      message: 'Todos los campos son obligatorios'
    })
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      message: 'El email proporcionado no es válido'
    })
  }

  try {
    const [rows] = await pool.query('INSERT INTO usuarios (nombres, apellidos, fecha_nacimiento, sexo, email, password, rol_id, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nombres, apellidos, fechaNacimiento, sexo, email, password, rolId, perfilFoto])

    res.send({
      id: rows.insertId,
      nombres,
      apellidos,
      fechaNacimiento,
      sexo,
      email,
      password,
      rolId,
      perfilFoto
    })
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    return res.status(500).json({
      message: 'Algo anda mal'
    })
  }
}

//  editar su propio perfil del usuario
export const editarUsuarioId = async (req, res) => {
  const { id } = req.params
  const { nombres, apellidos, fechaNacimiento, sexo, email, password, rolId, perfilFoto, userEmail, userPassword } = req.body
  console.log(req.body)

  if (!nombres && !apellidos && !fechaNacimiento && !sexo && !email && !password && !rolId && !perfilFoto) {
    return res.status(400).json({
      message: 'Debe proporcionar al menos un campo para actualizar'
    })
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      message: 'El email proporcionado no es válido'
    })
  }

  try {
    const [rows] = await pool.query('SELECT email, password FROM usuarios WHERE id = ?', [id])
    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'no tienes autorizacion para editar este perfil'
      })
    }

    const [result] = await pool.query(
      'UPDATE usuarios SET nombres = COALESCE(?, nombres), apellidos = COALESCE(?, apellidos), fecha_nacimiento = COALESCE(?, fecha_nacimiento), sexo = COALESCE(?, sexo), email = COALESCE(?, email), password = COALESCE(?, password), rol_id = COALESCE(?, rol_id), foto = COALESCE(?, foto) WHERE id = ?',
      [nombres, apellidos, fechaNacimiento, sexo, email, password, rolId, perfilFoto, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'usuario no encontrado'
      })
    }

    const [resultado] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id])
    res.json(resultado[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// eliminar su propia cuenta del usuario por si mismo
export const eliminarUsuarioId = async (req, res) => {
  const { id } = req.params
  const { userEmail, userPassword } = req.body

  try {
    const [rows] = await pool.query('SELECT email, password FROM usuarios WHERE id = ?', [id])

    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'no tienes permiso para eliminar este perfil'
      })
    }

    const result = await pool.query('DELETE FROM usuarios WHERE id = ?', [id])

    if (result[0].affectedRows <= 0) {
      return res.status(404).json({
        success: false,
        message: 'usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'usuario eliminado exitosamente'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Algo anda mal',
      error: error.message
    })
  }
}

// crear una publicacion
export const crearPublicacion = async (req, res) => {
  const { titulo, contenido, fechaCreacion, usuarioId } = req.body
  const publicacionImagen = req.file ? req.file.filename : null

  try {
    const [rows] = await pool.query('INSERT INTO publicaciones (titulo, contenido, fecha_creacion, usuario_id, imagen) VALUES (?, ?, ?, ?, ?)', [titulo, contenido, fechaCreacion, usuarioId, publicacionImagen])

    res.send({
      id: rows.insertId,
      titulo,
      contenido,
      fechaCreacion,
      usuarioId,
      publicacionImagen
    })
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    return res.status(500).json({
      message: 'Algo anda mal'
    })
  }
}

// editar su propia publicacion del usuario
export const editarPublicacionId = async (req, res) => {
  const { id } = req.params
  const { titulo, contenido, fechaCreacion, usuarioId, publicacionImagen, userEmail, userPassword } = req.body
  console.log(req.body)

  if (!titulo && !contenido && !fechaCreacion && !usuarioId && !publicacionImagen) {
    return res.status(400).json({
      message: 'Debe proporcionar al menos un campo para actualizar'
    })
  }

  try {
    const [rows] = await pool.query('SELECT email, password FROM publicaciones JOIN usuarios ON publicaciones.usuario_id = usuarios.id WHERE publicaciones.id = ?', [id])

    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'No tienes permiso para editar esta publicación'
      })
    }

    const [result] = await pool.query(
      'UPDATE publicaciones SET titulo = COALESCE(?, titulo), contenido = COALESCE(?, contenido), fecha_creacion = COALESCE(?, fecha_creacion), usuario_id = COALESCE(?, usuario_id), imagen = COALESCE(?, imagen) WHERE id = ?',
      [titulo, contenido, fechaCreacion, usuarioId, publicacionImagen, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'publicacion no encontrado'
      })
    }

    const [resultado] = await pool.query('SELECT * FROM publicaciones WHERE id = ?', [id])
    res.json(resultado[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// eliminar su propia publicacion del usuario
export const eliminarPublicacionId = async (req, res) => {
  const { id } = req.params
  const { userEmail, userPassword } = req.body

  try {
    const [rows] = await pool.query('SELECT email, password FROM publicaciones JOIN usuarios ON publicaciones.usuario_id = usuarios.id WHERE publicaciones.id = ?', [id])

    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'No tienes permiso para eliminar esta publicación'
      })
    }

    const result = await pool.query('DELETE FROM publicaciones WHERE id = ?', [id])

    if (result[0].affectedRows <= 0) {
      return res.status(404).json({
        success: false,
        message: 'publicacion no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'publicacion eliminado exitosamente'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Algo anda mal',
      error: error.message
    })
  }
}

// mostrar todas las publicaciones
export const publicacionesAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM publicaciones')
    res.json(result[0])
  } catch (error) {
    return res.status(500).json({ message: 'algo anda mal' })
  }
}

// buscar y obtener publicaciones por su Categoria
export const publiPorCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT p.categoria_id, c.categoria, p.titulo, p.contenido, p.fecha_creacion, u.nombres FROM publicaciones p INNER JOIN usuarios u ON p.usuario_id=u.id INNER JOIN categorias c ON p.categoria_id=c.id WHERE p.categoria_id = ?', [req.params.id])
    res.json(result[0])

    if (result.length === 0) {
      return res.status(404).json({
        message: 'categoria no encontrada'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// buscar y obtener una publicacion por su nombre
export const publiPorNombre = async (req, res) => {
  const { titulo } = req.params
  try {
    const result = await pool.query('SELECT p.id, p.titulo, p.contenido, p.fecha_creacion, u.nombres, c.categoria FROM publicaciones p INNER JOIN usuarios u ON p.usuario_id=u.id INNER JOIN categorias c ON p.categoria_id=c.id WHERE p.titulo = ?', [titulo])
    res.json(result[0])

    if (result.length === 0) {
      return res.status(404).json({
        message: 'titulo no encontrado'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// crear una categoria siendo Admin
export const crearCategoria = async (req, res) => {
  const { userEmail, userPassword, categoria } = req.body
  try {
    const isAdmin = await validarAdmin(userEmail, userPassword, res)
    if (!isAdmin) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta accion' })
    }
    // Insertar la nueva categoría en la base de datos
    const result = await pool.query('INSERT INTO categorias (categoria) VALUES (?)', [categoria])
    if (!categoria) {
      return res.status(400).json({
        message: 'El campo "categoria" es requerido'
      })
    }
    // Devolver la respuesta con el ID de la nueva categoría y la categoría misma
    res.send({
      id: result[0].insertId,
      categoria
    })
  } catch (error) {
    // Manejar el error y devolver una respuesta de error con un mensaje genérico
    console.error(error)
    return res.status(500).json({
      message: 'Algo anda mal'
    })
  }
}

// mostrar todas las catetgorias
export const categoriasAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias')
    res.json(rows)
  } catch (error) {
    return res.status(500).json({ message: 'algo anda mal' })
  }
}

// editar una categoria por su ID siendo Admin
export const editarCategoriaId = async (req, res) => {
  const { id } = req.params
  const { categoria, userEmail, userPassword } = req.body

  if (!categoria) {
    return res.status(400).json({
      message: 'Debe proporcionar al menos un campo para actualizar'
    })
  }

  try {
    const isAdmin = await validarAdmin(userEmail, userPassword)

    if (!isAdmin) {
      return res.status(403).json({ message: 'no tienes autorizacion para realizar esta accion' })
    }

    const [result] = await pool.query(
      'UPDATE categorias SET categoria = COALESCE(?, categoria) WHERE id = ?',
      [categoria, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'usuario no encontrado'
      })
    }

    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id])
    res.json(rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// eliminar categoria por su ID siendo Admin
export const eliminarCategoriaId = async (req, res) => {
  const { id } = req.params
  const { userEmail, userPassword } = req.body
  try {
    const isAdmin = await validarAdmin(userEmail, userPassword)

    if (!isAdmin) {
      return res.status(403).json({ message: 'no tienes autorizacion para realizar esta accion' })
    }

    const result = await pool.query('DELETE FROM categorias WHERE id = ?', [id])

    if (result[0].affectedRows <= 0) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'categoria eliminado exitosamente'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Algo anda mal',
      error: error.message
    })
  }
}

// crear un comentario en una publicacion
export const crearComentario = async (req, res) => {
  const { contenido, fechaCreacion, publicacionId, usuarioId } = req.body
  try {
    const [rows] = await pool.query('INSERT INTO comentarios (contenido, fecha_creacion, publicacion_id, usuario_id) VALUES (?, ?, ?, ?)', [contenido, fechaCreacion, publicacionId, usuarioId])

    res.send({
      id: rows.insertId,
      contenido,
      fechaCreacion,
      publicacionId,
      usuarioId
    })
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    return res.status(500).json({
      message: 'Algo anda mal'
    })
  }
}

// editar su propio comentario del usuario
export const editarComentarioID = async (req, res) => {
  const { id } = req.params
  const { contenido, fechaCreacion, publicacionId, userEmail, userPassword } = req.body

  if (!contenido && !fechaCreacion && !publicacionId) {
    return res.status(400).json({
      message: 'Debe proporcionar al menos un campo para actualizar'
    })
  }
  try {
    const [rows] = await pool.query('SELECT email, password FROM comentarios JOIN usuarios ON comentarios.usuario_id = usuarios.id WHERE comentarios.id = ?', [id])

    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'No tienes permiso para editar este comentario'
      })
    }

    const result = await pool.query('UPDATE comentarios SET contenido = COALESCE(?, contenido), fecha_creacion = COALESCE(?, fecha_creacion), publicacion_id = COALESCE(?, publicacion_id), usuario_id = COALESCE(?, usuario_id) WHERE id = ?', [contenido, fechaCreacion, publicacionId, id])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'usuario no encontrado'
      })
    }

    const [resultado] = await pool.query('SELECT * FROM comentarios WHERE id = ?', [id])
    res.json(resultado[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}

// eliminar su propio comentario del usuario
export const eliminarComentarioId = async (req, res) => {
  const { id } = req.params
  const { userEmail, userPassword } = req.body

  try {
    const [rows] = await pool.query('SELECT email, password FROM comentarios JOIN usuarios ON comentarios.usuario_id = usuarios.id WHERE comentarios.id = ?', [id])

    if (rows.length === 0 || rows[0].email !== userEmail || rows[0].password !== userPassword) {
      return res.status(403).json({
        message: 'No tienes permiso para eliminar este comentario'
      })
    }

    const result = await pool.query('DELETE FROM comentarios WHERE id = ?', [id])

    if (result[0].affectedRows <= 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'comentario eliminado exitosamente'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Algo anda mal',
      error: error.message
    })
  }
}

// mostrar cada publicacion con sus comentarios
export const publiConComentariosId = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT p.id, p.titulo, p.contenido, p.fecha_creacion, u.nombres, p.imagen, cm.id, cm.contenido, cm.fecha_creacion FROM publicaciones p INNER JOIN usuarios u ON p.usuario_id = u.id LEFT JOIN comentarios cm ON p.id = cm.publicacion_id WHERE p.id = ? ORDER BY cm.fecha_creacion', [id])
    res.json(result[0])

    if (result.length === 0) {
      return res.status(404).json({
        message: 'titulo no encontrado'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'algo anda mal'
    })
  }
}
