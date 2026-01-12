import type {ApiResponse, Avatar, ChatBotTextRequest, ResponseConfigChatBotType} from "./types.ts";

class Service {
    VITE_API_URL: string;
    DH_ID: number;

    constructor() {
        this.VITE_API_URL = import.meta.env.VITE_API_URL;
        this.DH_ID = 181
    }

    async getChatBotConfig(): Promise<ResponseConfigChatBotType> {
        console.log('getChatBotConfig')
        const response = await fetch(
            `${this.VITE_API_URL}/chat`,
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
            console.log('json', json);
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
        const response = await fetch(`${this.VITE_API_URL}/chat/${payload.session_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                digital_human_id: payload.digital_human_id,
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
}

export default new Service();