import React, { useEffect } from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useGuildStore, useAuthStore } from './store';
import { SessionInitializer } from './components/SessionInitializer';
import { ToastContainer } from './components/ToastContainer';
import { queryClient } from './lib/queryClient';

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
  const { fetchData } = useGuildStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionInitializer>
        <RouterProvider router={router} />
        <ToastContainer />
      </SessionInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
