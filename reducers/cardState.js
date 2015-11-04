import {
  REQUEST_CARD_QUERY_RESULT,
  RECEIVE_CARD_QUERY_RESULT,
  SET_CURRENT_TAB
} from '../actions/ActionTypes'


function reduceTabState(state = {}, action) {
  switch (action.type) {
    case REQUEST_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        region: action.currentRegion,
        cardsPage: action.currentCardsPage,
        card: action.currentCard,
        headerGroups: action.headerGroups,
        query: action.query,
        queryResults: action.queryResults
      })
    case RECEIVE_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        region: action.currentRegion,
        cardsPage: action.currentCardsPage,
        card: action.currentCard,
        headerGroups: action.headerGroups,
        query: action.query,
        queryResult: action.queryResult
      })
    default:
      return state
  }
}

function reduceTabs(state = {}, action) {
  switch (action.type) {
    case REQUEST_CARD_QUERY_RESULT:
    case RECEIVE_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        [action.tab.name]: reduceTabState(state[action.tab.name], action)
      })
    default:
      return state
  }
}

function reduceCardState(state = {loading: true}, action) {
  switch (action.type) {

    case SET_CURRENT_TAB:
      return Object.assign({}, state, {
        activeTab: action.tab
      })

    case REQUEST_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        loading: true,
        tabs: reduceTabs(state.tabs, action)
      })
    case RECEIVE_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        loading: false,
        tabs: reduceTabs(state.tabs, action)
      })
    default:
      return state
  }
}

function reduceCardStateForRegion(state = {}, action) {
  switch (action.type) {
    case SET_CURRENT_TAB:
    case REQUEST_CARD_QUERY_RESULT:
    case RECEIVE_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        [action.card.name]: reduceCardState(state[action.card.name], action)
      })
    default:
      return state
  }
}


export default function cardState(state = {}, action) {
  switch (action.type) {
    case SET_CURRENT_TAB:
    case REQUEST_CARD_QUERY_RESULT:
    case RECEIVE_CARD_QUERY_RESULT:
      return Object.assign({}, state, {
        [action.region.prefixedCode]: reduceCardStateForRegion(state[action.region.prefixedCode], action)
      })
    default:
      return state
  }
}
