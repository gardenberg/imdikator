import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

const CustomPropTypes = {
  cardPageLink: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    selected: PropTypes.bool
  })
}

class CardPageButtons extends Component {
  static propTypes = {
    cardPageLinks: PropTypes.arrayOf(CustomPropTypes.cardPageLink)
  }

  render() {
    const {cardPageLinks} = this.props
  }
}
