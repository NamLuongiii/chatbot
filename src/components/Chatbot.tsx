import Input from "./Input.tsx";
import {useQuery} from "@tanstack/react-query";
import Service from "../service.ts";
import styled from "styled-components";
import VideoChat from "./VideoChat.tsx";
import Loading from "./ui/Loading.tsx";
import {ErrorUI} from "./ui/ErrorUI.tsx";

type Props = {
    isDesktop: boolean
    onClose: () => void
}


export default function Chatbot({isDesktop, onClose}: Props) {
    // const {connection} = useAppState()

    const {data, isLoading, error} = useQuery({
        queryKey: ['get-avatar'],
        queryFn: () => Service.getAvatar(),
        staleTime: Infinity
    })

    const {isPending: isPendingConfig, data: chatbotConfig, error: configError} = useQuery({
        queryKey: ['get-chatbot-config'],
        queryFn: async () => {
            // get config from local storage
            const config = localStorage.getItem('chatbot-config')

            if (!config) {
                const config = await Service.getChatBotConfig()
                localStorage.setItem('chatbot-config', JSON.stringify(config))
                return config
            }

            // try to refresh config
            // const oldConfig = JSON.parse(config)
            // return await Service.refreshConfig(oldConfig.sessionId)
            return JSON.parse(config)
        },
    })

    // const {mutate: refreshConfig, data: newChatbotConfig} = useMutation({
    //     mutationKey: ['refresh-config'],
    //     mutationFn: (sessionId: string) => Service.refreshConfig(sessionId),
    //     onError: () => {
    //         toast.error('Error refreshing config')
    //     }
    // })

    // Try refresh if a connection is not ready and config is fetched
    // useEffect(() => {
    //     if (
    //         connection !== ConnectionStatus.NEW &&
    //         connection !== ConnectionStatus.CONNECTING &&
    //         connection !== ConnectionStatus.CONNECTED &&
    //         isFetched && chatbotConfig?.sessionId) {
    //         refreshConfig(chatbotConfig?.sessionId)
    //     }
    // }, [chatbotConfig?.sessionId, connection, isFetched, refreshConfig])

    // End session
    // useEffect(() => {
    //     return () => {
    //         if (!chatbotConfig?.sessionId) return;
    //         console.log('Ending session')
    //         Service.stopSession(chatbotConfig?.sessionId).catch(() => {
    //             console.error('Error stopping session')
    //             toast.error('Error stopping session')
    //         })
    //     }
    // }, [chatbotConfig?.sessionId])

    if (isLoading || isPendingConfig) return (
        <Loading/>
    )

    if (error || configError) return (<ErrorUI onTryAgain={onClose}/>)

    const config = chatbotConfig;

    return <ChatbotContainer>
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
`
