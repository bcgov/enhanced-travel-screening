import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import DesktopLogo from '../../assets/images/desktop-logo.svg';
import MobileLogo from '../../assets/images/traveller-support-mobile-outlined-v2.svg';
import { Routes } from '../../constants';

const useStyles = makeStyles((theme) => ({
  root: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    '& > header': {
      height: '80px',
      boxShadow: 'none',
    },
  },
  toolbar: {
    height: '100%',
  },
  logoWrapper: {
    flexGrow: 1,
  },
  logo: {
    height: '48px',
    cursor: 'pointer',
  },
  button: {
    height: '42px',
    padding: theme.spacing(1, 3),
    margin: theme.spacing(0, 1),
  },
}));

const Header = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const classes = useStyles();

  const isLookupScreen = location.pathname === Routes.Lookup;
  const isLookupResultsScreen = location.pathname === Routes.LookupResults.dynamicRoute(params.id);

  const handleLogoClick = () => history.push(Routes.Base);
  const handleSubmissionLookupClick = () => history.push(Routes.Lookup);
  const handleLogoutClick = () => {
    localStorage.removeItem('jwt');
    history.push(Routes.Login);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <div className={classes.logoWrapper}>
            <Hidden smDown>
              <img
                className={classes.logo}
                src={DesktopLogo}
                alt="Logo"
                onClick={handleLogoClick}
              />
            </Hidden>
            <Hidden mdUp>
              <img
                className={classes.logo}
                src={MobileLogo}
                alt="Logo"
                onClick={handleLogoClick}
              />
            </Hidden>
          </div>
          {isLookupResultsScreen && (
            <Button
              className={classes.button}
              variant="outlined"
              color="inherit"
              onClick={handleSubmissionLookupClick}
            >
              <Hidden smDown>Submission</Hidden> Lookup
            </Button>
          )}
          {(isLookupScreen || isLookupResultsScreen) && (
            <Button
              className={classes.button}
              variant="outlined"
              color="inherit"
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export { Header };
