import type {ApiResponse, Avatar, ChatBotTextRequest, ResponseConfigChatBotType, SpeechToTextRequest} from "./types.ts";

class Service {
    VITE_API_URL: string;
    DH_ID: number;

    constructor() {
        this.VITE_API_URL = import.meta.env.VITE_API_URL;
        this.DH_ID = 181
    }

    async getChatBotConfig(): Promise<ResponseConfigChatBotType> {
        const response = await fetch(
            `${this.VITE_API_URL}/chat-internal`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    digital_human_id: this.DH_ID,
                }),
            }
        );
        const json = await response.json();
        if (response.ok) {
            return json.response
        } else {
            console.error('json', json);
            throw new Error(json.message || response.statusText);
        }
    }

    async getAvatar(): Promise<ApiResponse<Avatar>> {
        const response = await fetch(`${this.VITE_API_URL}/chat/public/dighital-human/${this.DH_ID}`);
        const json = await response.json();
        if (response.ok) {
            return json;
        } else {
            throw new Error(json.message || response.statusText);
        }
    }

    async sendTextMessage(payload: ChatBotTextRequest) {
        const response = await fetch(`${this.VITE_API_URL}/chat-internal/${payload.session_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                digital_human_id: this.DH_ID,
                type: "TEXT",
                message: payload.message,
            }),
        })

        const json = await response.json();
        if (response.ok) {
            return json;
        } else {
            throw new Error(json.message || response.statusText);
        }
    }

    async refreshConfig(sessionId: string): Promise<ResponseConfigChatBotType> {
        const response = await fetch(`${this.VITE_API_URL}/chat-internal/session-refresh/${sessionId}`, {
            method: 'GET',
        })

        const json = await response.json();
        if (response.ok) {
            return json;
        } else {
            throw new Error(json.message || response.statusText);
        }
    }

    async convertAudioToText(payload: SpeechToTextRequest): Promise<string> {
        const fd = new FormData();
        fd.append('audio', payload.audio);
        fd.append('digital_human_id', this.DH_ID.toString());

        const response = await fetch(`${this.VITE_API_URL}/chat/${payload.session_id}/speech-to-text`, {
            method: 'POST',
            body: fd,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        const json = await response.json();
        if (response.ok) {
            return json.data.text;
        } else {
            throw new Error(json.message || response.statusText);
        }
    }
}

export default new Service();