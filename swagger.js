import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    title: 'Blogging',
    description: 'blogging funvall'
  },
  host: 'localhost:3000',
  schemes: ['http']
}

const outputFile = './swagger-output.json'
const endpointsFiles = ['./src/index.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  import('./src/index.js').then(() => {
    // Aquí puedes agregar cualquier código adicional que desees ejecutar después de importar index.js
  })
})
