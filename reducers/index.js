import {combineReducers} from 'redux'
import route from './route'
import currentRegion from './currentRegion'
import page from './page'
import headerGroups from './headerGroups'
import cardState from './cardState'
import openCards from './openCards'
import currentCardsPage from './currentCardsPage'
import currentCard from './currentCard'
import currentTab from './currentTab'
import regionSummaries from './regionSummaries'

export default combineReducers({
  page: page,
  allRegions: (state = []) => state,
  allCardsPages: (state = []) => state,
  currentRegion,
  headerGroups,
  currentCardsPage,
  currentCard,
  currentTab,
  openCards,
  cardState,
  regionSummaries
})
