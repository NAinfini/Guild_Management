import React from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionInitializer } from '@/features/Auth/components/SessionInitializer';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { ThemeControllerProvider } from '@/theme/ThemeController';


// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  // �?No more manual fetchData() - TanStack Query handles all server state
  // Components will automatically fetch data when they mount using useMembers(), useEvents(), etc.

  return (
    <>
      <SessionInitializer>
        <ThemeControllerProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ThemeControllerProvider>
      </SessionInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;
