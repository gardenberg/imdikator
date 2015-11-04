import apiClient from '../config/apiClient'
import resolveQuery from '../lib/resolveQuery'
import {isSimilarRegion} from '../lib/regionUtil'
import {setCurrentRegionByCode} from './region'
import {queryResultPresenter} from '../lib/queryResultPresenter'
import {prefixifyRegion, isSimilarCardsPage} from '../lib/regionUtil'

import {TABS} from '../config/tabs'
import {
  CARD_PAGE_NOT_FOUND,
  CARD_PAGE_TAB_NOT_FOUND,
  CLOSE_CARD,
  CARD_NOT_FOUND_IN_PAGE,
  TAB_NOT_FOUND_IN_CARD,
  SET_CURRENT_CARDS_PAGE,
  SET_CURRENT_CARD,
  SET_CURRENT_TAB,
  RECEIVE_CARD_QUERY_RESULT,
  REQUEST_CARD_QUERY_RESULT,
  RECEIVE_HEADER_GROUPS
} from './ActionTypes'


/** Action creators */
function cardsPageNotFound(cardsPageName) {
  return {
    type: CARD_PAGE_NOT_FOUND,
    name: cardsPageName
  }
}

function setCurrentCardsPage(cardsPage) {
  return {
    type: SET_CURRENT_CARDS_PAGE,
    cardsPage: cardsPage
  }
}

function setCurrentCard(card) {
  return {
    type: SET_CURRENT_CARD,
    card: card
  }
}

function _closeCard(card) {
  return {
    type: CLOSE_CARD,
    card: card
  }
}

function setCurrentTab({region, card, tab}) {
  return {
    type: SET_CURRENT_TAB,
    region,
    card,
    tab
  }
}

function receivedHeaderGroups({tableName, headerGroups}) {
  return {
    type: RECEIVE_HEADER_GROUPS,
    tableName: tableName,
    headerGroups
  }
}

function requestQueryResult({cardsPage, query, card, tab, region, headerGroups, queryResults}) {
  return {
    type: REQUEST_CARD_QUERY_RESULT,
    cardsPage,
    card,
    tab,
    query,
    region,
    headerGroups,
    queryResults
  }
}

function receiveQueryResult({cardsPage, card, tab, region, headerGroups, query, queryResults}) {
  return {
    type: RECEIVE_CARD_QUERY_RESULT,
    cardsPage,
    card,
    tab,
    region,
    headerGroups,
    query,
    queryResults
  }
}

function cardNotFoundInPage({cardsPage, cardName}) {
  return {
    type: CARD_NOT_FOUND_IN_PAGE,
    cardsPage,
    cardName
  }
}

function tabNotFoundInCard({card, tabName}) {
  return {
    type: TAB_NOT_FOUND_IN_CARD,
    card,
    tabName
  }
}

/** Actions */

function loadHeaderGroupsForTable(tableName) {
  return (dispatch, getState) => {
    const state = getState()
    if (state.headerGroups[tableName]) {
      return Promise.resolve(state.headerGroups[tableName])
    }
    return apiClient.getHeaderGroups(tableName).then(headerGroups => {
      dispatch(receivedHeaderGroups({tableName, headerGroups}))
      return headerGroups
    })
  }
}


export function closeCard(card) {
  return dispatch => {
    dispatch(_closeCard(card))
  }
}

export function loadCardsPage(regionCode, cardsPageName, {cardName, tabName, query} = {}) {
  return (dispatch, getState) => {

    const region = dispatch(setCurrentRegionByCode(regionCode))

    if (!region) {
      // Probably means region wasnt found
      return
    }

    const state = getState()
    const foundCardsPage = state.allCardsPages.find(cardsPage => cardsPage.name.toLowerCase() === cardsPageName.toLowerCase())

    if (!foundCardsPage) {
      dispatch(cardsPageNotFound(foundCardsPage))
      return
    }

    if (state.currentCardsPage !== foundCardsPage) {
      dispatch(setCurrentCardsPage(foundCardsPage))
    }

    if (!cardName) {
      cardName = foundCardsPage.cards[0].name
    }

    dispatch(loadCard({cardName, tabName, query}))
  }
}

export function loadCard({cardName, tabName, query}) {
  return (dispatch, getState) => {

    const {currentCardsPage, currentCard, headerGroups} = getState()

    const foundCard = currentCardsPage.cards.find(card => card.name.toLowerCase() === cardName.toLowerCase())

    if (!foundCard) {
      dispatch(cardNotFoundInPage({cardsPage: currentCardsPage, cardName}))
      return
    }

    if (!headerGroups[foundCard.query.table]) {
      dispatch(loadHeaderGroupsForTable(foundCard.query.tableName))
    }

    if (currentCard !== foundCard) {
      dispatch(setCurrentCard(foundCard))
    }

    if (!tabName) {
      tabName = TABS[0].name
    }

    dispatch(loadTab({tabName, query}))
  }
}

