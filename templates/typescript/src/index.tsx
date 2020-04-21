import './index.scss'
import dva from 'dva'
import { createBrowserHistory } from 'history'
require('viewport-units-buggyfill').init()

const app = dva({
  history: createBrowserHistory(),
  onError: e => {
    console.error(e.message)
  }
})

// 2. Plugins
// app.use({});

// 3. Model
require('./models').default.map(item => app.model(item.default))

app.router(require('./router').default)

app.start('#root')
