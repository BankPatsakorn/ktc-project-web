import config from './config'
import express from './config/express'

const port = config.port

const app = express()

app.listen(port)
module.exports = app
console.log('listening on', port)
