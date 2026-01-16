import './App.css'
import Chatbot from "./components/Chatbot.tsx";
import {ErrorBoundary} from "react-error-boundary";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/Popover.tsx";
import styled from "styled-components";
import {useIsMobile} from "./components/ui/useMediaQuery.ts";
import {BottomDrawer} from "./components/ui/Drawer.tsx";
import {useState} from "react";
import {AppStateProvider} from "./AppStateContext.tsx";
import {ButtonChat} from "./components/ui/ButtonChat.tsx";

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
            <ButtonChat onClick={() => setOpen(true)}/>
            <BottomDrawer open={open} onOpenChange={setOpen}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AppStateProvider>
                        <Chatbot isDesktop={false} onClose={() => setOpen(false)}/>
                    </AppStateProvider>
                </ErrorBoundary>
            </BottomDrawer>
        </WidgetStyled>
    )

    return (
        <WidgetStyled id="widget-chatbot-root">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <ButtonChat/>
                </PopoverTrigger>
                <PopoverContent>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <AppStateProvider>
                            <Chatbot isDesktop={true} onClose={() => setOpen(false)}/>
                        </AppStateProvider>
                    </ErrorBoundary>
                </PopoverContent>
            </Popover>
        </WidgetStyled>
    )
}

export default App

const WidgetStyled = styled.div`

`

const ErrorBoundaryStyled = styled.div`
    background: var(--primary-color);
    padding: 2rem;
    box-shadow: var(--shadow-light);
    border-radius: 1rem;
`

