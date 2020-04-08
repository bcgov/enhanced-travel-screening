import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PublicRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    !window.localStorage.getItem('jwt')
      ? <Component {...props} />
      : <Redirect to='/lookup' />
  )} />
);

export default PublicRoute;
