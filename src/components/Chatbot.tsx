import Input from "./Input.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import Service from "../service.ts";
import styled from "styled-components";
import VideoChat from "./VideoChat.tsx";
import {useAppState} from "../AppStateContext.tsx";
import {useEffect} from "react";
import {ConnectionStatus} from "../types.ts";
import {toast} from "sonner";

type Props = {
    isDesktop: boolean
}


export default function Chatbot({isDesktop}: Props) {
    const {connection} = useAppState()

    const {data, isLoading} = useQuery({
        queryKey: ['get-avatar'],
        queryFn: () => Service.getAvatar(),
        staleTime: Infinity
    })

    const {isPending: isPendingConfig, data: chatbotConfig, isFetched} = useQuery({
        queryKey: ['get-chatbot-config'],
        queryFn: async () => {
            // get config from local storage
            const config = localStorage.getItem('chatbot-config')

            if (!config) {
                const config = await Service.getChatBotConfig()
                localStorage.setItem('chatbot-config', JSON.stringify(config))
                return config
            }

            return JSON.parse(config)
        },
        throwOnError: true,
        staleTime: Infinity
    })

    const {isPending: isRefreshingConfig, mutate: refreshConfig, data: newChatbotConfig} = useMutation({
        mutationKey: ['refresh-config'],
        mutationFn: (sessionId: string) => Service.refreshConfig(sessionId),
        onError: () => {
            toast.error('Error refreshing config')
        }
    })

    // Try refresh if a connection is not ready and config is fetched
    useEffect(() => {
        if (
            connection !== ConnectionStatus.NEW &&
            connection !== ConnectionStatus.CONNECTING &&
            connection !== ConnectionStatus.CONNECTED &&
            isFetched && chatbotConfig?.sessionId) {
            refreshConfig(chatbotConfig?.sessionId)
        }
    }, [chatbotConfig?.sessionId, connection, isFetched, refreshConfig])


    if (isLoading || isPendingConfig || isRefreshingConfig) return (
        <ChatbotLoading>
            <div className="wave-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </ChatbotLoading>
    )

    const config = newChatbotConfig || chatbotConfig;

    return <ChatbotContainer style={{
        width: isDesktop ? 360 : 'fit-content',
    }}>
        {!!data && !!config && (
            <>
                <VideoChat video={data?.data.video} music={data?.data.avatar} configChatbot={config}/>
                <Input configChatbot={config} isDesktop={isDesktop}/>
            </>
        )}
    </ChatbotContainer>
}

const ChatbotContainer = styled.div`
    position: relative;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: var(--shadow-light);
    max-height: 70vh;
    max-width: 100vw;

    @media (max-width: 768px) {
        max-height: 60vw; // for mobile
    }
`

const ChatbotLoading = styled.div`
    background: var(--primary-color);
    padding: 4rem;
    box-shadow: var(--shadow-light);
    border-radius: 1rem;

`

