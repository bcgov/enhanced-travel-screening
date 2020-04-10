import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import MomentUtils from '@date-io/moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import Routes from './constants/routes';

import OpenSansRegularFont from './assets/fonts/OpenSans-Regular.ttf';
import OpenSansBoldFont from './assets/fonts/OpenSans-Bold.ttf';
import LatoRegularFont from './assets/fonts/Lato-Regular.ttf';
import LatoBoldFont from './assets/fonts/Lato-Bold.ttf';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

const SubmissionForm = lazy(() => import('./pages/SubmissionForm'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const PDF = lazy(() => import('./pages/PDF'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLookup = lazy(() => import('./pages/AdminLookup'));
const AdminLookupResults = lazy(() => import('./pages/AdminLookupResults'));

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
        paddingLeft: '4px',
      },
    },
    MuiFormHelperText: {
      contained: {
        marginLeft: 0,
      },
    },
    MuiFormLabel: {
      root: {
        color: 'inherit',
        '&.Mui-focused': {
          color: 'inherit'
        }
      }
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LinearProgress />}>
          <Switch>
            {/* Non-admin routes */}
            <PublicRoute exact path={Routes.Base} component={SubmissionForm} />
            <PublicRoute exact path={Routes.Confirmation} component={Confirmation} />
            <PublicRoute exact path={Routes.RenderPDF.staticRoute} component={PDF} />

            {/* Admin routes */}
            <PublicRoute exact path={Routes.Login} component={AdminLogin} />
            <PrivateRoute exact path={Routes.Lookup} component={AdminLookup} />
            <PrivateRoute exact path={Routes.LookupResults.staticRoute} component={AdminLookupResults} />

            {/* Invalid route - default to user form */}
            <Route component={SubmissionForm} />
          </Switch>
        </Suspense>
      </BrowserRouter>
    </MuiPickersUtilsProvider>
  </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
