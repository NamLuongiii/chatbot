import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import styled, {keyframes} from "styled-components"

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

/* ---------------- styles ---------------- */

const Content = styled(PopoverPrimitive.Content)`
    z-index: 50;
    background: #fff;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    place-items: center;

    box-shadow: var(--shadow-light);
    outline: none;

    &[data-state="open"] {
        animation: ${slideUp} 0.16s ease-out;
    }

    &[data-state="closed"] {
        animation: ${slideDown} 0.12s ease-in;
    }
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
                            ...props
                        }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal>
            <Content
                side={side}
                align={align}
                sideOffset={sideOffset}
                {...props}
            />
        </PopoverPrimitive.Portal>
    )
}

export {
    Popover,
    PopoverTrigger,
    PopoverContent,
}
