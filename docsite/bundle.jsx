import 'babelify/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Router from '../lib/Router'
import compileRoutes from '../lib/compileRoutes'
import Index from './components/Index'
import registry from './registry'
import routeComponentInGroup from './utils/routeComponentInGroup'

const componentRoutes = registry.reduce((routes, group) => {
  group.components.forEach(component => {
    routes[routeComponentInGroup(component, group)] = component
  })
  return routes
}, {})


const routeMappings = {
  '/docs': Index,
  ...componentRoutes
}

const routes = compileRoutes(routeMappings)

const container = document.getElementById('main')
const router = Router(routes, match => {
  const Component = match.handler
  ReactDOM.render(<Component registry={registry}/>, container)
})

router.navigate(document.location.pathname)
setTimeout(() => {
  // Need to bind the global click listener *after* react has mounted and bound its global listener to document
  // or else we're not able to stop propagation when we need to
  // Todo: See if this can be solved better
  router.bind(document)
}, 0)
