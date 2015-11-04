import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import update from 'react-addons-update'
import {CHARTS} from '../../config/chartTypes'
import {TABS} from '../../config/tabs'
import TabBar from '../elements/TabBar'
import FilterBarContainer from './FilterBarContainer'
import debug from '../../lib/debug'
import CardMetadata from '../elements/CardMetadata'
import {constrainQuery, getQuerySpec} from '../../lib/querySpec'
import {performQuery} from '../../actions/cardsPage'
import {queryToOptions, describeChart} from '../../lib/chartDescriber'
import {isSimilarRegion, getHeaderKey} from '../../lib/regionUtil'
import {queryResultPresenter} from '../../lib/queryResultPresenter'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'

class Card extends Component {
  static propTypes = {
    card: ImdiPropTypes.card.isRequired,
    region: ImdiPropTypes.region.isRequired,
    query: PropTypes.object,
    currentTabName: PropTypes.string,
    data: PropTypes.object,
    headerGroups: PropTypes.array,
    table: PropTypes.object,
    activeTab: PropTypes.object,
    boundUpdateCardQuery: PropTypes.func,
    dispatch: PropTypes.func,
    allRegions: PropTypes.array
  }

  static contextTypes = {
    linkTo: PropTypes.func,
    goTo: PropTypes.func
  }

  makeLinkToTab(tab) {
    return this.context.linkTo('/steder/:region/:cardsPageName/:cardName/:tabName', {
      cardName: this.props.card.name,
      tabName: tab.name
    })
  }

  handleFilterChange(property, newValue) {
    const {card, activeTab, query} = this.props

    let newQuery
    if (['comparisonRegions', 'unit', 'year'].includes(property)) {
      newQuery = Object.assign({}, query, {
        [property]: newValue
      })
    } else {
      newQuery = update(query, {
        dimensions: {
          $apply: dimensions => {
            return dimensions.map(dim => {
              if (dim.name !== property) {
                return dim
              }
              return Object.assign({}, dim, {
                variables: Array.isArray(newValue) ? newValue : [newValue]
              })
            })
          }
        }
      })
    }
    const constrainedQuery = constrainQuery(newQuery, this.getQuerySpec(newQuery))
    constrainedQuery.operations.forEach(op => {
      debug('%s: %s', op.dimension, op.description)
    })
    this.props.dispatch(performQuery(card, activeTab, constrainedQuery.query))
  }

  getHeaderGroupForQuery(query) {
    const {headerGroups, region} = this.props
    const regionHeaderKey = getHeaderKey(region)
    return headerGroups.find(group => {
      return group.hasOwnProperty(regionHeaderKey) && query.dimensions.every(dim => group.hasOwnProperty(dim.name))
    })
  }

  getChartKind() {
    const {activeTab} = this.props
    return activeTab.chartKind
  }

  // TODO: Maybe investigate a wrapper around query/querySpec
  // const query = Query({
  // })
  // query.getFixedDimensions()
  // query.constrain(constrainer)

  getValidComparisonRegions() {
    const {allRegions, query} = this.props
    const querySpec = this.getQuerySpec(query)
    const invalid = []
    const comparisonRegionsSpec = querySpec.find(spec => spec.name === 'comparisonRegions')
    const regions = comparisonRegionsSpec.choices.map(prefixedCode => {
      const found = allRegions.find(region => region.prefixedCode === prefixedCode)
      if (!found) {
        invalid.push(prefixedCode)
      }
      return found
    }).filter(Boolean)

    if (invalid.length > 0) {
      //const message = 'Warning: Query spec said the following region codes were valid comparison regions, '
      //                 + `but none of them was found in list of known regions: ${invalid.join(', ')}`
      //console.warn(new Error(message))
    }
    return regions
  }

  getQuerySpec(query) {
    const {activeTab, card} = this.props
    const headerGroup = this.getHeaderGroupForQuery(query)
    const chart = CHARTS[this.getChartKind()]
    return getQuerySpec(query, {
      tab: activeTab,
      headerGroup,
      chart,
      configuredDimensions: card.query.dimensions
    })
  }

  render() {
    const {loading, card, data, activeTab, query, region, allRegions} = this.props

    if (loading) {
      return <div>Henter data…</div>
    }

    const headerGroup = this.getHeaderGroupForQuery(query)

    //const validRegions = this.getValidComparisonRegions()
    //const similarRegions = validRegions.filter(isSimilarRegion(region))
    // if (activeTab.name == 'benchmark') {
    //   similarRegions = allRegions.filter(isSimilarRegion(region))
    // }
    const recommended = [] // todo

    const disabledTabs = []
    if (headerGroup.aar.length < 2) {
      disabledTabs.push('chronological')
    }

    const graphDescription = describeChart(queryToOptions(query, card.name, headerGroup, allRegions))

    const ChartComponent = CHARTS[this.getChartKind()].component
    let sortDirection = null

    debugger
    const chartData = Object.assign({}, data)
    if (activeTab.name == 'benchmark') {
      sortDirection = 'ascending'
      chartData.highlight = {
        dimensionName: 'region',
        value: [region.prefixedCode]
      }
    }

    return (
      <div
        className="toggle-list__section toggle-list__section--expanded"
        aria-hidden="false"
        style={{display: 'block'}}
      >
        <TabBar activeTab={activeTab.name} disabledTabs={disabledTabs} tabs={TABS}
                makeLinkToTab={tab => this.makeLinkToTab(tab)}/>
        {/*<FilterBarContainer
         query={query}
         regionGroups={{recommended: recommended, similar: similarRegions, choices: validRegions}}
         querySpec={this.getQuerySpec(query)}
         onChange={this.handleFilterChange.bind(this)}
         />*/}
        <div className="graph">
          {data && <ChartComponent data={chartData} sortDirection={sortDirection}/>}
        </div>
        <div className="graph__description">
          {graphDescription}
        </div>
        <div className="graph__annotations">
        </div>
        <div className="graph__functions">
          <button type="button" className="button button--secondary button--small">
            <i className="icon__export"/> Lenke til figuren
          </button>
          <button type="button" className="button button--secondary button--small">
            <i className="icon__download"/> Last ned
          </button>
        </div>
        <CardMetadata
          description={card.metadata.description}
          terminology={card.metadata.terminology}
          source={card.metadata.source}
          measuredAt={card.metadata.source}
        />
      </div>
    )
  }
}

function select(state, ownProps) {

  const cardState = (state.cardState[ownProps.region.prefixedCode] || {})[ownProps.card.name]

  if (!cardState || cardState.loading) {
    return {loading: true}
  }

  // Find query from cardState.tabs[activeTab.name]
  const {activeTab, tabs} = cardState

  const tabState = tabs[activeTab.name]

  const {query, headerGroups, queryResult} = tabState

  return {
    region: state.currentRegion,
    activeTab,
    allRegions: state.allRegions,
    data: queryResult && queryResultPresenter(query, queryResult, activeTab),
    headerGroups,
    query
  }
}

export default connect(select)(Card)
