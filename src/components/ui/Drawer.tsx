"use client"

import * as React from "react"
import {Drawer} from "vaul"
import styled, {keyframes} from "styled-components"
import {IoClose} from "react-icons/io5";

/* ---------------- animations ---------------- */

const slideUp = keyframes`
    from {
        transform: translateY(100%)
    }
    to {
        transform: translateY(0)
    }
`

/* ---------------- styles ---------------- */

const Content = styled(Drawer.Content)`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    width: fit-content;
    margin: 0 auto;

    border-radius: 16px 16px 0 0;
    background: white;
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

    &:focus,
    &:focus-visible {
        outline: none;
        box-shadow: none;
    }
`

const Body = styled.div`
    overflow-y: hidden;
    //hide scrollbar 
    scrollbar-width: none;
    -ms-overflow-style: none;
    display: flex;
    justify-content: center;
    padding: 1rem;
`

export const CloseBtn = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.2rem;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 1100;
    outline: none;
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
        <Drawer.Root open={open} onOpenChange={onOpenChange}
            // dismissible={false}

        >
            <Drawer.Portal>
                {/*<Overlay/>*/}
                <Content aria-describedby="drawer-1-desc">
                    {/*<Handle/>*/}
                    <CloseBtn onClick={() => onOpenChange(false)}>
                        <IoClose size={24}/>
                    </CloseBtn>
                    <Body>{children}</Body>
                </Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
