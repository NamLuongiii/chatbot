import mic from '../assets/mic.svg'
import stop from '../assets/stop.svg'
import styled from "styled-components";
import {useRef, useState} from "react";
import micOff from '../assets/mic_off.svg'
import soundclick from '../assets/select-sound.wav'
import {toast} from "sonner";
import {useMutation} from "@tanstack/react-query";
import Service from "../service.ts";
import type {ChatBotTextRequest, ResponseConfigChatBotType} from "../types.ts";
import {useAppState} from "../AppStateContext.tsx";

let recorder: {
    stop: () => Promise<{
        blob: Blob,
        url: string,
        type: string,
    }>
};

type Props = {
    configChatbot: ResponseConfigChatBotType
    isDesktop: boolean
}

export default function Input({configChatbot}: Props) {
    const [isRecording, setIsRecording] = useState(false)
    const [micAvailable, setMicAvailable] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')
    const [showInput, setShowInput] = useState(true)
    const {isVideoReady} = useAppState()

    const {mutate: sendMessage, isPending} = useMutation({
        mutationKey: ['send-message'],
        mutationFn: (payload: ChatBotTextRequest) => Service.sendTextMessage(payload)
    })

    const playSound = () => {
        const audio = new Audio(soundclick);
        audio.volume = 0.2;
        audio.play().catch(console.error);
    }

    const handleMicClick = async () => {
        // play sound
        playSound();

        try {
            recorder = await recordAudio();
            setMicAvailable(true)
        } catch (error) {
            console.error('Error accessing microphone!', error);
            toast.error('Error accessing microphone!');
            setMicAvailable(false)

            // show input if mic unavailable
            setShowInput(true)
            return;
        }

        setIsRecording(!isRecording)
    }

    const handleStopRecording = async () => {
        setIsRecording(false)

        playSound()

        if (!recorder) return;

        const audio = await recorder.stop()

        try {
            const text = await Service.convertAudioToText({
                audio: audio.blob,
                session_id: configChatbot.sessionId,
            })

            sendMessage({
                session_id: configChatbot.sessionId,
                message: text,
            })
        } catch (error) {
            console.error('Error converting audio to text:', error)
            toast.error('Error converting audio to text')
        }
    }

    const handleSend = () => {
        if (!value) return;
        setValue('')
        sendMessage({
            session_id: configChatbot.sessionId,
            message: value,
        })
    }

    if (!isVideoReady) return null;

    if (isPending) return <ThinkingUi>Thinking...</ThinkingUi>;

    return <Container>
        {isRecording && <RecordingContainer>
            <p>🎙 Recording</p>
            <ButtonRecording type='button' onClick={handleStopRecording}>
                <img src={stop} alt="Mic icon"/>
            </ButtonRecording>
        </RecordingContainer>}

        {!isRecording && (
            showInput ? (
                <InputContainer>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type here..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSend();
                        }
                    }}
                        disabled={isPending}
                    />
                    <ButtonRecord typeof='button' onClick={handleMicClick}>
                        <img src={micAvailable ? mic : micOff} alt="Mic icon"/>
                    </ButtonRecord>
                </InputContainer>) : (
                <ButtonRecord typeof='button' onClick={handleMicClick} style={{width: 56, height: 56,}}>
                    <img src={micAvailable ? mic : micOff} alt="Mic icon"/>
                </ButtonRecord>
            )
        )}
    </Container>
}


const Container = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    background: linear-gradient(
            to top,
            rgba(30, 41, 59, 0.6),
            rgba(30, 41, 59, 0.25),
            rgba(30, 41, 59, 0)
    );
`

const InputContainer = styled.div`
    padding: 4px 16px;
    border-radius: 8px;

    display: flex;
    justify-content: center;
    gap: .5rem;
    margin: 1rem;

    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);

    input {
        background: transparent;
        border: none;
        outline: none;
        padding: .5rem;
        flex: 1;
        //color: black;
        color: white;
        font-size: 14px;

        &::placeholder {
            color: rgba(145, 158, 171, 1);
        }
    }
`

const RecordingContainer = styled.div`
    background: var(--primary-color);
    padding: 1rem;
    text-align: center;
`

const ButtonRecord = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    outline: none;
    width: 32px;
    height: 32px;

    &:hover {
        box-shadow: var(--shadow-dark);
    }
`

const ButtonRecording = styled.button`
    aspect-ratio: 1/1;
    border-radius: 50%;
    position: relative;
    border: none;
    cursor: pointer;
    display: inline-flex;
    place-items: center;
    padding: .5rem;

    &::before, &::after {
        content: "";
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border: 2px solid #ddd;
        animation: ripple 1.6s infinite;
    }

    &::after {
        animation-delay: 0.8s;
    }

    @keyframes ripple {
        0% {
            transform: scale(0.7);
            opacity: 1;
        }
        100% {
            transform: scale(1.3);
            opacity: 0;
        }
    }
`

const ThinkingUi = styled.div`
    position: absolute;
    color: white;
    left: 0;
    right: 0;
    bottom: 1rem;
    text-align: center;
`

async function recordAudio() {
    // Ask query mic
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});

    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: BlobPart[] | undefined = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.start();

    return {
        stop: () =>
            new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    // Stop mic
                    stream.getTracks().forEach(track => track.stop());

                    const audioBlob = new Blob(audioChunks, {
                        type: mediaRecorder.mimeType,
                    });

                    resolve({
                        blob: audioBlob,
                        url: URL.createObjectURL(audioBlob),
                        type: audioBlob.type,
                    });
                };

                mediaRecorder.stop();
            }),
    } as never;
}
