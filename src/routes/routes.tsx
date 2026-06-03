import { Navigate } from 'react-router'
import type { RouteObject } from 'react-router'
import App from '@/App'
import AboutPage from '@/pages/AboutPage'
import AdminPage from '@/pages/AdminPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import PostDetailPage from '@/pages/PostDetailPage'
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
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: 'posts/:postId',
        element: <PostDetailPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]
