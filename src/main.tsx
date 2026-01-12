import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {QueryClient, QueryClientProvider,} from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            throwOnError: true,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    </StrictMode>,
)
