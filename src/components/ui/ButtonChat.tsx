import styled from "styled-components";
import {type ButtonHTMLAttributes} from "react";
import {TbMessageChatbot} from "react-icons/tb";
import {motion} from "motion/react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export const ButtonChat = (props: Props) => {
    return <ButtonChatStyled type='button' {...props}>
        <motion.div whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} style={{transformOrigin: 'center'}}>
            <TbMessageChatbot size={24}/>
        </motion.div>
    </ButtonChatStyled>
}

const ButtonChatStyled = styled.button`
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1000;

    width: 54px;
    height: 54px;
    display: flex;
    background: cornflowerblue;
    color: white;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    outline: none;

`