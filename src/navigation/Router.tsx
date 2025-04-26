import { memo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from '@/components/Layout.tsx';
import LoanForm  from '@/forms/LoanForm/LoanForm';
import MortageResult from '@/components/MortageResult';

const Router = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <LoanForm /> },
        { path: '/result', element: <MortageResult /> },
      ],
    },
  ], {
    basename: '/mortage-calc-tma/'
  });

  return <RouterProvider router={router} />;
}

export default memo(Router);