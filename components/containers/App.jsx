import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'

class App extends Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    router: ImdiPropTypes.router.isRequired,
    breadCrumbs: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.string
      })
    )
  }

  static childContextTypes = {
    linkTo: PropTypes.func,
    goTo: PropTypes.func
  }

  static defaultProps = {
    breadCrumbs: []
  }

  getChildContext() {
    const {router} = this.props
    return {
      linkTo: router.makeLink,
      goTo: (...args) => {
        router.navigate(router.makeLink(...args))
      }
    }
  }

  renderBreadCrumbs() {
    const {breadCrumbs} = this.props
    if (!breadCrumbs) {
      return null
    }
    return (
      <nav className="breadcrumbs">
        <ul className="t-no-list-styles breadcrumbs__list">
          <li key="/" className="breadcrumbs__list-item">
            <a href="/" className="breadcrumbs__link">Tall og statistikk</a>
            <span className="breadcrumbs__divider">/</span>
          </li>
          {breadCrumbs.map(crumb => (
            <li key={crumb.url} className="breadcrumbs__list-item">
              <a href={crumb.url} className="breadcrumbs__link">
                {crumb.title}
              </a>
              <span className="breadcrumbs__divider">/</span>
            </li>
          ))}
        </ul>
      </nav>
    )
  }


  render() {
    return (
      <div>
        <div className="page__content page__content--section">
          <div className="wrapper">
            <div className="row">
              <div className="col--main-wide">
                {this.renderBreadCrumbs()}
              </div>
            </div>
          </div>
        </div>
        {this.props.component && <this.props.component/>}
      </div>
    )
  }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
function select(state) {
  return {
    component: state.page,
    breadCrumbs: state.breadCrumbs
  }
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App)
