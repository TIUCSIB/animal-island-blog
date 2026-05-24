import type { RouteObject } from 'react-router'
import App from '@/App'
import AboutPage from '@/pages/AboutPage'
import AdminPage from '@/pages/AdminPage'
import HomePage from '@/pages/HomePage'
import { SiteLayout } from '@/pages/components/SiteLayout'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'about',
            element: <AboutPage />,
          },
        ],
      },

      {
        path: 'admin',
        element: <AdminPage />,
      },
    ],
  },
]
