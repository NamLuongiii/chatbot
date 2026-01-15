import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'
import {Toaster} from "./components/ui/Sonner.tsx";

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            throwOnError: true,
            refetchOnMount: true,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
            <Toaster/>
        </QueryClientProvider>
    </StrictMode>,
)
