import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {loadCardPages} from '../../actions/cardPages'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'

class CardPageButtons extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
    currentCardPage: ImdiPropTypes.cardPage,
    cardPages: PropTypes.arrayOf(ImdiPropTypes.cardPage),
    currentRegion: ImdiPropTypes.region
  }

  static contextTypes = {
    linkTo: PropTypes.func
  }

  render() {
    const {cardPages, currentCardPage, currentRegion} = this.props
    const {linkTo} = this.context
    if (!cardPages || !currentRegion) {
      return <div>Henter data...</div>
    }

    const summaryPage = {
      name: 'summary',
      title: 'Oppsummert',
      selected: !currentCardPage,
      url: linkTo('/steder/:region')
    }

    const otherPages = cardPages.map(cardPage => {
      const firstCard = cardPage.cards[0]
      return {
        name: cardPage.name,
        title: cardPage.title,
        selected: cardPage == currentCardPage,
        url: linkTo('/steder/:region/:pageName/:cardName', {
          pageName: cardPage.name,
          cardName: firstCard.name
        })
      }
    })
    const pages = [summaryPage, ...otherPages]
    return (
      <nav className="tabs-button-menu">
        <h2 className="tabs-button-menu__title t-only-screenreaders">Tema:</h2>
        <ul className="t-no-list-styles tabs-button-menu__list">
          {pages.map(page => {
            if (page.selected) {
              return wrap(
                <span className="tabs-button-menu__link tabs-button-menu__link--current">{page.title}</span>
              )
            }

            return wrap(
              <a className="tabs-button-menu__link" href={page.url}>{page.title}</a>
            )

            function wrap(node) {
              return <li key={page.name} className="tabs-button-menu__list-item">{node}</li>
            }
          })}
        </ul>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    pageConfig: state.cardPageData,
    cardPages: state.cardPages,
    currentRegion: state.currentRegion
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps)(CardPageButtons)
