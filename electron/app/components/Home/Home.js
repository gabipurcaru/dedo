// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import IndexPage from '../IndexPage';
import { Navigation, Header, Layout, Content, IconToggle } from 'react-mdl';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pad: {
        id: -1,
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
      },
      user: {
        id: 1,
      },
    };
  }

  _savePad = (pad) => {
    this.setState({ pad });
  };

  _close() {
    console.log('quit', require('electron').remote.app.quit());
    // require('electron').app.quit();
  };

  render() {
    return (
      <Layout fixedHeader>
        <Content>
          <IndexPage
            pad={this.state.pad}
            user={this.state.user}
            savePad={this._savePad}
          />
        </Content>
      </Layout>
    );
  }
}
