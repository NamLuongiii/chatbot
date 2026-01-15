import './App.css'
import Chatbot from "./components/Chatbot.tsx";
import {ErrorBoundary} from "react-error-boundary";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/Popover.tsx";
import styled from "styled-components";
import {useIsMobile} from "./components/ui/useMediaQuery.ts";
import {BottomDrawer} from "./components/ui/Drawer.tsx";
import {useState} from "react";
import {AppStateProvider} from "./AppStateContext.tsx";
import {TbMessageChatbot} from "react-icons/tb";

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
            <ButtonChat onClick={() => setOpen(true)}>
                <TbMessageChatbot size={24}/>
            </ButtonChat>
            <BottomDrawer open={open} onOpenChange={setOpen}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <AppStateProvider>
                        {open && <Chatbot isDesktop={false}/>}
                    </AppStateProvider>
                </ErrorBoundary>
            </BottomDrawer>
        </WidgetStyled>
    )

    return (
        <WidgetStyled id="widget-chatbot-root">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <ButtonChat>
                        <TbMessageChatbot size={24}/>
                    </ButtonChat>
                </PopoverTrigger>
                <PopoverContent>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <AppStateProvider>
                            <Chatbot isDesktop={true}/>
                        </AppStateProvider>
                    </ErrorBoundary>
                </PopoverContent>
            </Popover>
        </WidgetStyled>
    )
}

export default App

const WidgetStyled = styled.div`
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1000;
`

const ErrorBoundaryStyled = styled.div`
    background: var(--primary-color);
    padding: 2rem;
    box-shadow: var(--shadow-light);
    border-radius: 1rem;
`

const ButtonChat = styled.span`
    width: 50px;
    height: 50px;
    display: flex;
    background: cornflowerblue;
    color: white;
    justify-content: center;
    align-items: center;
    border-radius: 32px;
    cursor: pointer;
`