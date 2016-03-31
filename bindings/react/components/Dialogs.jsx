import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';

class BaseDialog extends React.Component {
  show() {
    this.node.firstChild.show();
  }

  hide() {
    this.node.firstChild.hide();
  }

  componentDidMount() {
    this.node = document.createElement('div');
    document.body.appendChild(this.node);

    this.node.addEventListener('cancel', () => {
      this.props.onCancel();
    });
    this.renderPortal(this.props);
  }

  componentWillReceiveProps(newProps) {

    if (newProps.isOpen != this.props.isOpen) {
      this.animateShow = true;
    }
    this.renderPortal(newProps);
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
  }

  _update() {
    CustomElements.upgrade(this.node.firstChild);
    if (this.props.isOpen) {
      if (this.animateShow) {
        this.show();
      }
      this.animateShow = false;
    } else {
      this.hide();
    }
  }

  _getDomNodeName() {
    throw new Error('_getDomNodeName is not implemented');
  }

  renderPortal(props) {
    var element = React.createElement(this._getDomNodeName(), props);
    ReactDOM.render(element, this.node, this._update.bind(this));
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return React.DOM.noscript();
  }
}

class Dialog extends BaseDialog {
  _getDomNodeName() {
    return 'ons-dialog';
  }
}


class AlertDialog extends BaseDialog {
  _getDomNodeName() {
    return 'ons-alert-dialog';
  }
}

class Popover extends BaseDialog {
  _getDomNodeName() {
    return 'ons-popover';
  }

  show() {
    var target = this.props.getTarget();
    if (!ReactTestUtils.isElement(target)) {
      target = ReactDOM.findDOMNode(target);
    }
    return this.node.firstChild.show(target);
  }
}

export {AlertDialog, Dialog, Popover};