export function loadTab({tabName, query}) {
  return (dispatch, getState) => {

    const {currentCardsPage, currentCard, currentTab, currentRegion, allRegions} = getState()

    // Tabs are fixed across all, not configured
    const foundTab = TABS.find(tab => {
      return tab.name.toLowerCase() == tabName.toLowerCase()
    })

    if (!foundTab) {
      dispatch(tabNotFoundInCard({card: currentCard, tabName}))
      return
    }


    if (currentTab !== foundTab) {
      dispatch(setCurrentTab({
        region: currentRegion,
        card: currentCard,
        tab: foundTab
      }))
    }

    if (query) {
      dispatch(performQuery({query}))
      return
    }

    // Load up initial query for tab and query

    const tabOverrides = (currentCard.tabs || []).find(tab => tab.name === foundTab.name)
    const tabQuery = Object.assign({}, currentCard.query, {year: foundTab.year})
    const getHeaderGroups = apiClient.getHeaderGroups(tabQuery.tableName)

    const maybeAddComparisonRegions = Promise.resolve(tabQuery).then(tabQuery => {
      if (foundTab.name == 'benchmark') {
        const prefixes = allRegions.filter(isSimilarRegion(currentRegion)).map(reg => reg.prefixedCode)
        return Object.assign({}, tabQuery, {
          comparisonRegions: prefixes
        })
      }
      return tabQuery
    })

    Promise
      .all([maybeAddComparisonRegions, getHeaderGroups]).then(([query, headerGroups]) => {
        return resolveQuery(currentRegion, query, headerGroups)
      })
      .then(initialQuery => {
        dispatch(performQuery({query: initialQuery}))
      })
  }
}

export function performQuery({query}) {
  return (dispatch, getState) => {
    const {headerGroups, currentCardsPage, currentCard, currentTab, currentRegion} = getState()

    const headerGroupsForTable = headerGroups[query.tableName]

    const newQuery = Object.assign({}, query, {
      region: prefixifyRegion(currentRegion)
    })

    dispatch(requestQueryResult({
      region: currentRegion,
      cardsPage: currentCardsPage,
      card: currentCard,
      tab: currentTab,
      headerGroups: headerGroupsForTable,
      headerGroups,
      query: newQuery,
    }))

    apiClient.query(newQuery).then(queryResults => {
      dispatch(receiveQueryResult({
        region: currentRegion,
        cardsPage: currentCardsPage,
        card: currentCard,
        tab: currentTab,
        headerGroups: headerGroupsForTable,
        query: newQuery,
        queryResults
      }))
    })
  }
}

//export function loadCardsPageData({cardsPageCode, pageName, activeCardName, activeTabName, query}) {
//  return (dispatch, getState) => {
//
//    const {allCardsPages, cardsPages} = getState()
//
//    const getCardsPage = apiClient.getCardsPageByCode(cardsPageCode)
//
//    const getActiveCard = getCardsPageData.then(cardsPageData => {
//      return cardsPageData.cards.find(card => card.name === activeCardName)
//    })
//
//    const getActiveTab = getActiveCard.then(card => {
//      const tab = TABS.find(t => t.name === activeTabName)
//      const tabOverrides = (card.tabs || []).find(t => t.name === activeTabName)
//      return Object.assign({}, tab, tabOverrides)
//    })
//
//    const getTabQuery = Promise.all([getActiveCard, getActiveTab]).then(([activeCard, activeTab]) => {
//      return Object.assign({}, activeCard.query, {year: activeTab.year}, query, {
//        cardsPage: cardsPageCode
//      })
//    })
//
//    const getHeaderGroups = getTabQuery.then(tabQuery => {
//      return apiClient.getHeaderGroups(tabQuery.tableName)
//    })
//
//    const queryResolved = Promise
//      .all([getCardsPage, getTabQuery, getHeaderGroups])
//      .then(([cardsPage, tabQuery, headerGroups]) => {
//        const aQuery = resolveQuery(cardsPage, tabQuery, headerGroups)
//        if (activeTabName !== 'benchmark') {
//          return aQuery
//        }
//        const comparisonCardsPages = allCardsPages.filter(isSimilarCardsPage(cardsPage)).map(reg => reg.prefixedCode)
//        const queryWithComparisons = Object.assign({}, aQuery, {comparisonCardsPages: comparisonCardsPages})
//        return queryWithComparisons
//      })
//
//    const getQueryResults = queryResolved.then(resolvedQuery => {
//      return apiClient.query(resolvedQuery)
//    })
//
//    Promise.all([getTabQuery, getHeaderGroups]).then(([tabQuery, headers]) => {
//      dispatch({
//        type: RECEIVE_TABLE_HEADERS,
//        headers,
//        tableName: tabQuery.tableName
//      })
//    })
//
//    Promise
//      .all([queryResolved, getActiveCard, getActiveTab, getCardsPage, getQueryResults])
//      .then(([resolvedQuery, activeCard, activeTab, cardsPage, queryResults]) => {
//        dispatch({
//          type: RECEIVE_QUERY_RESULT,
//          card: activeCard,
//          tab: activeTab,
//          query: resolvedQuery,
//          data: queryResultPresenter(resolvedQuery, queryResults, activeTab)
//        })
//      })
//  }
//}
