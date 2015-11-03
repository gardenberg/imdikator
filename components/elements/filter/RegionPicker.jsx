import React, {Component, PropTypes} from 'react'
import ToggleButtonList from '../ToggleButtonList'
import RegionSearch from '../RegionSearch'
import difference from 'lodash.difference'
import union from 'lodash.union'
import arrayEqual from 'array-equal'

import * as ImdiPropTypes from '../../proptypes/ImdiPropTypes'

export default class RegionPicker extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(ImdiPropTypes.regionPickerGroup),
    value: PropTypes.arrayOf(ImdiPropTypes.region),
    choices: PropTypes.arrayOf(ImdiPropTypes.region),
    renderChoice: PropTypes.func,
    onApply: PropTypes.func,
    onApplyAll: PropTypes.func,
    onCancel: PropTypes.func
  }
  static defaultProps = {
    value: [],
    groups: [],
    choices: [],
    renderChoice(choice, i, choices) {
      // choice should be an array of one or more regions here (usually only one)
      return choice.map(region => region.name).join(', ')
    },
    onApply() {},
    onCancel() {}
  }

  constructor(props) {
    super()
    this.state = {
      value: props.value || []
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({value: nextProps.value})
    }
  }

  rollback() {
    this.setState({value: this.props.value})
  }

  clear() {
    this.setState({value: []})
  }

  apply() {
    this.props.onApply(this.state.value)
  }

  applyAll() {
    this.props.onApplyAll(this.state.value)
  }

  handleAdd(region) {
    const {value} = this.state
    if (value.includes(region)) {
      return
    }
    this.setState({value: value.concat(region)})
  }

  handleRemove(region) {
    this.setState({value: this.state.value.filter(val => val != region)})
  }

  renderGroup(group) {
    const {value} = this.state

    const buttons = (
      <ToggleButtonList
        options={group.items}
        value={value}
        renderButton={this.renderRegion.bind(this)}
        onAdd={this.handleAdd.bind(this)}
        onRemove={this.handleRemove.bind(this)}
      />
    )
    const description = group.description && (<p className="text--small">{group.description}</p>)

    return (
      <fieldset>
        <legend>{group.title}</legend>
        <div className="row">
          {split(buttons, description)}
        </div>
      </fieldset>
    )

    function split(left, right) {
      if (!left || !right) {
        return left || right
      }
      return [
        (<div className="col--half">{left}</div>),
        (<div className="col--half">{right}</div>)
      ]
    }
  }

  render() {

    const {groups, choices, onApplyAll, renderChoice} = this.props

    const {value} = this.state

    const grouped = union(...groups.map(group => group.items))

    const other = difference(value, grouped)

    const hasChanges = !arrayEqual(this.state.value, this.props.value)

    const renderButton = val => {
      return renderChoice([val])
    }

    return (
      <div>

        {groups.map(group => this.renderGroup(group))}

        <div className="fieldset">
          <label htmlFor="compare-search" className="legend">Legg til andre steder</label>
          <div className="search search--autocomplete">
            <RegionSearch
              placeholder="Kommune/fylke/næringsregion/bydel etc."
              regions={choices}
              onSelect={region => this.handleAdd(region)}
            />
          </div>
          <ToggleButtonList
            options={other}
            value={value}
            renderButton={renderButton}
            onAdd={this.handleAdd.bind(this)}
            onRemove={this.handleRemove.bind(this)}
          />
        </div>
        <div className="lightbox__footer">
          <button type="button" className="button" onClick={this.apply.bind(this)}>Oppdater figur</button>

          {onApplyAll && (
            <button
              type="button"
              className="button button--small button--secondary button__sidekick"
              onClick={this.applyAll.bind(this)}
            >
              <i className="icon__apply"/> Oppdater alle figurer
            </button>
          )}

          <button
            type="button"
            className="button button--small button--secondary button__sidekick"
            disabled={!hasChanges}
            onClick={this.rollback.bind(this)}
          >
            <i/> Tilbakestill
          </button>

          <button
            type="button"
            className="button button--small button--secondary button__sidekick"
            onClick={this.clear.bind(this)}
          >
            <i className="icon__close"/> Fjern sammenlikninger
          </button>
        </div>
      </div>
    )
  }
}
