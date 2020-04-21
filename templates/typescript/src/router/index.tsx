import React, { Suspense } from 'react'

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import App from '../container/App'
const Loading: React.FC<any> = () => {
  return <div></div>
}

const RouterConfig = () => {
  return (
    <Router basename="/atool2c4h5">
      <Suspense fallback={<Loading></Loading>}>
        <Switch>
          <Route path="/" exact component={App} />
        </Switch>
      </Suspense>
    </Router>
  )
}

export default RouterConfig
