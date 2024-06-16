import { src, dest, watch, parallel, series } from 'gulp'
import browserSync from 'browser-sync'
import config from './src/config'

const paths = {
  htmls: [
    'src/public/**/**/*.html'
  ],
  styles: [
  	'static/assets/css/*.css'
  ],
  scripts: [
  	'src/public/**/**/*.js',
  	'static/assets/js/*.js'
  ],
  images: [
  	'static/assets/img/*.png',
  	'static/assets/img/*.jpg'
  ]
}

// Watch Task
export const devWatch = () => {
  watch(paths.htmls, browserSync.reload)
	watch(paths.styles, browserSync.reload)
	watch(paths.scripts, browserSync.reload)
	watch(paths.images, browserSync.reload)
}

export const devbrowserSync = () => {
  return browserSync.init(null, {
    proxy: `http://localhost:${config.port}`,
    files: ["src/**/*.*", "static/assets/**/*.*"],
    // browser: "google chrome",
    port: 8080,
  })
}

export const dev = series(devbrowserSync, parallel(devWatch))

export default dev
