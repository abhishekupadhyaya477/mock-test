import { createHashRouter } from 'react-router-dom';
import MockSelection from './components/MockSelection';
import ActiveTest from './components/ActiveTest';
import ScoreSummary from './components/ScoreSummary';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminDashboard } from './components/admin/AdminDashboard';

/**
 * Using HashRouter so the app works on GitHub Pages
 * (which doesn't support SPA fallback routing).
 */
export const router = createHashRouter([
  // ─── Public routes ───────────────────────────────────────
  {
    path: '/',
    element: <MockSelection />,
  },
  {
    path: '/test/:mockId',
    element: <ActiveTest />,
  },
  {
    path: '/test/:mockId/result',
    element: <ScoreSummary />,
  },

  // ─── Admin routes ────────────────────────────────────────
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
    ],
  },
]);
