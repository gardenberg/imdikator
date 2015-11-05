import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {CHARTS} from '../../config/chartTypes'
import {TABS} from '../../config/tabs'
import TabBar from '../elements/TabBar'
import FilterBarContainer from './FilterBarContainer'
import CardMetadata from '../elements/CardMetadata'
import ChartDescriptionContainer from './ChartDescriptionContainer'
import DownloadWidget from './DownloadWidget'
import {getHeaderKey} from '../../lib/regionUtil'
import {queryResultPresenter} from '../../lib/queryResultPresenter'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'
import config from '../../config'

class Card extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    card: ImdiPropTypes.card.isRequired,
    region: ImdiPropTypes.region.isRequired,
    query: PropTypes.object,
    currentTabName: PropTypes.string,
    data: PropTypes.object,
    headerGroups: PropTypes.array,
    table: PropTypes.object,
    cardsPageName: PropTypes.string.isRequired,
    activeTab: PropTypes.object,
  }

  static contextTypes = {
    linkTo: PropTypes.func,
    goTo: PropTypes.func
  }

  constructor(props) {
    super()
    this.state = {
      showTable: false
    }
  }

  makeLinkToTab(tab) {
    return this.context.linkTo('/steder/:region/:cardsPageName/:cardName/:tabName', {
      cardName: this.props.card.name,
      cardsPageName: this.props.cardsPageName,
      tabName: tab.name
    })
  }

  getHeaderGroupForQuery(query) {
    const {headerGroups, region} = this.props
    const regionHeaderKey = getHeaderKey(region)
    return headerGroups.find(group => {
      return group.hasOwnProperty(regionHeaderKey) && query.dimensions.every(dim => group.hasOwnProperty(dim.name))
    })
  }

  handleTableToggle(event) {
    event.preventDefault()
    this.setState({showTable: !this.state.showTable})
  }

  getChartKind() {
    const {activeTab} = this.props
    return activeTab.chartKind
  }

  chartUrl() {
    const route = '/steder/:region/:cardsPageName/:cardName/:tabName'
    const routeOpts = {
      cardName: this.props.card.name,
      tabName: this.props.activeTab.name,
      cardsPageName: this.props.cardsPageName
    }
    const host = window.location.hostname
    const port = `:${window.location.port}`
    const path = this.context.linkTo(route, routeOpts)
    return `${host}${config.env == 'development' ? port : ''}${path}`
  }

  render() {
    const {loading, card, data, activeTab, query, region, headerGroups} = this.props

    if (!activeTab) {
      return <div>Laster…</div>
    }

    const headerGroup = this.getHeaderGroupForQuery(query)
    const disabledTabs = []
    if (headerGroup.aar.length < 2) {
      disabledTabs.push('chronological')
    }

    const chart = CHARTS[this.getChartKind()]
    const ChartComponent = chart.component

    if (!chart.component) {
      throw new Error(`Uh oh, missing chart component for ${chart.name}`)
    }

    const sortDirection = activeTab.name === 'benchmark' ? 'ascending' : null

    const chartData = Object.assign({}, data)
    if (activeTab.name == 'benchmark') {
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
        <TabBar
          activeTab={activeTab}
          disabledTabs={disabledTabs}
          region={region}
          tabs={TABS}
          makeLinkToTab={tab => this.makeLinkToTab(tab)}
        />
        <FilterBarContainer
          query={query}
          region={region}
          card={card}
          headerGroups={headerGroups}
          tab={activeTab}
          chart={chart}
          dimensionsConfig={card.dimensionsConfig}
        />
        {loading && <span>Laster…</span>}
        <div className="graph">
          {data && <ChartComponent data={data} sortDirection={sortDirection}/>}
        </div>
        <ChartDescriptionContainer
          query={query}
          region={region}
          card={card}
          headerGroups={headerGroups}
        />
        <div className="graph__functions">
          <button
            type="button" className="button button--secondary button--small clipboardButton"
            data-clipboard-text={this.chartUrl()}>
            <i className="icon__export"></i> Lenke til figuren
          </button>
          <DownloadWidget region={region} data={chartData}/>
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
  window.state = state
  const cardState = (state.cardState[ownProps.region.prefixedCode] || {})[ownProps.card.name]

  if (cardState.initializing) {
    return {loading: true}
  }

  // Find query from cardState.tabs[activeTab.name]
  const {activeTab, tabs} = cardState

  const tabState = tabs[activeTab.name]

  if (tabState.initializing) {
    return {loading: true}
  }

  const {loading, query, queryResult, headerGroups} = tabState

  return {
    loading,
    region: state.currentRegion,
    activeTab,
    headerGroups,
    allRegions: state.allRegions,
    queryResult: queryResult,
    data: !loading && queryResultPresenter(query, queryResult, {chartKind: activeTab.chartKind}),
    query
  }
}

export default connect(select)(Card)
