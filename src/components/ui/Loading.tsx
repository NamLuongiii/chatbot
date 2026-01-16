import styled from "styled-components"
import {motion, type Variants} from "motion/react"

/* ---------------- animations config ---------------- */

const containerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
}

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: "easeOut",
        },
    },
}

/* ---------------- component ---------------- */

export default function Loading() {
    return (
        <LoadingUI
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Spinner */}
            <Spinner/>

            <TextGroup>
                <Text variants={itemVariants}>
                    Creating your session...
                </Text>
                <Text variants={itemVariants}>
                    Connecting to an avatar
                </Text>
            </TextGroup>
        </LoadingUI>
    )
}

/* ---------------- styles ---------------- */

const LoadingUI = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    min-height: 400px;

    background: #9ec0ff;
    background: var(--bg-gradient);
`

const Spinner = styled(motion.div)`
    width: 40px;
    height: 40px;
    border: 4px solid var(--primary-color);
    border-radius: 50%;
    border-top-color: transparent;

    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`

const TextGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`

const Text = styled(motion.div)`
    will-change: transform, opacity;
`
