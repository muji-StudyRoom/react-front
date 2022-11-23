import Input from '../components/Input';
import ChattingList from "../components/ChattingList";
import React, { useState, useEffect, createContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import "../css/Meetingpage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';

export const DataContext = createContext();

var myVideo;
var audioMuted = false;
var videoMuted = false;

var myID;
var _peer_list = {};

var display_name

var PC_CONFIG = {
    iceServers: [
        {
            urls: ['stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        },
    ]
};
// ===============[webrtc]=================
function sendViaServer(data) {
    socket.emit("data", data);
}
function log_error(e) { console.log("[ERROR] ", e); }

function handleNegotiationNeededEvent(peer_id) {
    console.log("handleNegotiationNeededEvent Start")
    _peer_list[peer_id].createOffer()
        .then((offer) => { return _peer_list[peer_id].setLocalDescription(offer); })
        .then(() => {
            console.log(`sending offer to <${peer_id}> ...`);
            sendViaServer({
                "sender_id": myID,
                "target_id": peer_id,
                "type": "offer",
                "sdp": _peer_list[peer_id].localDescription
            });
        })
        .catch(log_error);
}

function handleTrackEvent(event, peer_id) {
    console.log(`track event recieved from <${peer_id}>`);

    if (event.streams) {
        getVideoObj(peer_id).srcObject = event.streams[0];
    }
}

function handleICECandidateEvent(event, peer_id) {
    console.log("handleICECandidateEvent If out")
    if (event.candidate) {
        console.log("handleICECandidateEvent If in")
        sendViaServer({
            "sender_id": myID,
            "target_id": peer_id,
            "type": "new-ice-candidate",
            "candidate": event.candidate
        });
    }
}

function createPeerConnection(peer_id) {
    _peer_list[peer_id] = new RTCPeerConnection(PC_CONFIG);

    _peer_list[peer_id].onicecandidate = (event) => { handleICECandidateEvent(event, peer_id) };
    _peer_list[peer_id].ontrack = (event) => { handleTrackEvent(event, peer_id) };
    _peer_list[peer_id].onnegotiationneeded = () => { handleNegotiationNeededEvent(peer_id) };
}

async function invite(peer_id) {
    if (_peer_list[peer_id]) {
        console.log("[Not supposed to happen!] Attempting to start a connection that already exists!")
    }
    else if (peer_id === myID) {
        console.log("[Not supposed to happen!] Trying to connect to self!");
    }
    else {
        console.log(`Creating peer connection for <${peer_id}> ...`);
        createPeerConnection(peer_id);
        await sleep(1000);  // 기존 2000
        let local_stream = myVideo.srcObject;
        local_stream.getTracks().forEach((track) => {
            _peer_list[peer_id].addTrack(track, local_stream);
        });
        console.log("addTrack after : ", _peer_list)

    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function start_webrtc() {
    // send offer to all other members
    for (let peer_id in _peer_list) {
        invite(peer_id);
    }
}

function closeConnection(peer_id) {
    console.log(_peer_list)
    if (peer_id in _peer_list) {
        _peer_list[peer_id].onicecandidate = null;
        _peer_list[peer_id].ontrack = null;
        _peer_list[peer_id].onnegotiationneeded = null;

        delete _peer_list[peer_id]; // remove user from user list
    }
}

// ===============[Send Data]==============
socket.on("data", (msg) => {
    switch (msg["type"]) {
        case "offer":
            handleOfferMsg(msg);
            break;
        case "answer":
            handleAnswerMsg(msg);
            break;
        case "new-ice-candidate":
            handleNewICECandidateMsg(msg);
            break;
    }
});

function handleOfferMsg(msg) {
    let peer_id = msg['sender_id'];

    console.log(`offer recieved from <${peer_id}>`);

    createPeerConnection(peer_id);
    let desc = new RTCSessionDescription(msg['sdp']);
    _peer_list[peer_id].setRemoteDescription(desc)
        .then(() => {
            let local_stream = myVideo.srcObject;
            local_stream.getTracks().forEach((track) => { _peer_list[peer_id].addTrack(track, local_stream); });
        })
        .then(() => { return _peer_list[peer_id].createAnswer(); })
        .then((answer) => { return _peer_list[peer_id].setLocalDescription(answer); })
        .then(() => {
            console.log(`sending answer to <${peer_id}> ...`);
            sendViaServer({
                "sender_id": myID,
                "target_id": peer_id,
                "type": "answer",
                "sdp": _peer_list[peer_id].localDescription
            });
        })
        .catch(log_error);
}
function handleAnswerMsg(msg) {
    let peer_id = msg['sender_id'];
    console.log(`answer recieved from <${peer_id}>`);
    let desc = new RTCSessionDescription(msg['sdp']);
    _peer_list[peer_id].setRemoteDescription(desc)
}
function handleNewICECandidateMsg(msg) {
    let peer_id = msg['sender_id'];
    console.log(`ICE candidate recieved from <${peer_id}>`);
    var candidate = new RTCIceCandidate(msg.candidate);
    _peer_list[msg["sender_id"]].addIceCandidate(candidate)
        .catch(log_error);
}

// ===============[Camera]=================
var mediaConstraints = {
    audio: true,
    video: {
        height: 360
    }
};
function startCamera() //카메라 시작
{
    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((stream) => {
            myVideo.srcObject = stream;
            //camera_allowed = true;
            setAudioMuteState(audioMuted);
            setVideoMuteState(videoMuted);
            myVideo.autoPlay = true;
            //start the socketio connection
            socket.connect();
        })
        .catch((e) => {
            console.log("getUserMedia Error! ", e);
        });
}
function setAudioMuteState(flag) {
    let local_stream = myVideo.srcObject;
    local_stream.getAudioTracks().forEach((track) => {
        if (track.kind === "audio") {
            track.enabled = !flag;
        }

    });
}
function setVideoMuteState(flag) {
    let local_stream = myVideo.srcObject;
    local_stream.getVideoTracks().forEach((track) => {
        if (track.kind === "video") {
            track.enabled = !flag;
        }

    });
}
function getMyVideo() {
    myVideo = document.getElementById("local_vid");
    myVideo.onloadeddata = () => { console.log("W,H: ", myVideo.videoWidth, ", ", myVideo.videoHeight); };
}
function checkVideoLayout() {
    console.log("checkVideoLayout")
    const video_grid = document.getElementById("video_grid");
    const videos = video_grid.querySelectorAll("video");
    const video_count = videos.length;
    if (video_count == 0) { }
    else if (video_count == 1) {
        videos[0].style.width = "50%";
        videos[0].style.height = "50%";
        videos[0].style.objectFit = "cover";
    } else if (video_count == 2) {
        videos[0].style.width = "50%";
        videos[0].style.height = "50%";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "50%";
        videos[1].style.height = "50%";
        videos[1].style.objectFit = "cover";
    } else if (video_count == 3) {
        videos[0].style.width = "50%";
        videos[0].style.height = "50%";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "50%";
        videos[1].style.height = "50%";
        videos[1].style.objectFit = "cover";
        videos[2].style.width = "50%";
        videos[2].style.height = "50%";
        videos[2].style.objectFit = "cover";
    } else {
        videos[0].style.width = "50%";
        videos[0].style.height = "50%";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "50%";
        videos[1].style.height = "50%";
        videos[1].style.objectFit = "cover";
        videos[2].style.width = "50%";
        videos[2].style.height = "50%";
        videos[2].style.objectFit = "cover";
        videos[3].style.width = "50%";
        videos[3].style.height = "50%";
        videos[3].style.objectFit = "cover";
    }
}
function addVideoElement(element_id, display_name) {
    document.getElementById("video_grid").appendChild(makeVideoElementCustom(element_id, display_name));
    checkVideoLayout();
}
function makeVideoElementCustom(element_id, display_name) {
    let vid = document.createElement("video");
    vid.id = "vid_" + element_id;
    vid.autoPlay = true;
    return vid;
}
function getVideoObj(element_id) {
    return document.getElementById("vid_" + element_id);
}
function removeVideoElement(element_id) {
    let v = getVideoObj(element_id);
    if (v.srcObject) {
        v.srcObject.getTracks().forEach(track => track.stop());
    }
    v.removeAttribute("srcObject");
    v.removeAttribute("src");

    document.getElementById("vid_" + element_id).remove();
    checkVideoLayout();
}

const MeetingPage = () => {
    const location = useLocation();

    const [dataToServer, setDataToServer] = useState({});

    useEffect(() => {
        getMyVideo();
        startCamera();
    }, [])

    useEffect(() => {
        socket.on("connect", () => {
            console.log("socket connected from client");
            console.log(location.state)
            let _dataToServer = {
                "userNickname": location.state["room_nickname"],
                "roomName": location.state["roomName"],
                "roomCapacity":location.state["room_allowed"],
                "roomPassword": location.state["room_pwd"]
            }
            setDataToServer(_dataToServer)
            socket.emit("create-room", _dataToServer);
        });

        // socket.on("join-request", () => {
        //     socket.emit("join-room", { "room_id": location.state["room_id"] })
        // })

        return () => {
            socket.off("connect")
            // socket.off("join-request")
        }
    }, []);

    // socket.on('disconnect', () => {
    // });

    useEffect(() => {
        socket.on("user-connect", (data) => {
            let peer_id = data["sid"];
            console.log(peer_id)
            let display_name = data["name"];
            _peer_list[peer_id] = undefined; // add new user to user list
            addVideoElement(peer_id, display_name);
        });
    })


    socket.on("user-disconnect", (data) => {
        console.log("user-disconnect ", data);
        let peer_id = data["sid"];
        closeConnection(peer_id);
        removeVideoElement(peer_id);
    });

    useEffect(() => {
        socket.on("user-list", (data) => {
            console.log("user list recvd ", data);
            myID = data["my_id"];
            if ("list" in data) // not the first to connect to room, existing user list recieved
            {
                let recvd_list = data["list"];
                let peer_id
                // add existing users to user list
                for (peer_id in recvd_list) {
                    display_name = recvd_list[peer_id];
                    _peer_list[peer_id] = undefined;
                    addVideoElement(peer_id, display_name);
                }
                console.log("_peer_list : ", _peer_list)
                start_webrtc();
            }
        });
    }, [])
    let defaultStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    }

    const exitRoom = () => {
        // let url = "https://127.0.0.1:8080/room/"
        // axios.post("")
        window.location.replace("/")
        console.log("exit")
    }

    const [audioIcon, setAudioIcon] = useState(audioMuted);
    const modAudioIcon = () => {
        setAudioIcon(!audioIcon);
        let local_stream = myVideo.srcObject;
        local_stream.getAudioTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = audioIcon;
            }
    
        });
    }

    const [videoIcon, setVideoIcon] = useState(videoMuted);
    const modVedioIcon = () => {
        setVideoIcon(!videoIcon);
        let local_stream = myVideo.srcObject;
        local_stream.getVideoTracks().forEach((track) => {
            if (track.kind === "video") {
                track.enabled = videoIcon;
            }
    
        });
    }

    const preventClose = (event) => {
        event.preventDefault();
        event.returnValue = "";
      };
      useEffect(() => {(() => {
          window.addEventListener("beforeunload", preventClose);
        })();
        return () => {
          window.removeEventListener("beforeunload", preventClose);
        };
      }, []);

    return (
        <div className='fake-root'>
            <div className='meet-root'>
                <div className='left'>
                    <div id="video_grid" className="video-grid" style={defaultStyle}>
                        <video id="local_vid" autoPlay muted style={defaultStyle} className="vid-icon-1"></video>
                        <div className='vid-icon-2'>
                            <div className='user_btns'>
                                <FontAwesomeIcon icon={faRightFromBracket} onClick={exitRoom}></FontAwesomeIcon>
                            </div>
                            <div className="user_btns" onClick={modAudioIcon}>
                                {!audioIcon ? <FontAwesomeIcon icon={faMicrophone}></FontAwesomeIcon> : <FontAwesomeIcon icon={faMicrophoneSlash}></FontAwesomeIcon>}
                            </div>
                            <div className="user_btns" onClick={modVedioIcon}>
                                {!videoIcon ? <FontAwesomeIcon icon={faVideo}></FontAwesomeIcon> : <FontAwesomeIcon icon={faVideoSlash}></FontAwesomeIcon>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='right'>
                    <DataContext.Provider value={dataToServer}>
                        <div className='chatting-list'>
                            <ChattingList />
                        </div>
                        <div className='chat-input'>
                            <Input />
                        </div>
                    </DataContext.Provider>
                </div>
            </div>
            <div className='meet-footer'>
            </div>
        </div>

    );
};

export default MeetingPage