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

let recorder: { stop: () => Promise<unknown> };

type Props = {
    configChatbot: ResponseConfigChatBotType
}

export default function Input({configChatbot}: Props) {
    const [isRecording, setIsRecording] = useState(false)
    const [micAvailable, setMicAvailable] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')

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
            recorder = await recordAudio()
            setMicAvailable(true)
        } catch (error) {
            console.error('Error accessing microphone!', error);
            toast.error('Error accessing microphone!');
            setMicAvailable(false)

            // show input
            if (inputRef.current) {
                inputRef.current.style.display = 'block'
            }
            return;
        }

        setIsRecording(!isRecording)
    }

    const handleStopRecording = async () => {
        setIsRecording(false)

        playSound()

        if (!recorder) return;

        const audio = await recorder.stop()
        console.log(audio)
    }

    const handleSend = () => {
        if (!value) return;
        setValue('')
        sendMessage({
            session_id: configChatbot.sessionId,
            digital_human_id: String(Service.DH_ID),
            message: value,
        })
    }

    return <Container>
        {isRecording && <RecordingContainer>
            <p>🎙 Recording</p>
            <ButtonRecording type='button' onClick={handleStopRecording}>
                <img src={stop} alt="Mic icon"/>
            </ButtonRecording>
        </RecordingContainer>}

        {!isRecording && (
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
            </InputContainer>
        )}
    </Container>
}


const Container = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
`

const InputContainer = styled.div`
    padding: .2rem;
    backdrop-filter: blur(20px);
    margin: 1rem auto;
    width: fit-content;

    display: flex;
    justify-content: center;
    gap: .5rem;

    input {
        background: transparent;
        color: white;
        border: none;
        outline: none;
        padding: .5rem;

        &::placeholder {
            color: #fff;
        }

        &:focus {
            outline: solid;
        }

    }

    @media (max-width: 768px) {
        input {
            display: none;
        }
    }

`

const RecordingContainer = styled.div`
    background: var(--primary-color);
    padding: 1rem;
    text-align: center;
`

const ButtonRecord = styled.button`
    aspect-ratio: 1/1;
    display: inline-flex;
    place-items: center;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: 1px solid #ccc;

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
    };
}
