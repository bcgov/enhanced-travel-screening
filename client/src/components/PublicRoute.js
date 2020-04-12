import React, { useState, useEffect } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Route } from 'react-router-dom';

import { verifyJWT } from '../utils';

const PublicRoute = ({ component: Component, ...rest }) => {
  const [isValid, setValidity] = useState(null);

  useEffect(() => {
    (async () => {
      const jwt = window.localStorage.getItem('jwt');
      if (!jwt) setValidity(false);
      else setValidity(await verifyJWT(jwt));
    })();
  }, []);

  return isValid === null ? <LinearProgress /> : (
    <Route {...rest} render={(props) => <Component {...props} />}/>
  );
};

export default PublicRoute;