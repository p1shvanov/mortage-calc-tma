import { memo } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { routes } from './routes';

const Router = () => {
  return (
    <HashRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </HashRouter>
  );
};

export default memo(Router);
