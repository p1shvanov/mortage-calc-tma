import { memo } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { routes } from './routes';

const Router = () => {
  return (
    <HashRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.Component />}
          />
        ))}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </HashRouter>
  );
};

export default memo(Router);
