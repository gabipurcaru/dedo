/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { Component, PropTypes } from 'react';
import Pad from '../Pad';
import { diffChars } from 'diff';
import sleep from 'sleep-promise';
import demoCode from '../../../demo.js';
import PopoverAt from '../PopoverAt';
import './IndexPage.css';

class IndexPage extends Component {
  constructor() {
    super();
    this.state = {
      helpText: null,
    };
  }

  _animate(steps) {
    if(this._stopAnimation) {
      this._stopAnimation();
    }
    let stop = false;
    const stopFunc = () => {
      stop = true;
    };

    const animate = async (text) => {
      const cm = this.refs.editor.getCodeMirror();
      const doc = cm.getDoc();
      const diff = diffChars(doc.getValue(), text);

      let pos = 0;
      for(let i=0; i<diff.length && !stop; i++) {
        const firstNonWhitespacePos = (
          diff[i].value.length - diff[i].value.trimLeft().length
        );
        if(!diff[i].added && !diff[i].removed) {
          pos += diff[i].count;
        } else if(diff[i].added) {
          for(let j=0; j<diff[i].value.length && !stop; j++) {
            cm.focus();
            doc.setCursor(doc.posFromIndex(pos ++));
            if(j === firstNonWhitespacePos) {
              // update tooltip pos
              const { left, top } = cm.cursorCoords();
              this.setState({ tooltipPos: { left: left + 4, top: top - 64 } });
            }

            cm.replaceSelection(diff[i].value[j]);
            await sleep(Math.random() * 50 + 50);
          }
        } else if(diff[i].removed) {
          doc.setSelection(
            doc.posFromIndex(pos),
            doc.posFromIndex(pos + diff[i].count)
          );
          doc.replaceSelection("");
        }
      }
    };

    const animateAll = async (steps) => {
      const cm = this.refs.editor.getCodeMirror();
      const doc = cm.getDoc();

      doc.setSelection(
        doc.posFromIndex(0),
        doc.posFromIndex(this.props.pad.code.length),
      );
      doc.replaceSelection("");
      const { left, top } = cm.cursorCoords();
      this.setState({ tooltipPos: { left, top: top - 64 } });

      for(var i=0; i<steps.length && !stop; i++) {
        const { helpText, code } = steps[i];
        this.setState({ helpText });
        await sleep(2000);
        await animate(code);
        await sleep(1500);
      }

      if(stop) {
        return;
      }

      await sleep(5000);
      this.setState({ helpText: null });
    };

    if(stop) {
      return;
    }

    this.setState({ helpText: null });
    animateAll(steps);
    this._stopAnimation = stopFunc;
  }

  render() {
    let demo;
    if(this.props.pad.id === -1) {
      demo = (
        <span>
          &nbsp;or&nbsp;
          <a
            href="#"
            onClick={() => this._animate(demoCode)}
          >
            watch a demo
          </a>
        </span>
      );
    }

    const EMPTY_PAD = {
      code: '',
      name: '',
    };

    return (
      <div>
        <div className="Pad-copy container">
          <p>
            You can create and share calculations instantly. The code on the right is editable and the results on the left appear
            right away. Give it a go{demo}.
          </p>
        </div>

        {this.props.padList}

        {this.state.helpText ?
          <PopoverAt pos={this.state.tooltipPos}>
            <span key={this.state.helpText}>{this.state.helpText}</span>
          </PopoverAt>
        : ''}

        <Pad
          ref="editor"
          pad={this.props.pad || EMPTY_PAD}
          canShare={this.props.pad.id !== -1 && this.props.pad.userId === this.props.user.id}
          onChange={this.props.savePad}
          makePublic={this.props.makePublic}
          />
      </div>
    );
  }
}

IndexPage.propTypes = {
  pad: PropTypes.object,
  savePad: PropTypes.func,
};

export default IndexPage;
