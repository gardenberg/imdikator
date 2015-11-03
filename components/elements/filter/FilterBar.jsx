import React, {Component, PropTypes} from 'react'

export default class FilterBar extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      props: PropTypes.any,
      component: PropTypes.component
    }))
  }

  static defaultProps = {
    filters: []
  }

  render() {
    const {filters} = this.props
    return (
      <section className="graph__filter">
        <h5 className="t-only-screenreaders">Filter</h5>
        <ul className="row t-position">
          {filters.map(filter => (
            <li key={filter.name} className="col--fifth">
              <filter.component {...filter.props}/>
            </li>
          ))}
        </ul>
      </section>
    )
  }
}
