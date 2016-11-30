import React, { Component } from 'react';
import { Navigation, Header, Layout, Content, Button } from 'react-mdl';
import IndexPage from '../../../../core/IndexPage';
import PadList from '../../../../core/PadList';
import './App.css';

const defaultPad = {
  id: -1,
  name: 'Example pad',
  code: `$$$: rate = $15/h
workhours = 8h
workdays = 22 / month
after_tax = 1 - 30%

rent = $230/month
food = $200/month
others = $30/day
monthly_expenses = sum

monthly_salary_gross = rate * workhours * workdays
monthly_salary = prev * after_tax
yearly_salary = prev * 12
monthly_after_expenses = monthly_salary - monthly_expenses
such money, much wow: yearly_after_expenses = 1 year * monthly_after_expenses

expense_percentage = monthly_expenses / monthly_salary * 100

yearly_after_expenses in ron
yearly_after_expenses in eur`,
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = JSON.parse(localStorage.getItem('state')) || {
      pads: [defaultPad],
      selectedPadID: 0,
      user: {
        id: 1,
      },
    };
  }

  _savePad = (pad) => {
    const { pads, selectedPadID } = this.state;
    this.setState({
      pads: [
        ...pads.slice(0, selectedPadID),
        pad,
        ...pads.slice(selectedPadID + 1),
      ],
    });
  }

  _createPad = () => {
    this.setState({
      pads: [...this.state.pads, {id: -1, name: 'New pad', code: ''}],
      selectedPadID: this.state.pads.length,
    });
  }

  _deletePad = (idx) => {
    const { pads, selectedPadID } = this.state;
    this.setState({
      pads: [
        ...pads.slice(0, idx),
        ...pads.slice(idx + 1),
      ],
      selectedPadID:
        (idx <= selectedPadID)
          ? (selectedPadID - 1)
          : selectedPadID,
    });
  }

  _selectPad = (idx) => {
    this.setState({
      selectedPadID: idx,
    });
  }

  _renamePad = (event) => {
    const { pads, selectedPadID } = this.state;
    const selectedPad = pads[selectedPadID];
    this.setState({
      pads: [
        ...pads.slice(0, selectedPadID),
        {
          ...selectedPad,
          name: event.target.value,
        },
        ...pads.slice(selectedPadID + 1),
      ],
    });
  }

  _downloadAll = () => {
    const data = JSON.stringify(this.state);
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', () => {
      const contents = fileReader.result.replace(
        /^data:/,
        'data:application/octet-stream',
      );
      const a = document.createElement('a');
      a.setAttribute('href', contents);
      a.setAttribute('download', 'Pads.dedo');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    });
    fileReader.readAsDataURL(
      new File([data], 'Pads.dedo'),
    );
  }

  _import = () => {
    // TODO
  }

  render() {
    localStorage.setItem('state', JSON.stringify(this.state));
    const padList = (
      <PadList
        pads={this.state.pads}
        selectedPadID={this.state.selectedPadID}
        selectPad={this._selectPad}
        createPad={this._createPad}
        deletePad={this._deletePad}
        renamePad={this._renamePad}
      />
    );

    return (
      <Layout fixedHeader>
        <Header title="Dedo">
          <Navigation>
          </Navigation>
        </Header>
        <Content>
          <IndexPage
            pad={this.state.pads[this.state.selectedPadID]}
            user={this.state.user}
            savePad={this._savePad}
            padList={padList}
          />
          <Button primary ripple onClick={this._downloadAll}>
            Download
          </Button>
          <Button ripple onClick={this._import}>
            Upload from file
          </Button>
        </Content>
      </Layout>
    );
  }
}

export default App;
