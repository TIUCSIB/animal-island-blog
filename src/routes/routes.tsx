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
            handle: { title: '小岛的生活' },
          },
          {
            path: 'about',
            element: <AboutPage />,
            handle: { title: '关于小岛' },
          },
        ],
      },
      {
        path: '404',
        element: <NotFoundPage />,
        handle: { title: '页面走丢了' },
      },
      {
        path: 'posts/:postId',
        element: <PostDetailPage />,
        handle: { title: '' },
      },
      {
        path: 'admin',
        element: <AdminPage />,
        handle: { title: '小岛后台管理' },
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]
