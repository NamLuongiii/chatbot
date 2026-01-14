import {createContext, type ReactNode, useContext, useState,} from "react"
import {ConnectionStatus} from "./types.ts";


/* =====================
 * State shape
 * ===================== */
interface AppState {
    connection: ConnectionStatus
    isVideoPlaying: boolean
    isLoadingConfig: boolean
    isLoadedConfig: boolean

    setConnection: (status: ConnectionStatus) => void
    setVideoPlaying: (value: boolean) => void
    setLoadingConfig: (value: boolean) => void
    setLoadedConfig: (value: boolean) => void
}

/* =====================
 * Context
 * ===================== */
const AppStateContext = createContext<AppState | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */
export function AppStateProvider({children}: { children: ReactNode }) {
    const [connection, setConnection] = useState<ConnectionStatus>(
        ConnectionStatus.DISCONNECTED
    )
    const [isVideoPlaying, setVideoPlaying] = useState(false)
    const [isLoadingConfig, setLoadingConfig] = useState(false)
    const [isLoadedConfig, setLoadedConfig] = useState(false)

    const value: AppState = {
        connection,
        isVideoPlaying,
        isLoadingConfig,
        isLoadedConfig,

        setConnection,
        setVideoPlaying,
        setLoadingConfig,
        setLoadedConfig,
    }

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    )
}

/* =====================
 * Hook
 * ===================== */
export function useAppState() {
    const context = useContext(AppStateContext)
    if (!context) {
        throw new Error("useAppState must be used within AppStateProvider")
    }
    return context
}
