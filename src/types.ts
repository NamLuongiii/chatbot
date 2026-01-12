export type ApiResponse<T> = {
    data: T
    message: string
    statusCode: number
}

export type Avatar = {
    avatar: {
        device_display: string;
        name: string;
        musicAvatar: {
            id: number;
            name: string;
            url: string;
        },
        music_volume: number
    },
    video: {
        image_url: string
        video_url: string
    },
    welcome_message: string
    welcome_video_url: string
}

export interface ResponseConfigChatBotType {
    message: string
    credentials: {
        AWS_ACCESS_KEY_ID: string
        AWS_SECRET_ACCESS_KEY: string
        AWS_SESSION_TOKEN: string
        AWS_DEFAULT_REGION: string
    }
    channelName: string
    channelARN: string
    sessionId: string
    device_display: string
}

export interface ChatBotTextRequest {
    session_id: string | undefined;
    digital_human_id: string;
    message: string;
}