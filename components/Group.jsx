const React = require("react");
const ItemDataFetcher = require("./ItemDataFetcher");

module.exports = React.createClass({
  displayName: 'Group',
  render() {

    const items = this.props.items.map( (item)=> {
    	return <ItemDataFetcher item={item} />
    })

    return (
      <div className="imdikator-list__group">
        <h3>{this.props.title}</h3>
      	{items}
        <pre>
         {JSON.stringify(this.props)}
        </pre>
      </div>
    )
  }
});
