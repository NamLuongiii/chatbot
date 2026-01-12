import type {Avatar, ResponseConfigChatBotType} from "../types.ts";
import {type CSSProperties, useCallback, useEffect, useRef, useState} from "react";
import {Role, SignalingClient} from "amazon-kinesis-video-streams-webrtc";
import KinesisVideo from "aws-sdk/clients/kinesisvideo";
import KinesisVideoSignalingChannels from "aws-sdk/clients/kinesisvideosignalingchannels";

type Props = {
    configChatbot: ResponseConfigChatBotType
    video: Avatar['video'],
    music: Avatar['avatar']
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
enum ConnectionState {
    NEW = "new",
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    CLOSED = "closed",
    FAILED = "failed",
}

export default function VideoChat({configChatbot, video, music}: Props) {
    const remoteViewRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const signalingClientRef = useRef<SignalingClient | null>(null);
    // const isInitializedRef = useRef<boolean>(false);
    const isSignalingReadyRef = useRef<boolean>(false);
    const retryCountRef = useRef<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted,] = useState<boolean>(true);

    const [videoStyles, setVideoStyles] = useState<CSSProperties>({});
    const defaultVideoRef = useRef<HTMLVideoElement | null>(null);
    const [videoReady, setVideoReady] = useState<boolean>(false);
    const [streamVideoHasData, setStreamVideoHasData] = useState<boolean>(false);
    const [, setConnectionState] = useState<ConnectionState>(ConnectionState.NEW);

    const cleanupConnection = () => {
        // Close and clean up peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.onconnectionstatechange = null;

            // Close all transceivers
            const transceivers = peerConnectionRef.current.getTransceivers();
            // biome-ignore lint/complexity/noForEach: <explanation>
            transceivers.forEach((transceiver) => {
                if (transceiver.stop) {
                    try {
                        transceiver.stop();
                    } catch (error) {
                        console.error("Error stopping transceiver:", error);
                    }
                }
            });

            // Close the peer connection
            try {
                peerConnectionRef.current.close();
            } catch (error) {
                console.error("Error closing peer connection:", error);
            }
            peerConnectionRef.current = null;
        }

        // Close signaling a client
        if (signalingClientRef.current) {
            try {
                signalingClientRef.current.close();
            } catch (error) {
                console.error("Error closing signaling client:", error);
            }
            signalingClientRef.current = null;
        }

        // Reset video streams
        if (remoteViewRef.current?.srcObject) {
            const mediaStream = remoteViewRef.current.srcObject as MediaStream;
            const tracks = mediaStream.getTracks();
            // biome-ignore lint/complexity/noForEach: <explanation>
            tracks.forEach((track) => {
                track.stop();
            });
            remoteViewRef.current.srcObject = null;
        }

        // Reset state
        setStreamVideoHasData(false);
        isSignalingReadyRef.current = false;
    };

    const startViewer = useCallback(async () => {
        if (!configChatbot) return;

        try {
            const clientId = `viewer-${Math.floor(Math.random() * 1000000)}`;

            const region = configChatbot.credentials.AWS_DEFAULT_REGION;
            const accessKeyId = configChatbot.credentials.AWS_ACCESS_KEY_ID;
            const secretAccessKey = configChatbot.credentials.AWS_SECRET_ACCESS_KEY;
            const sessionToken = configChatbot.credentials.AWS_SESSION_TOKEN;
            const channelARN = configChatbot.channelARN;

            // 1. Initialize Kinesis Video Client
            const kinesisVideoClient = new KinesisVideo({
                region,
                accessKeyId,
                secretAccessKey,
                sessionToken,
                correctClockSkew: true,
            });

            // 2. Get signaling channel endpoint
            const getSignalingChannelEndpointResponse = await kinesisVideoClient
                .getSignalingChannelEndpoint({
                    ChannelARN: channelARN,
                    SingleMasterChannelEndpointConfiguration: {
                        Protocols: ["WSS", "HTTPS"],
                        Role: Role.VIEWER,
                    },
                })
                .promise();

            if (
                !getSignalingChannelEndpointResponse.ResourceEndpointList ||
                getSignalingChannelEndpointResponse.ResourceEndpointList.length === 0
            )
                throw new Error("No resource endpoints returned");

            const endpointsByProtocol =
                getSignalingChannelEndpointResponse.ResourceEndpointList.reduce(
                    (endpoints, endpoint) => {
                        if (endpoint.Protocol && endpoint.ResourceEndpoint) {
                            endpoints[endpoint.Protocol] = endpoint.ResourceEndpoint;
                        }
                        return endpoints;
                    },
                    {} as Record<string, string>
                );

            if (!endpointsByProtocol.WSS || !endpointsByProtocol.HTTPS)
                throw new Error("Missing required endpoints: WSS or HTTPS");

            // 3. Get ICE server configuration
            const kinesisVideoSignalingChannelsClient =
                new KinesisVideoSignalingChannels({
                    region,
                    endpoint: endpointsByProtocol.HTTPS,
                    credentials: {accessKeyId, secretAccessKey, sessionToken},
                    correctClockSkew: true,
                });

            const getIceServerConfigResponse =
                await kinesisVideoSignalingChannelsClient
                    .getIceServerConfig({
                        ChannelARN: channelARN,
                    })
                    .promise();

            const iceServers: RTCIceServer[] = [
                {urls: `stun:stun.kinesisvideo.${region}.amazonaws.com:443`},
            ];

            if (
                getIceServerConfigResponse.IceServerList &&
                getIceServerConfigResponse.IceServerList.length > 0
            ) {
                for (const iceServer of getIceServerConfigResponse.IceServerList) {
                    if (iceServer.Uris) {
                        // Handle Uris format for RTCIceServer
                        iceServers.push({
                            urls: iceServer.Uris,
                            username: iceServer.Username || "",
                            credential: iceServer.Password || "",
                        });
                    }
                }
            }

            // 4. Create Peer Connection with the proper configuration
            peerConnectionRef.current = new RTCPeerConnection({iceServers});
            if (!peerConnectionRef.current)
                throw new Error("Cannot create RTCPeerConnection");

            // Tạo một track audio trống
            const mediaStream = new MediaStream();
            const audioContext = new AudioContext();
            const destination = audioContext.createMediaStreamDestination();

            const dummyAudioTrack = destination.stream.getAudioTracks()[0];
            if (dummyAudioTrack) {
                peerConnectionRef.current.addTrack(dummyAudioTrack, mediaStream);
            }
            // Tạo một track audio trống

            // Tạo một track video trống
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            const stream = canvas.captureStream(10);
            const dummyVideoTrack = stream.getVideoTracks()[0];
            if (dummyVideoTrack) {
                peerConnectionRef.current.addTrack(dummyVideoTrack, mediaStream);
            }
            // Tạo một track video trống

            peerConnectionRef.current.onicecandidate = ({candidate}) => {
                if (candidate) {
                    signalingClientRef.current?.sendIceCandidate(candidate);
                }

                // Track handling for incoming streams
            };

            peerConnectionRef.current.onconnectionstatechange = () => {
                const state = peerConnectionRef.current
                    ?.connectionState as ConnectionState;
                setConnectionState(state);
                switch (state) {
                    case ConnectionState.NEW:
                    case ConnectionState.CONNECTING:
                        console.info("connecting");
                        break;
                    case ConnectionState.CONNECTED:
                        console.info("connected");
                        break;
                    case ConnectionState.DISCONNECTED:
                    case ConnectionState.CLOSED:
                    case ConnectionState.FAILED:
                        console.info("disconnected");
                        break;
                    default:
                        break;
                }
            };

            peerConnectionRef.current.ontrack = (event) => {
                if (event.track.kind === "video") {
                    if (!remoteViewRef.current)
                        throw new Error("Remote View is not ready");

                    // Immediately capture the exact dimensions, position, and other styling of default video
                    if (defaultVideoRef.current) {
                        try {
                            const defaultVideoElement = defaultVideoRef.current;
                            const rect = defaultVideoElement.getBoundingClientRect();
                            const computedStyle =
                                window.getComputedStyle(defaultVideoElement);

                            // Capture all relevant styling properties to ensure a perfect visual match
                            setVideoStyles({
                                width: `${rect.width}px`,
                                height: `${rect.height}px`,
                                objectFit: computedStyle.objectFit as
                                    | "cover"
                                    | "contain"
                                    | "fill",
                                objectPosition: computedStyle.objectPosition,
                                borderRadius: computedStyle.borderRadius,
                                transform: computedStyle.transform,
                            });

                            // Also set the same sizing to ensure consistency during the transition
                            if (remoteViewRef.current) {
                                Object.assign(remoteViewRef.current.style, {
                                    width: `${rect.width}px`,
                                    height: `${rect.height}px`,
                                    objectFit: computedStyle.objectFit,
                                    objectPosition: computedStyle.objectPosition,
                                    borderRadius: computedStyle.borderRadius,
                                    transform: computedStyle.transform,
                                });
                            }
                        } catch (error) {
                            console.error("Error capturing video styles:", error);
                        }
                    }

                    // Set up stream and event listeners for the remote video
                    remoteViewRef.current.srcObject = event.streams[0];
                    remoteViewRef.current.onloadedmetadata = () => {
                        if (remoteViewRef.current) {
                            remoteViewRef.current
                                .play()
                                .then(() => {
                                    setStreamVideoHasData(true);
                                })
                                .catch((error) => {
                                    console.error("Error playing stream video:", error);
                                });
                        }
                    };

                    remoteViewRef.current.oncanplay = () => {
                        // Wait until the stream has enough data, then switch when ready
                        // This creates the most seamless experience
                    };
                }
            };

            // 5. Initialize Signaling Client
            signalingClientRef.current = new SignalingClient({
                channelARN,
                channelEndpoint: endpointsByProtocol.WSS,
                clientId,
                role: Role.VIEWER,
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                    sessionToken,
                },
                systemClockOffset: kinesisVideoClient.config.systemClockOffset,
            });
            if (!signalingClientRef.current)
                throw new Error("Cannot create SignalingClient");

            signalingClientRef.current.open();

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signalingClientRef.current.on("open", async () => {
                retryCountRef.current = 0;
                isSignalingReadyRef.current = true;

                if (!signalingClientRef.current || !peerConnectionRef.current)
                    throw new Error("Signal and Peer are not ready");

                const offer = await peerConnectionRef.current.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });
                await peerConnectionRef.current.setLocalDescription(offer);
                if (peerConnectionRef.current.localDescription) {
                    signalingClientRef.current.sendSdpOffer(
                        peerConnectionRef.current.localDescription
                    );
                }
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signalingClientRef.current.on("sdpAnswer", async (answer: never) => {
                try {
                    if (!peerConnectionRef.current)
                        throw new Error("Peer Connection is not ready");

                    await peerConnectionRef.current.setRemoteDescription(answer);
                } catch (err) {
                    console.error("Error handling sdpAnswer:", err);
                }
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signalingClientRef.current.on("iceCandidate", (candidate: never) => {
                if (!peerConnectionRef.current)
                    throw new Error("Peer Connection is not ready");

                peerConnectionRef.current
                    .addIceCandidate(candidate)
                    .catch((err) =>
                        console.error("Error adding received ICE candidate:", err)
                    );
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            signalingClientRef.current.on("close", () => {
            });
        } catch (error) {
            const err = error as Error;
            console.error("Viewer init error:", err);
        }
    }, [configChatbot])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!configChatbot) return;

        startViewer().then();

        // Cleanup when a component unmounts
        return () => {
            cleanupConnection();
        };
    }, [configChatbot, startViewer]);

    // Combine isVideoReady (connection ready) and streamVideoHasData (video has data) to ensure a perfect transition
    const showStreamVideo = streamVideoHasData;

    useEffect(() => {
        // Add a video frame extraction when the default video is playing
        // This lets us extract the exact frame and appearance to match in the stream video
        if (defaultVideoRef.current && !videoReady) {
            defaultVideoRef.current.addEventListener("playing", () => {
                setVideoReady(true);
            });
        }
    }, [videoReady]);

    useEffect(() => {
        if (music?.musicAvatar.url && audioRef.current) {
            audioRef.current.volume = music.music_volume / 100;
            if (!muted) {
                const playAudio = async () => {
                    try {
                        await audioRef.current!.play();
                    } catch (err) {
                        console.warn("Audio autoplay bị chặn, cần user interaction:", err);
                    }
                };
                playAudio().then();
            } else {
                audioRef.current.pause();
            }
        }
    }, [music?.musicAvatar.url, muted, music?.music_volume]);


    return <div>
        {music?.musicAvatar.url && (
            <audio
                ref={audioRef}
                src={music?.musicAvatar.url}
                loop
                autoPlay
                muted={false}
                style={{display: "none"}}
            />
        )}
        <video
            ref={defaultVideoRef}
            src={video.video_url}
            poster={video.image_url}
            controls={false}
            autoPlay
            loop
            playsInline
            style={{
                display: showStreamVideo ? "none" : "block",
                maxWidth: "100%",
            }}
        />

        <video
            ref={remoteViewRef}
            style={{
                ...videoStyles,
                display: showStreamVideo ? "block" : "none",
                maxWidth: "100%",
            }}
            poster={video.image_url}
            controls={false}
            autoPlay
            loop
            playsInline
        />
    </div>
}