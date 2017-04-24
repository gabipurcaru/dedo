import React from 'react';
import { Chip, Button, Icon } from 'react-mdl';
import './PadList.css';

export default class PadList extends React.PureComponent {
  render() {
    const { pads, selectedPadID } = this.props;
    return (
      <div className="PadList-container">
        {pads.map((pad, idx) =>
          <span
            className={`
              PadList-pad
              ${idx === selectedPadID ? 'selected' : ''}
            `}
            key={idx}
          >
            <Chip
              onClick={() => this.props.selectPad(idx)}
              onClose={(e) => {
                this.props.deletePad(idx);
                e.stopPropagation();
                return false;
              }}
            >
              {pad.name || 'Untitled pad'}
            </Chip>
          </span>
        )}
        <Button colored ripple onClick={this.props.createPad}>
          <Icon name="add" />
        </Button>
      </div>
    )
  }
}
