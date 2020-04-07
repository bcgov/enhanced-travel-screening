import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import OpenSansRegularFont from './assets/fonts/OpenSans-Regular.ttf';
import OpenSansBoldFont from './assets/fonts/OpenSans-Bold.ttf';
import LatoRegularFont from './assets/fonts/Lato-Regular.ttf';
import LatoBoldFont from './assets/fonts/Lato-Bold.ttf';

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import SubmissionLookup from './pages/SubmissionLookup';
import SubmissionView from './pages/SubmissionView';
import Form from './pages/Form';

const openSansRegular = {
  fontFamily: 'Open Sans',
  fontWeight: 400,
  src: `url(${OpenSansRegularFont}) format('truetype')`,
};

const openSansBold = {
  fontFamily: 'Open Sans',
  fontWeight: 700,
  src: `url(${OpenSansBoldFont}) format('truetype')`,
};

const latoRegular = {
  fontFamily: 'Lato',
  fontWeight: 400,
  src: `url(${LatoRegularFont}) format('truetype')`,
};

const latoBold = {
  fontFamily: 'Lato',
  fontWeight: 700,
  src: `url(${LatoBoldFont}) format('truetype')`,
};

const theme = createMuiTheme({

  // Colors
  palette: {
    primary: {
      main: '#003366',
    },
    secondary: {
      main: '#FDB913',
    },
  },

  // Typography
  typography: {
    fontFamily: 'Lato, Open Sans, sans-serif',
  },

  // Component Overrides
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [latoRegular, latoBold, openSansRegular, openSansBold],
      },
    },
    MuiButton: {
      root: {
        fontSize: '17px',
        lineHeight: '22px',
        textTransform: 'capitalize',
      },
      outlined: {
        border: '2px solid #FFFFFF',
      },
    },
  },
});

const App = () => (
  <Fragment>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Switch>
          <PrivateRoute path="/lookup" component={SubmissionLookup} />
          <PrivateRoute path="/view" component={SubmissionView} />
          <Route path="/form" component={Form} />
          <Route component={Login} />
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  </Fragment>
);

ReactDOM.render(<App />, document.getElementById('root'));
