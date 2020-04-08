import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Routes from './constants/routes';

import OpenSansRegularFont from './assets/fonts/OpenSans-Regular.ttf';
import OpenSansBoldFont from './assets/fonts/OpenSans-Bold.ttf';
import LatoRegularFont from './assets/fonts/Lato-Regular.ttf';
import LatoBoldFont from './assets/fonts/Lato-Bold.ttf';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import SubmissionForm from './pages/SubmissionForm';
import Confirmation from './pages/Confirmation';
import PDF from './pages/PDF';
import AdminLogin from './pages/AdminLogin';
import AdminLookup from './pages/AdminLookup';
import AdminLookupResults from './pages/AdminLookupResults';

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
      main: '#002C71',
    },
    secondary: {
      main: '#FDB913',
    },
    warning: {
      main: '#F5A623',
    }
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
    MuiInputBase: {
      input: {
        '&.MuiFilledInput-input&:not(.MuiSelect-selectMenu)': {
          height: '40px',
          lineHeight: '18px',
        },
      },
    },
    MuiFilledInput: {
      root: {
        borderTopLeftRadius: '3px',
        borderTopRightRadius: '3px',
      },
      input: {
        padding: 0,
        paddingLeft: '4px'
      }
    },
    MuiSelect: {
      selectMenu: {
        height: '31px',
        paddingTop: '10px',
        paddingLeft: '4px'
      }
    }
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <Switch>
        {/* Non-admin routes */}
        <PublicRoute exact path={Routes.Base} component={SubmissionForm} />
        <PublicRoute exact path={Routes.Confirmation} component={Confirmation} />
        <PublicRoute exact path={Routes.RenderPDF} component={PDF} />

        {/* Admin routes */}
        <PublicRoute exact path={Routes.Login} component={AdminLogin} />
        <PrivateRoute exact path={Routes.Lookup} component={AdminLookup} />
        <PrivateRoute exact path={Routes.LookupResults.staticRoute} component={AdminLookupResults} />

        {/* Invalid route - default to user form */}
        <Route component={SubmissionForm} />
      </Switch>
    </BrowserRouter>
  </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
