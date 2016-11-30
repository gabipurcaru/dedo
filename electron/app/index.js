// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './routes';
import './app.global.css';
import 'react-mdl/extra/material.js';

render(
  <Router history={hashHistory} routes={routes} />,
  document.getElementById('root')
);
