import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import styled, {keyframes} from "styled-components"
import {IoClose} from "react-icons/io5"

/* ---------------- animation ---------------- */

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`

const slideDown = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(6px);
    }
`

/* ---------------- styles (GIỮ NGUYÊN) ---------------- */

const Content = styled(PopoverPrimitive.Content)`
    z-index: 50;
    display: flex;
    flex-direction: column;
    place-items: center;
    outline: none;

    position: relative; /* cần cho nút close */

    &[data-state="open"] {
        animation: ${slideUp} 0.16s ease-out;
    }

    &[data-state="closed"] {
        animation: ${slideDown} 0.12s ease-in;
    }
`

const CloseButton = styled(PopoverPrimitive.Close)`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 60;

    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
`

/* ---------------- components ---------------- */

function Popover(
    props: React.ComponentProps<typeof PopoverPrimitive.Root>
) {
    return <PopoverPrimitive.Root {...props} />
}

function PopoverTrigger(
    props: React.ComponentProps<typeof PopoverPrimitive.Trigger>
) {
    return <PopoverPrimitive.Trigger {...props} />
}

function PopoverContent({
                            side = "top",
                            align = "end",
                            sideOffset = 8,
                            children,
                            ...props
                        }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <Content
                side={side}
                align={align}
                sideOffset={sideOffset}
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}     // ⛔ ESC
                {...props}
            >
                <CloseButton aria-label="Close">
                    <IoClose size={18}/>
                </CloseButton>

                {children}
            </Content>
        </PopoverPrimitive.Portal>
    )
}

export {
    Popover,
    PopoverTrigger,
    PopoverContent,
}
