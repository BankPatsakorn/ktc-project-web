import express from 'express'

export default () => {
  const app = express()

  // set the view engine to ejs
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/../app/views')

  require('../app/routes/index.server.route.js')(app)

  app.use(express.static(__dirname + '/../public', { redirect: false }))
  app.use('/static', express.static(__dirname + '/../../static'))

  return app
}
