import React, {PropTypes, Component} from 'react'
import RegionSearch from '../elements/RegionSearch'
import {connect} from 'react-redux'
import {region as RegionPropType} from '../proptypes/ImdiPropTypes'
import * as ImdiPropTypes from '../proptypes/ImdiPropTypes'

class RegionSearchContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func,
    allRegions: PropTypes.arrayOf(RegionPropType),
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    loading: PropTypes.bool
  }

  static defaultProps = {
    onSelect() {}
  }

  render() {
    const {allRegions, placeholder, onSelect, loading} = this.props
    if (loading) {
      return null
    }
    return (
      <RegionSearch
        regions={allRegions}
        placeholder={placeholder}
        onSelect={onSelect}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    loading: state.allRegions.length === 0,
    allRegions: state.allRegions
  }
}

export default connect(mapStateToProps)(RegionSearchContainer)
