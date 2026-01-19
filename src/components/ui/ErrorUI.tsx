import {MdErrorOutline} from "react-icons/md"
import {FiRefreshCcw} from "react-icons/fi"
import {motion, type Variants} from "motion/react"
import styled from "styled-components";

/* ---------------- animation variants ---------------- */

const containerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 14,
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

type Props = {
    onTryAgain: () => void
}
export const ErrorUI = ({onTryAgain}: Props) => {
    return (
        <ErrorUIStyled
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Icon error */}
            <ErrorIcon variants={itemVariants}>
                <MdErrorOutline size={32}/>
            </ErrorIcon>

            {/* Error information */}
            <motion.div
                variants={itemVariants}
                style={{display: "flex", flexDirection: "column", gap: "0.25rem"}}
            >
                <div>Cannot create a session right now. Please try later.</div>
                <div>Error creating session</div>
            </motion.div>

            {/* Try again button */}
            <Button
                type="button"
                variants={itemVariants}
                whileTap={{scale: 0.96}}
                whileHover={{scale: 1.02}}
                onClick={onTryAgain}
            >
                <FiRefreshCcw size={20}/>
                <span>Try again</span>
            </Button>

            <motion.div
                variants={itemVariants}
                style={{fontSize: 'var(--text-small)', color: 'var(--text-secondary)'}}
            >
                If the problem persists, please contact support.
            </motion.div>
        </ErrorUIStyled>
    )
}

const ErrorUIStyled = styled(motion.div)`
    padding: 2rem 1rem;
    background-color: var(--error-color-modal-bg);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    text-align: center;
    border-radius: 1rem;
    border: 1px solid var(--border-color);
`

const ErrorIcon = styled(motion.div)`
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: var(--error-color-icon-bg);

    & > * {
        color: var(--error-color-icon)
    }
`

const Button = styled(motion.button)`
    border: none;
    outline: none;
    background: var(--loading-color);
    padding: .5rem 1rem;
    border-radius: .5rem;
    display: flex;
    align-items: center;
    gap: .5rem;
    color: white;
    cursor: pointer;
`