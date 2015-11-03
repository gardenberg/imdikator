import {NAVIGATE} from '../actions/ActionTypes'
import capitalize from 'lodash.capitalize'

export default function allRegions(state = null, action) {
  switch (action.type) {
    case NAVIGATE:
      return action.match.handler
    default:
      return state
  }
}
