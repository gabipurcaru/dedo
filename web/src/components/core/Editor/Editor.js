import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import './Editor.css';

if(typeof window !== 'undefined') {
  require('./language');
}

export default class Editor extends Component {
  componentDidMount() {
    this.refs.editor.focus();
  }

  getCodeMirror() {
    return this.refs.editor.getCodeMirror();
  }

  render() {
    const options = {
      mode: 'calcu',
      scrollbarStyle: 'null',
    };

    return (
      <div style={{ minHeight: this.props.height || '500px' }} className="Editor">
        <CodeMirror
          ref="editor"
          value={this.props.value}
          onChange={val => this.props.onChange(val)}
          options={options}
          />
      </div>
    );
  }
}
