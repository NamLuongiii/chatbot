import styled from "styled-components";
import {useRef, useState} from "react";
import soundclick from '../assets/select-sound.wav'
import {useMutation} from "@tanstack/react-query";
import Service from "../service.ts";
import {type ChatBotTextRequest, ConnectionStatus, type ResponseConfigChatBotType} from "../types.ts";
import {MdClose, MdMic, MdMicOff, MdSend, MdStop} from "react-icons/md";
import {toast} from "sonner";
import {useAppState} from "../AppStateContext.tsx";

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
    const {isVideoReady, connection} = useAppState()

    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);


    const {mutate: sendMessage, isPending} = useMutation({
        mutationKey: ['send-message'],
        mutationFn: (payload: ChatBotTextRequest) => Service.sendTextMessage(payload),
        onError: err => toast.error(err.message)
    })

    const {mutateAsync: convertAudio, isPending: isConvertingAudio} = useMutation({
        mutationKey: ['convert-audio'],
        mutationFn: (payload: { session_id: string, audio: Blob }) => Service.convertAudioToText(payload),
        onError: err => toast.error(err.message)
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

                convertAudio({
                    session_id: configChatbot?.sessionId,
                    audio: audioBlob,
                }).then(message => {
                    handleSend(message)
                })
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

    const cancelRecording = () => {
        setIsRecording(false)
    }

    const isDisabled = !isVideoReady || connection !== ConnectionStatus.CONNECTED;

    if (isPending || isConvertingAudio) return <ThinkingUi>Thinking...</ThinkingUi>;

    return <Container>
        {isRecording && <RecordingContainer>
            <div>🎙 Recording</div>
            {/*stop and send audio */}
            <ButtonRecording type='button' onClick={handleStopRecording} className={isRecording ? 'animate' : ''}>
                <MdStop size={26}/>
            </ButtonRecording>

            {/*cancel recording */}
            <BtnCancelRecording type='button' onClick={cancelRecording}>
                <MdClose size={16}/>
            </BtnCancelRecording>
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
                        disabled={isDisabled}
                    />
                    <ButtonRecord typeof='button' onClick={handleButton} disabled={isDisabled}>
                        {value ? (
                            <MdSend color='cornflowerblue'/>
                        ) : (
                            !micAvailable ? <MdMicOff size={16}/> : <MdMic size={16}/>
                        )}
                    </ButtonRecord>
                </InputContainer>) : (

                <ButtonRecord typeof='button' onClick={handleButton}
                              disabled={isDisabled}
                              style={{width: 56, height: 56, margin: '2rem', marginLeft: 'auto', marginRight: 'auto'}}>
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
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;

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
    border-radius: 50%;
    position: relative;
    border: none;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    padding: 0.5rem;
    color: white;
    background-color: cornflowerblue;

    &::before,
    &::after {
        content: "";
        position: absolute;
        inset: -12px;
        border-radius: 50%;
        border: 4px solid #8fb3ff80;
        opacity: 0;
        transform: scale(0.8);
    }

    &.animate::before,
    &.animate::after {
        animation: ripple 2s infinite;
        opacity: 1;
    }

    &.animate::after {
        animation-delay: 0.8s;
    }

    @keyframes ripple {
        0% {
            transform: scale(0.8);
            opacity: 1;
        }
        100% {
            transform: scale(1);
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

const BtnCancelRecording = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
    background-color: transparent;
    border: none;
    outline: none;
`