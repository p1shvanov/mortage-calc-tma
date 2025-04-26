import { memo, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Layout from '@/components/Layout.tsx';
import LoadingFallback from '@/components/LoadingFallback';

// Lazy load route components
const LoanForm = lazy(() => import('@/forms/LoanForm/LoanForm'));
const MortageResult = lazy(() => import('@/components/MortageResult'));

const Router = () => {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <Layout />,
        children: [
          { 
            index: true, 
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <LoanForm />
              </Suspense>
            ) 
          },
          { 
            path: '/result', 
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <MortageResult />
              </Suspense>
            ) 
          },
        ],
      },
    ],
    {
      basename: '/mortage-calc-tma/',
    }
  );

  return <RouterProvider router={router} />;
};

export default memo(Router);
