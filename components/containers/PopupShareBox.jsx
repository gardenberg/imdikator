import React, {Component, PropTypes} from 'react'

export default class PopupShareBox extends Component {

  static propTypes = {
    onCancel: PropTypes.func,
    title: PropTypes.string,
    description: PropTypes.string,
    inputLabel: PropTypes.string,
    chartUrl: PropTypes.string,
    applyButtonText: PropTypes.string
  }

  constructor(props) {
    super()
    this.state = {choiceNumber: 0}
  }


  onCancel() {
    this.props.onCancel()
  }

  render() {
    return (
      <div className="lightbox lightbox--as-popup lightbox--inline lightbox--animate">
        <div className="lightbox__backdrop"></div>
        <dialog open="open" className="lightbox__box">
          <i className="lightbox__point" style={{left: '2.90em'}}></i>
          <div role="document">
            <button type="button" className="lightbox__close-button" onClick={this.onCancel.bind(this)}>
              <i className="icon__close icon--red lightbox__close-button-icon"/>
              <span className="t-only-screenreaders">Lukk</span>
            </button>
            <h6 className="lightbox__title">{this.props.title}</h6>

            <p>{this.props.description}</p>

            <label style={{display: 'inline-block'}}>
              <span className="label">{this.props.inputLabel}</span>
              <input id="popupsharebox-input" className="input form--small form--inline" type="text" value={this.props.chartUrl}/>
            </label>
            <button type="button" className="button button--secondary clipboardButton"
              data-clipboard-text={this.props.chartUrl}>{this.props.applyButtonText}</button>

          </div>
        </dialog>
      </div>
    )
  }
}
