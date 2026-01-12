import {useEffect, useState} from "react"

export function useMediaQuery(query: string) {
    const getMatches = () => {
        if (typeof window === "undefined") return false
        return window.matchMedia(query).matches
    }

    const [matches, setMatches] = useState(getMatches)

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)

        const handler = (e: MediaQueryListEvent) => {
            setMatches(e.matches)
        }

        mediaQuery.addEventListener("change", handler)
        return () => mediaQuery.removeEventListener("change", handler)
    }, [query])

    return matches
}

export function useIsMobile() {
    return useMediaQuery("(max-width: 767px)")
}

export function useIsDesktop() {
    return useMediaQuery("(min-width: 768px)")
}
