import {RECEIVE_CARD_PAGE_DATA} from '../actions/cardPages'

export default function region(state = null, action) {
  switch (action.type) {
    case RECEIVE_CARD_PAGE_DATA:
      return action.region
    default:
      return state
  }
}
