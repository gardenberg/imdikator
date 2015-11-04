import {SET_CURRENT_CARD, CLOSE_CARD} from '../actions/ActionTypes'

export default function cards(state = [], action) {
  switch (action.type) {
    case SET_CURRENT_CARD:
      return state.filter(cardName => cardName !== action.card.name).concat(action.card.name)
    case CLOSE_CARD:
      return state.filter(cardName => cardName !== action.card.name)
    default:
      return state
  }
}
