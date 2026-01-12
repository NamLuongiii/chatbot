import Input from "./Input.tsx";
import {useQuery} from "@tanstack/react-query";
import Service from "../service.ts";
import styled from "styled-components";
import VideoChat from "./VideoChat.tsx";

type Props = {
    isDesktop: boolean
}


export default function Chatbot({isDesktop}: Props) {
    const {data, isLoading} = useQuery({
        queryKey: ['get-avatar'],
        queryFn: () => Service.getAvatar(),
        staleTime: Infinity
    })

    const {isPending: isPendingConfig, data: chatbotConfig} = useQuery({
        queryKey: ['get-chatbot-config'],
        queryFn: () => Service.getChatBotConfig(),
        throwOnError: true,
        staleTime: Infinity
    })


    if (isLoading || isPendingConfig) return (
        <div className="wave-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>

    )
    if (!data?.data || !chatbotConfig) return <div>Error</div>;

    return <ChatbotContainer style={{
        width: isDesktop ? '280px' : 'fit-content',
    }}>
        <VideoChat video={data?.data.video} music={data?.data.avatar} configChatbot={chatbotConfig}/>
        <Input configChatbot={chatbotConfig}/>
    </ChatbotContainer>
}

const ChatbotContainer = styled.div`
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-light);
    max-height: 100vh;
    max-width: 100vw;
`


