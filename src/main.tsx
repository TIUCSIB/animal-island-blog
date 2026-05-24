import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import 'animal-island-ui/style'
import './index.css'

import { RouterProvider } from 'react-router/dom'
import { queryClient } from '@/lib/query-client'
import router from './routes'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
)
