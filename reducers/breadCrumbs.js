import {NAVIGATE} from '../actions/ActionTypes'
import capitalize from 'lodash.capitalize'

export default function allRegions(state = [], action) {
  switch (action.type) {
    case NAVIGATE:
      const segments = action.match.url.split('/').slice(1).filter(Boolean)
      return segments.map((segment, i) => {
        return {
          url: `/${segments.slice(0, i + 1).join('/')}`,
          title: capitalize(segments[i])
        }
      })

    default:
      return state
  }
}
