import React, { useState, useEffect } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Route, Redirect } from 'react-router-dom';

import verifyJWT from '../utils/verify-jwt';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [isValid, setValidity] = useState(null);

  useEffect(() => {
    (async () => {
      setValidity(await verifyJWT());
    })();
  }, []);

  return isValid === null ? <LinearProgress /> : (
    <Route {...rest} render={(props) => (
      isValid
        ? <Component {...props} />
        : <Redirect to='/login' />
      )}
    />
  );
}

export default PrivateRoute;
