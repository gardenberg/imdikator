import React, {Component, PropTypes} from 'react'
import cx from 'classnames'

// Compares contents of two arrays and returns true if values + indexes match
function valuesEqual(value) {
  if (!Array.isArray(value)) {
    return other => value === other
  }
  return other => {
    if (value.length !== other.length) {
      return false
    }
    return value.every((item, i) => item === other[i])
  }
}

export default class FilterSelect extends Component {
  static propTypes = {
    label: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.array),
    value: PropTypes.any,
    locked: PropTypes.bool,
    limited: PropTypes.bool,
    renderChoice: PropTypes.func.isRequired,
    onChange: PropTypes.func
  }
  static defaultProps = {
    choices: [],
    onChange() {},
    renderChoice(choice, i, choices) {}
  }

  constructor(props) {
    super()
    this.state = {
      animateLimited: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({animateLimited: !this.props.limited && nextProps.limited})
  }

  handleChange(event) {
    const {choices} = this.props
    const value = choices[event.target.value]
    this.props.onChange(value)
  }

  render() {
    const {value, limited, locked, label, renderChoice, choices} = this.props

    const disabled = limited || locked || choices.length == 1

    const selectContainerClasses = cx({
      select: true,
      'subtle-select__select': true,
      'subtle-select__select--disabled': locked
    })

    const selectedIndex = choices.findIndex(valuesEqual(value))

    const wrapInLimited = children => {
      const classes = cx({
        'field-notification': true,
        'field-notification--animate': limited && this.state.animateLimited
      })
      return (
        <div className={classes}>
          <p className="field-notification__caption">
            <i className="icon__arrow-right"/>
            Avgrenset
          </p>
          {children}
        </div>
      )
    }

    const filter = (
      <div className="subtle-select">
        <label htmlFor="filter-groups" className="subtle-select__label">
          {label}:
        </label>
        <div className={selectContainerClasses}>
          <select
            value={selectedIndex}
            disabled={disabled}
            onChange={this.handleChange.bind(this)}>
            {choices.map((choice, i) => (
              <option key={i} value={i}>
                {renderChoice(choice, i, choices)}
              </option>
            ))}
          </select>
        </div>
      </div>
    )

    return limited ? wrapInLimited(filter) : filter
  }
}
