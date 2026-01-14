import './App.css'
import Chatbot from "./components/Chatbot.tsx";
import {ErrorBoundary} from "react-error-boundary";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/Popover.tsx";
import {Toaster} from "./components/ui/Sonner.tsx";
import styled from "styled-components";
import {useIsMobile} from "./components/ui/useMediaQuery.ts";
import {BottomDrawer} from "./components/ui/Drawer.tsx";
import {useState} from "react";
import {AppStateProvider} from "./AppStateContext.tsx";

function ErrorFallback({error, resetErrorBoundary}: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <ErrorBoundaryStyled role="alert">
            <p>{error.name}</p>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </ErrorBoundaryStyled>
    )
}

function App() {
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()

    if (isMobile) return (
        <WidgetStyled id="widget-chatbot-root">
            <button type="button" onClick={() => setOpen(true)}>Open</button>
            <BottomDrawer open={open} onOpenChange={setOpen}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AppStateProvider>
                        <Chatbot isDesktop={false}/>
                    </AppStateProvider>
                </ErrorBoundary>
            </BottomDrawer>
        </WidgetStyled>
    )

    return (
        <WidgetStyled id="widget-chatbot-root">
            <Popover>
                <PopoverTrigger>Open</PopoverTrigger>
                <PopoverContent>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <AppStateProvider>
                            <Chatbot isDesktop={true}/>
                        </AppStateProvider>
                    </ErrorBoundary>
                </PopoverContent>
            </Popover>
            <Toaster/>
        </WidgetStyled>
    )
}

export default App

const WidgetStyled = styled.div`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 1000;
`

const ErrorBoundaryStyled = styled.div`
    padding: 1rem;
    box-shadow: var(--shadow-light);
    border-radius: 1rem;
`