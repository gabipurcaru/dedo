import React, { Component } from 'react';
import Popover from 'react-popover';
import './PopoverAt.css';

export default class PopoverAt extends Component {
  render() {
    let { children, pos, isOpen } = this.props
    if(typeof pos === 'undefined') {
      pos = { left: 0, top: 0 };
    }

    const { left, top } = pos;

    return (
      <Popover body={children} isOpen={typeof isOpen !== 'undefined' ? isOpen : true} ref="popover">
        <span style={{ position: 'absolute', left: left + 'px', top: top + 'px' }} ref="anchor"></span>
      </Popover>
    );
  }
}
