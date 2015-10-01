import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {CHARTS} from '../../config/chartTypes'
import TabBar from '../elements/TabBar'
import FilterBar from './FilterBar'

//import {performQuery} from '../../actions/cardPages'
import {getHeaderKey} from '../../lib/regionUtil'

class Card extends Component {
  static propTypes = {
    card: PropTypes.object,
    query: PropTypes.object,
    data: PropTypes.object,
    headerGroup: PropTypes.object,
    table: PropTypes.object,
    activeTab: PropTypes.object,
    boundUpdateCardQuery: PropTypes.func,
    dispatch: PropTypes.func
  }

  static contextTypes = {
    linkTo: PropTypes.func,
    goTo: PropTypes.func
  }

  makeLinkToTab(tab) {
    return this.context.linkTo('/steder/:region/:pageName/:cardName/:tabName', {cardName: this.props.card.name, tabName: tab.name})
  }

  handleFilterChange(newFilter) {
    // todo
  }

  render() {
    const {card, activeTab, headerGroup, query} = this.props // eslint-disable-line no-unused-vars

    if (!card) {
      return null
    }

    if (!card.tabs) {
      return null
    }

    if (!activeTab) {
      return null
    }

    let tableDescription = ''
    if (this.props.table) {
      tableDescription = this.props.table.description
    }
    const ChartComponent = CHARTS[activeTab.chartKind]
    return (

      <div className="toggle-list__section toggle-list__section--expanded" aria-hidden="false" style={{display: 'block'}}>
        <TabBar activeTab={activeTab} card={card} makeLinkToTab={tab => this.makeLinkToTab(tab)}/>
        <FilterBar headerGroup={headerGroup} onChange={this.handleFilterChange.bind(this)}/>
        <ChartComponent data={this.props.data}/>
        <small>{tableDescription}</small>
      </div>
    )
  }
}

function select(state, ownProps) {
  const cardState = state.cardState[ownProps.card.name]

  if (!cardState) {
    return {}
  }

  const {query, activeTab, data} = cardState

  const headerGroups = state.headerGroups[query.tableName]
  const table = state.tables[query.tableName]

  const headerKey = getHeaderKey(state.region)

  const headerGroup = headerGroups && headerGroups.find(group => headerKey in group)
  return {
    headerGroup,
    data,
    headerGroups,
    table,
    activeTab,
    query
  }
}

export default connect(select)(Card)
