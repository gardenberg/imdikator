import React, {Component, PropTypes} from 'react'
import RegionPicker from './RegionPicker'
import Lightbox from '../Lightbox'
import {comparisonDescription} from '../../../lib/regionUtil'
import * as ImdiPropTypes from '../../proptypes/ImdiPropTypes'

import cx from 'classnames'

export default class RegionFilterSelect extends Component {
  static propTypes = {
    value: PropTypes.arrayOf(ImdiPropTypes.region),
    groups: PropTypes.arrayOf(ImdiPropTypes.regionPickerGroup),
    choices: PropTypes.arrayOf(ImdiPropTypes.region),
    lockedToRegion: ImdiPropTypes.region,
    renderChoice: PropTypes.func,
    onChange: PropTypes.func
  }

  static defaultProps = {
    value: [],
    choices: [],
    groups: [],
    onChange() {}
  }

  constructor(props) {
    super()
    this.state = {
      isRegionPickerOpen: false
    }
  }

  renderFilterButton() {
    const {value, lockedToRegion, choices, renderChoice} = this.props
    const hasValue = value.length > 1
    const disabled = lockedToRegion || choices.length == 1

    function getButtonText() {
      if (lockedToRegion) {
        return comparisonDescription(lockedToRegion)
      }
      if (hasValue) {
        return renderChoice(value)
      }
      return 'Legg til sted'
    }

    const buttonClasses = cx({
      'subtle-select__button': true,
      'subtle-select__button--expanded': value.length > 0,
      'subtle-select__button--add': value.length > 0
    })

    return (
        <button
          type="button"
          disabled={disabled}
          className={buttonClasses}
          onClick={this.toggleRegionPickerLightBox.bind(this)}
        >
          {getButtonText()}
        </button>
    )
  }

  setRegionPickerOpen(bool) {
    this.setState({isRegionPickerOpen: bool})
  }
  openRegionPickerLightBox() {
    this.setRegionPickerOpen(true)
  }
  closeRegionPickerLightBox() {
    this.setRegionPickerOpen(false)
  }

  toggleRegionPickerLightBox() {
    this.setRegionPickerOpen(!this.state.isRegionPickerOpen)
  }

  renderRegionPickerLightbox() {
    const {value, choices, groups, renderChoice, onChange} = this.props

    const handleApplyRegionFilter = newValue => {
      onChange(newValue)
      this.closeRegionPickerLightBox()
    }

    const handleCancelRegionFilter = () => this.closeRegionPickerLightBox()

    return (
      <Lightbox title="Legg til sammenlikning" onClose={handleCancelRegionFilter}>
        <RegionPicker
          onCancel={handleCancelRegionFilter}
          onApply={handleApplyRegionFilter}
          groups={groups}
          renderChoice={renderChoice}
          choices={choices}
          value={value}
        />
      </Lightbox>
    )
  }

  render() {
    const {isRegionPickerOpen} = this.state

    return (
      <div>
        <div className="subtle-select">
          <label htmlFor="filter-groups" className="subtle-select__label">
            Sammenliknet med:
          </label>
          {this.renderFilterButton()}
        </div>
        {isRegionPickerOpen && this.renderRegionPickerLightbox()}
      </div>
    )
  }
}
