/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { Component, PropTypes } from 'react';
import Editor from '../Editor';
import { run } from '@dedo/lang';
import numeral from 'numeral';
import { Button, Grid, Cell } from 'react-mdl';
import './Pad.css';

const FULL_SIZE = 992; // pixels

class Pad extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getCodeMirror() {
    return this.refs.editor.getCodeMirror();
  }

  _padPermalink() {
    return `http://www.dedo.io/pad/${this.props.pad.id}`;
  }

  _selectShareLink() {
    this.refs.shareLink.refs.input.setSelectionRange(0, this.refs.shareLink.props.value.length);
  }

  _numFormat(num, precision) {
    // 0.00012 --> 0
    // 0.12222 --> 0.12
    // 0.1     --> 0.1
    // 12.1444 --> 12.14
    // 12.0001 --> 12
    const abs = Math.abs(num);
    const whole = parseInt(abs, 10);
    const rest = abs - whole;
    let decimals = (rest + '').slice(2, 2 + precision);
    while(decimals.length > 0 && decimals[decimals.length - 1] === '0') {
      decimals = decimals.slice(0, decimals.length - 1);
    }
    return (num < 0 ? '-' : '') + (decimals.length > 0 ? whole + '.' + decimals : whole);
  }

  _getSidebar(code): Array<Object> {
    try {
      return run(code, this.state.formValue);
    } catch(err) {
      console.error(err);
      return [];
    }
  }

  _getResult() {
    const sidebar = this._getSidebar(this.props.pad.code);

    return sidebar.map((line) => {
      if(!line) {
        return '';
      }
      let units = [];
      const unitPretty = (name, val) => {
        if(val === 1) {
          return <span key={name+val}>{name}</span>;
        } else if(val === -1) {
          return <span key={name+val}>/{name}</span>;
        } else if(val > 1) {
          return <span key={name+val}>{name}<sup>{val}</sup></span>;
        } else {
          return <span key={name+val}>/{name}<sup>{-val}</sup></span>;
        }
      }

      for(const unitName in line.units) {
        if(!(line.units[unitName] > 0)) {
          continue;
        }
        units.push(unitPretty(unitName, line.units[unitName]));
      }
      for(const unitName in line.units) {
        if(line.units[unitName] > 0) {
          continue;
        }
        units.push(unitPretty(unitName, line.units[unitName]));
      }

      return (
        <span>
          {numeral(line.num).format('0,0.[00]')}
          {units}
        </span>
      );
    });
  }

  _renderEditor() {
    if(typeof window !== 'undefined' && window.top !== window.self) {
      return null;
    }
    return (
      <Editor
        ref="editor"
        mode="calcu"
        onChange={code => this.props.onChange({ ...this.props.pad, code })}
        name="uid"
        editorProps={{
          $blockScrolling: Infinity,
        }}
        fontSize={20}
        value={this.props.pad.code}
        highlightActiveLine={false}
        showPrintMargin={false}
      />
    );
  }

  _renderForm() {
    const lines = this.props.pad.code.split(/\n/g);
    const result = this._getResult();

    const updateLine = (idx, value) => {
      this.setState({
        formValue: { ...this.state.formValue, [idx]: value },
      });
    };

    const renderLine = (code, resultLine, idx) => {
      let placeholder;
      try {
        if(code.indexOf(':') !== -1) {
           placeholder = code.match(/^(.*):/)[1];
        } else {
          const placeholderMatch = code.replace(/^.*:\s*/, '').match(/[^ =]+/);
          if(placeholderMatch && placeholderMatch.length > 0) {
            placeholder = placeholderMatch[0].replace(
              /_/g, ' '
            ).replace(/(^| )([a-z])/g, match => match.toUpperCase());
          }
        }
      } catch(err) {
        console.error(err);
      }
      const PLACEHOLDER = /\[(.*?)\]/;
      let line;
      if(PLACEHOLDER.test(code)) {
        let value = code.match(PLACEHOLDER)[1];
        const rawValue = value;
        let isBoolean = false;
        let isMap = false;
        if(value.indexOf(',') !== -1) {
          if(value.indexOf(':') !== -1) {
            isMap = true;
          } else {
            isBoolean = true;
          }
        }
        if(this.state.formValue
           && typeof this.state.formValue[idx] !== 'undefined') {
          if(isBoolean) {
            const [before, after] = value.split(/,/);
            value = this.state.formValue[idx] === false ? after : before;
          } else {
            value = this.state.formValue[idx];
          }
        } else {
          if(isBoolean) {
            value = value.split(/,/)[0];
          } else if(isMap) {
            value = value.split(/,/)[0].split(/:/)[1];
          }
        }
        let unit = code.replace(PLACEHOLDER, '').replace(/.*=(.*)/, '$1').replace(/[0-9\[\]]+/, '');
        if(unit[0] === '×') {
          unit = unit.slice(1);
        }

        if(!unit) {
          unit = ' ';
        }

        if(isBoolean) {
          let formValue = true;
          if(this.state.formValue && typeof this.state.formValue[idx] !== 'undefined') {
            formValue = this.state.formValue[idx];
          }
          line = (
            <input
              type="checkbox"
              label={placeholder}
              onChange={evt => updateLine(idx, evt.target.checked)}
              checked={!!formValue}
            />
          );
        } else if(isMap) {
          const values = rawValue.split(/,/g).map(val => val.split(/:/));
          line = (
            <select value={value} onChange={evt => updateLine(idx, evt.target.value)}>
              {values.map(([label, value]) =>
                <option key={label} value={value}>{label}</option>
              )}
            </select>
          )
        } else {
          line = (
            <input
              type="number"
              bsSize="small"
              addonAfter={unit}
              placeholder={placeholder}
              onChange={evt => updateLine(idx, evt.target.value) }
              value={value}
            />
          );
        }
      } else if(resultLine || placeholder) {
        line = (
          <span>
            {placeholder ?
              <span className="Pad-form-line-label">
                {placeholder}{resultLine ? ": " : ""}
              </span>
            : ''}
            <span className="Pad-form-line-value">
              {resultLine}
            </span>
          </span>
        );
      } else {
        return <span>&nbsp;</span>;
      }

      return line;
    };

    let className = "Pad-form";
    if(typeof window !== 'undefined' && window.top !== window.self) {
      className += " iframe";
    }

    let toggleButton;
    className += " small";

    return (
      <div className={className}>
        {lines.map((line, idx) =>
          <div key={idx} className="Pad-form-line">
            {renderLine(line, result[idx], idx)}
          </div>
        )}
        {toggleButton}
      </div>
    );
  }

  render() {
    let formWidth = 4;
    let editor = (
      <Cell col={8}>
        {this._renderEditor()}
      </Cell>
    );

    let share;
    if(this.props.canShare) {
      share = (
        <div style={{ textAlign: 'center' }}>
          <input type="checkbox" className="make-public" checked={this.props.pad.isPublic} label="Make public" onChange={evt => this.props.makePublic(this.props.pad, evt.target.checked)} />
          {this.props.pad.isPublic ?
            <input ref="shareLink" type="text" className="permalink" value={this._padPermalink()} onClick={() => this._selectShareLink()} readOnly={true} />
          : ''}
        </div>
      );
    }

    const form = (
      <Cell col={formWidth}>
        {this._renderForm() }
      </Cell>
    );

    return (
      <div className="Pad">
        <Grid noSpacing>
          {form}
          {editor}
          {share}
        </Grid>
      </div>
    );
  }
}

Pad.propTypes = {
  pad: PropTypes.object,
  savePad: PropTypes.func,
};

export default Pad;
