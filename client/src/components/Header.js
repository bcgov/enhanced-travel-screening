import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import DesktopLogo from '../assets/images/desktop-logo.svg';
import MobileLogo from '../assets/images/mobile-logo.svg';

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
  },
  button: {
    height: '42px',
    padding: theme.spacing(1, 3),
  },
}));

const Header = () => {
  const history = useHistory();
  const classes = useStyles();

  const handleSubmissionLookupClick = () => history.push('/lookup');

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <div className={classes.logoWrapper}>
            <Hidden smDown>
              <img className={classes.logo} src={DesktopLogo} alt="Logo" />
            </Hidden>
            <Hidden mdUp>
              <img className={classes.logo} src={MobileLogo} alt="Logo" />
            </Hidden>
          </div>
          <Button
            className={classes.button}
            variant="outlined"
            color="inherit"
            onClick={handleSubmissionLookupClick}
          >
            Submission Lookup
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
