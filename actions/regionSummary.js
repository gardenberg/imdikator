import apiClient from '../config/apiClient'
import resolveQuery from '../lib/resolveQuery'
import {queryResultPresenter} from '../lib/queryResultPresenter'
import {isSimilarRegion} from '../lib/regionUtil'
import {REQUEST_REGION_SUMMARY_DATA, RECEIVE_REGION_SUMMARY_DATA, CLEAR_REGION_SUMMARY_DATA} from './ActionTypes'

function requestSummaryData({region, summaryConfig}) {
  return {
    type: REQUEST_REGION_SUMMARY_DATA,
    region: region,
    summaryConfig: summaryConfig
  }
}

// Maybe we need this later on
function clearSummaryData({region, summaryConfig}) {
  return {
    type: CLEAR_REGION_SUMMARY_DATA,
    region: region,
    summaryConfig: summaryConfig
  }
}

function receiveSummaryData({region, summaryConfig, query, queryResults}) {
  return {
    type: RECEIVE_REGION_SUMMARY_DATA,
    region: region,
    summaryConfig: summaryConfig,
    query: query,
    queryResult: queryResult
  }
}

export function loadRegionSummaryDataForRegion(region, summaryConfig) {
  return (dispatch, getState) => {

    const state = getState()

    if ((state.regionSummaries[region.prefixedCode] || {})[summaryConfig.name]) {
      // we got it already
      return
    }

    const {allRegions} = state

    dispatch(requestSummaryData({region, summaryConfig}))

    apiClient.getHeaderGroups(summaryConfig.query.tableName).then(headerGroups => {

      const query = resolveQuery(region, extendQuery(summaryConfig), headerGroups)

      apiClient.query(query).then(queryResults => {

        dispatch(receiveSummaryData({
          region,
          summaryConfig,
          query,
          queryResults
        }))
      })

    })

    function extendQuery(summary) {
      // extend the configured query with region and comparison regions
      const comparisonRegions = summary.compareWithSimilarRegions ? allRegions.filter(isSimilarRegion(region)) : []
      return Object.assign({}, summary.query, {
        region: region.prefixedCode,
        comparisonRegions: comparisonRegions.map(reg => reg.prefixedCode)
      })
    }
  }
}
