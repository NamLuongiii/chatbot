"use client"

import * as React from "react"
import {Drawer} from "vaul"
import styled, {keyframes} from "styled-components"

/* ---------------- animations ---------------- */

// const fadeIn = keyframes`
//     from {
//         opacity: 0
//     }
//     to {
//         opacity: 1
//     }
// `

const slideUp = keyframes`
    from {
        transform: translateY(100%)
    }
    to {
        transform: translateY(0)
    }
`

/* ---------------- styles ---------------- */

// const Overlay = styled(Drawer.Overlay)`
//     position: fixed;
//     inset: 0;
//     background: rgba(0, 0, 0, 0.2);
//     animation: ${fadeIn} 0.2s ease-out;
// `

const Content = styled(Drawer.Content)`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 5000;

    border-radius: 16px 16px 0 0;
    animation: ${slideUp} 0.25s ease-out;

    max-height: 90vh;
    display: flex;
    flex-direction: column;

    @media (min-width: 768px) {
        left: 50%;
        transform: translateX(-50%);
        width: 420px;
        border-radius: 16px;
    }
`

// const Handle = styled.div`
//     width: 80px;
//     height: 6px;
//     border-radius: 999px;
//     background: #e5e7eb;
//     margin: 12px auto;
// `

const Body = styled.div`
    overflow-y: hidden;
    //hide scrollbar 
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    justify-content: center;
`

/* ---------------- component ---------------- */

type BottomDrawerProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function BottomDrawer({
                                 open,
                                 onOpenChange,
                                 children,
                             }: BottomDrawerProps) {
    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                {/*<Overlay/>*/}
                <Content>
                    {/*<Handle/>*/}
                    <Body>{children}</Body>
                </Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
