import {NAVIGATE, SET_CURRENT_CARDS_PAGE} from '../actions/ActionTypes'

import {SET_CURRENT_REGION, RECEIVE_REGION_SUMMARY_DATA} from '../actions/ActionTypes'


function reduceSummary(state = {}, action) {
  switch (action.type) {
    case REQUEST_REGION_SUMMARY_DATA:
      return Object.assign({}, state, {
        loading: true,
        query: null,
        queryResult: null
      })
    case RECEIVE_REGION_SUMMARY_DATA:
      return Object.assign({}, state, {
        loading: false,
        query: action.query,
        queryResult: action.queryResult
      })
    default:
      return state
  }
}

function reduceSummaryForRegion(state = {}, action) {
  switch (action.type) {
    case REQUEST_REGION_SUMMARY_DATA:
    case RECEIVE_REGION_SUMMARY_DATA:
      return Object.assign({}, state, {
        [action.summaryConfig.name]: reduceSummary(state[action.summaryConfig.name], action)
      })
    default:
      return state
  }
}

export default function currentCardsPage(state = null, action) {
  switch (action.type) {
    case SET_CURRENT_CARDS_PAGE:
      return action.cardsPage
    case NAVIGATE:
      if (!action.match.params.cardsPageName) {
        return null
      }
      return state
    default:
      return state
  }
}
