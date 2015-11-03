import apiClient from '../config/apiClient'
import resolveQuery from '../lib/resolveQuery'
import {queryResultPresenter} from '../lib/queryResultPresenter'
import {prefixifyRegion, isSimilarRegion} from '../lib/regionUtil'
import {TABS} from '../config/tabs'
import {RECEIVE_REGION, RECEIVE_QUERY_RESULT, RECEIVE_TABLE_HEADERS} from './ActionTypes'


export function performQuery(card, tab, userQuery) {
  return (dispatch, getState) => {
    const {headerGroups, region} = getState()

    const newQuery = Object.assign({}, userQuery, {
      region: prefixifyRegion(region)
    })

    const resolvedQuery = resolveQuery(region, newQuery, headerGroups[newQuery.tableName])

    apiClient.query(resolvedQuery).then(queryResults => {
      dispatch({
        type: RECEIVE_QUERY_RESULT,
        card,
        tab,
        userQuery,
        query: resolvedQuery,
        data: queryResultPresenter(resolvedQuery, queryResults, tab)
      })
    })
  }
}

export function loadCardPageData({regionCode, pageName, activeCardName, activeTabName, query}) {
  return (dispatch, getState) => {

    const {allRegions, cardPages} = getState()

    const getRegion = apiClient.getRegionByCode(regionCode)
    getRegion.then(region => {
      dispatch({
        type: RECEIVE_REGION,
        region
      })
    })

    const getActiveCard = getCardPageData.then(cardPageData => {
      return cardPageData.cards.find(card => card.name === activeCardName)
    })

    const getActiveTab = getActiveCard.then(card => {
      const tab = TABS.find(t => t.name === activeTabName)
      const tabOverrides = (card.tabs || []).find(t => t.name === activeTabName)
      return Object.assign({}, tab, tabOverrides)
    })

    const getTabQuery = Promise.all([getActiveCard, getActiveTab]).then(([activeCard, activeTab]) => {
      return Object.assign({}, activeCard.query, {year: activeTab.year}, query, {
        region: regionCode
      })
    })

    const getHeaderGroups = getTabQuery.then(tabQuery => {
      return apiClient.getHeaderGroups(tabQuery.tableName)
    })

    const queryResolved = Promise
      .all([getRegion, getTabQuery, getHeaderGroups])
      .then(([region, tabQuery, headerGroups]) => {
        const aQuery = resolveQuery(region, tabQuery, headerGroups)
        if (activeTabName !== 'benchmark') {
          return aQuery
        }
        const comparisonRegions = allRegions.filter(isSimilarRegion(region)).map(reg => reg.prefixedCode)
        const queryWithComparisons = Object.assign({}, aQuery, {comparisonRegions: comparisonRegions})
        return queryWithComparisons
      })

    const getQueryResults = queryResolved.then(resolvedQuery => {
      return apiClient.query(resolvedQuery)
    })

    Promise.all([getTabQuery, getHeaderGroups]).then(([tabQuery, headers]) => {
      dispatch({
        type: RECEIVE_TABLE_HEADERS,
        headers,
        tableName: tabQuery.tableName
      })
    })

    Promise
      .all([queryResolved, getActiveCard, getActiveTab, getRegion, getQueryResults])
      .then(([resolvedQuery, activeCard, activeTab, region, queryResults]) => {
        dispatch({
          type: RECEIVE_QUERY_RESULT,
          card: activeCard,
          tab: activeTab,
          query: resolvedQuery,
          data: queryResultPresenter(resolvedQuery, queryResults, activeTab)
        })
      })
  }
}
