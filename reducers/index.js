import {combineReducers} from 'redux'
import route from './route'
import allRegions from './allRegions'
import currentRegion from './currentRegion'
import page from './page'
import headerGroups from './headerGroups'
import cardState from './cardState'
import openCards from './openCards'
import cardPageData from './cardPageData'
import cardPagesData from './cardPagesData'
import cardPages from './cardPages'
import regionSummaries from './regionSummaries'

export default combineReducers({
  page: page,
  allRegions,
  currentRegion,
  cardPages,
  regionSummaries
})
