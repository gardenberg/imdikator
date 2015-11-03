import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import update from 'react-addons-update'
import {loadRegionSummaryDataForRegion} from '../../actions/regionSummary'
import BenchmarkChart from '../charts/bar-chart/BenchmarkChart'
import BarChart from '../charts/bar-chart/BarChart'
import {norway, comparisonDescription} from '../../lib/regionUtil'
import regionSummaryConfig from '../../data/regionSummaryConfig'
import RegionSummaryChart from '../elements/RegionSummaryChart'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'

function queryKey(region, tableName) {
  return `${region.prefixedCode}-${tableName}`
}

function dispatchLoadChartsData(props) {
  const {region, dispatch} = props

  regionSummaryConfig.forEach(summaryConfig => {
    dispatch(loadRegionSummaryDataForRegion(region, summaryConfig))
  })

  // Also load for norway, we're gonna need it
  regionSummaryConfig.forEach(summaryConfig => {
    dispatch(loadRegionSummaryDataForRegion(norway, summaryConfig))
  })
}


class RegionSummaryChartsContainer extends Component {

  static propTypes = {
    loading: PropTypes.bool,
    region: ImdiPropTypes.region.isRequired,
    summaries: PropTypes.arrayOf(PropTypes.shape({
      readyState: PropTypes.oneOf(['loading', 'loaded', 'failed']),
      error: PropTypes.instanceOf(Error),
      config: PropTypes.object,
      data: PropTypes.shape({
        rows: PropTypes.array,
        dimensions: PropTypes.array
      })
    })),
    dispatch: PropTypes.func
  }

  static contextTypes = {
    linkTo: PropTypes.func,
    goTo: PropTypes.func
  }

  componentWillMount() {
    dispatchLoadChartsData(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.region != this.props.region) {
      // only dispatch new queries if the region has changed
      dispatchLoadChartsData(nextProps)
    }
  }

  render() {
    const {summaries, region, loading} = this.props

    if (loading || !summaries || summaries.some(summary => summary.loading)) {
      return <div>Henter data...</div>
    }

    return (
      <div>
        {summaries.map(summary => {
          return (
            <RegionSummaryChart
              key={summary.name}
              region={region}
              config={summary.config}
              query={summary.query}
              queryResult={summary.queryResult}
              compareWith={summary.compareWith}
            />
            )
        })}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {region} = ownProps

  const summaryForNorway = state.regionSummaries[norway.prefixedCode]

  const isNorwayLoading = !summaryForNorway || Object.keys(summaryForNorway).some(summaryName => {
    return summaryForNorway[summaryName].loading
  })

  if (isNorwayLoading) {
    return {}
  }

  const summaryFromState = state.regionSummaries[region.prefixedCode]
  if (!summaryForNorway || summaryForNorway.loading || !summaryFromState) {
    return {loading: true}
  }

  const summaries = regionSummaryConfig.map(config => {
    const fromState = summaryFromState[config.name]
    const forNorway = state.regionSummaries[norway.prefixedCode][config.name]
    return {
      config: config,
      loading: fromState.loading,
      query: fromState.query,
      queryResult: fromState.queryResult,
      compareWith: {
        queryResult: forNorway.queryResult
      }
    }
  })
  return {
    summaries: summaries
  }
}

export default connect(mapStateToProps)(RegionSummaryChartsContainer)
