import stop from '../assets/stop.svg'
import styled from "styled-components";
import {useRef, useState} from "react";
import soundclick from '../assets/select-sound.wav'
import {useMutation} from "@tanstack/react-query";
import Service from "../service.ts";
import {type ChatBotTextRequest, type ResponseConfigChatBotType} from "../types.ts";
import {MdMic, MdMicOff, MdSend} from "react-icons/md";
import {toast} from "sonner";

type Props = {
    configChatbot: ResponseConfigChatBotType
    isDesktop: boolean
}

export default function Input({configChatbot, isDesktop}: Props) {
    const [isRecording, setIsRecording] = useState(false)
    const [micAvailable, setMicAvailable] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState('')
    const [showInput, setShowInput] = useState(isDesktop)
    // const {isVideoReady, connection} = useAppState()

    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    const {mutate: sendMessage, isPending} = useMutation({
        mutationKey: ['send-message'],
        mutationFn: (payload: ChatBotTextRequest) => Service.sendTextMessage(payload)
    })

    const playSound = () => {
        const audio = new Audio(soundclick);
        audio.volume = 0.2;
        audio.play().catch(console.error);
    }

    const handleStartRecording = async () => {
        // play sound
        playSound();

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(streamRef.current);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.start();

            setIsRecording(true);
        } catch (error) {
            toast.error("Error accessing microphone!");
            console.error("Error accessing microphone:", error);
            setShowInput(true)
            setMicAvailable(false)
        }
    }

    const handleStopRecording = async () => {
        setIsRecording(false)

        playSound()

        const mediaRecordedCurrent = mediaRecorderRef.current;
        const streamRefCurrent = streamRef.current;
        const audioChunksRefCurrent = audioChunksRef.current;
        if (streamRefCurrent && mediaRecordedCurrent && audioChunksRefCurrent) {
            mediaRecordedCurrent.stop();
            for (const track of streamRefCurrent.getTracks()) {
                track.stop();
            }
            setIsRecording(false);

            mediaRecordedCurrent.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });

                toast.message(audioBlob.size.toString())
                
                const message = await Service.convertAudioToText({
                    session_id: configChatbot?.sessionId,
                    audio: audioBlob,
                });


                handleSend(message)
            };
        }
    }

    const handleSend = (value: string) => {
        const message = value.trim()
        if (!message) return;
        setValue('')
        sendMessage({
            session_id: configChatbot.sessionId,
            message,
        })
    }

    const handleButton = () => {
        if (value) {
            handleSend(value)
        } else {
            handleStartRecording().then()
        }
    }

    // if (!isVideoReady || connection !== ConnectionStatus.CONNECTED) return null;

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
                            handleSend(value);
                        }
                    }}
                        disabled={isPending}
                    />
                    <ButtonRecord typeof='button' onClick={handleButton}>
                        {value ? (
                            <MdSend color='cornflowerblue'/>
                        ) : (
                            !micAvailable ? <MdMicOff size={16}/> : <MdMic size={16}/>
                        )}
                    </ButtonRecord>
                </InputContainer>) : (

                <ButtonRecord typeof='button' onClick={handleButton}
                              style={{width: 56, height: 56, margin: '1rem', marginLeft: 'auto', marginRight: 'auto'}}>
                    {!micAvailable ? <MdMicOff size={24}/> : <MdMic size={24}/>}
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
    margin-top: 2rem;

    background: linear-gradient(
            to top,
            rgba(30, 41, 59, 0.9),
            rgba(30, 41, 59, 0.8),
            rgba(30, 41, 59, 0)
    );
`

const InputContainer = styled.div`
    padding: 4px 16px;
    border-radius: 8px;

    display: flex;
    justify-content: center;
    align-items: center;
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
        word-spacing: 1px;

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
        outline: 2px solid cornflowerblue;
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

