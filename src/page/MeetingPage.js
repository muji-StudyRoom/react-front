import Input from '../components/Input';
import ChattingList from "../components/ChattingList";
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { socket } from '../socket';
import "../css/Meetingpage.css";
import { RoomContext } from '../App';

export const DataContext = createContext();

var protocol = window.location.protocol;
// var socket = io(protocol + '//' + document.domain + ':' + window.location.port, {autoConnect: true});

// const socket = io("http://127.0.0.1:5000", {
//   cors: { origin: '*' },
//   // query: {
//   //   test: 5555
//   // }
// });
var myVideo;
var audioMuted = false;
var videoMuted = false;
var camera_allowed = false;

var myID;
var _peer_list = {};

/// 방 정보
var display_name
var mute_audio
var mute_video
var room_id

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
function sendViaServer(data) { socket.emit("data", data); }
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
        await sleep(2000);
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
    var tmp = 0;
    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((stream) => { // 2번 실행되는 이유는 strict
            myVideo.srcObject = stream;
            //camera_allowed = true;
            setAudioMuteState(audioMuted);
            setVideoMuteState(videoMuted);
            myVideo.autoplay = true;
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
    document.getElementById("mic_mute_btn").innerText = (!flag) ? "mic_off" : "mic_on";
}
function setVideoMuteState(flag) {
    let local_stream = myVideo.srcObject;
    local_stream.getVideoTracks().forEach((track) => {
        if (track.kind === "video") {
            track.enabled = !flag;
        }

    });
    document.getElementById("vid_mute_btn").innerText = (!flag) ? "videocam_off" : "videocam_on";
}
function getMyVideo() {
    myVideo = document.getElementById("local_vid");
    myVideo.onloadeddata = () => { console.log("W,H: ", myVideo.videoWidth, ", ", myVideo.videoHeight); };

    var muteBttn = document.getElementById("mic_mute_btn");
    var muteVidBttn = document.getElementById("vid_mute_btn");
    //var callEndBttn = document.getElementById("call_end");

    muteBttn.addEventListener("click", (event) => {
        console.log("audioMuted : ", audioMuted)
        audioMuted = !audioMuted;
        setAudioMuteState(audioMuted);
    });
    muteVidBttn.addEventListener("click", (event) => {
        videoMuted = !videoMuted;
        setVideoMuteState(videoMuted);
    });
    // callEndBttn.addEventListener("click", (event)=>{
    //     window.location.replace("/");
    // });
    //document.getElementById("room_link").innerHTML=`or the link: <span class="heading-mark">${window.location.href}</span>`;

}
function checkVideoLayout() {

    const video_grid = document.getElementById("video_grid");
    const videos = video_grid.querySelectorAll("video");
    const video_count = videos.length;

    if (video_count == 0) { } else if (video_count == 1) {
        videos[0].style.width = "100%";
        videos[0].style.height = "100vh";
        videos[0].style.objectFit = "cover";
    } else if (video_count == 2) {
        videos[0].style.width = "100%";
        videos[0].style.height = "50vh";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "100%";
        videos[1].style.height = "50vh";
        videos[1].style.objectFit = "cover";
    } else if (video_count == 3) {
        videos[0].style.width = "100%";
        videos[0].style.height = "50vh";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "50%";
        videos[1].style.height = "50vh";
        videos[1].style.objectFit = "cover";
        videos[2].style.width = "50%";
        videos[2].style.height = "50vh";
        videos[2].style.objectFit = "cover";
    } else {
        videos[0].style.width = "50%";
        videos[0].style.height = "50vh";
        videos[0].style.objectFit = "cover";
        videos[1].style.width = "50%";
        videos[1].style.height = "50vh";
        videos[1].style.objectFit = "cover";
        videos[2].style.width = "50%";
        videos[2].style.height = "50vh";
        videos[2].style.objectFit = "cover";
        videos[3].style.width = "50%";
        videos[3].style.height = "50vh";
        videos[3].style.objectFit = "cover";
    }
}
function addVideoElement(element_id, display_name) {
    document.getElementById("video_grid").appendChild(makeVideoElementCustom(element_id, display_name));
    //checkVideoLayout();
}
function makeVideoElementCustom(element_id, display_name) {
    let vid = document.createElement("video");
    vid.id = "vid_" + element_id;
    vid.autoplay = true;
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
}

const MeetingPage = () => {
    const location = useLocation();
    console.log('state', location.state);

    const [dataToServer, setDataToServer] = useState({});

    // socket.connect();
    useEffect(() => {
        getMyVideo();
        startCamera();
        return () => {
            console.log("getMyVideo active")
        }
    }, [])

    useEffect(() => {
        socket.on("connect", () => {
            console.log("socket connected from client");
            let _dataToServer = {
                "display_name": location.state["room_nickname"],
                "mute_audio": location.state["mute_audio"],
                "mute_video": location.state["mute_video"],
                "room_id": location.state["room_id"]
            }
            setDataToServer(_dataToServer)
            socket.emit("create-room", _dataToServer);
        });

        socket.on("join-request", () => {
            socket.emit("join-room", { "room_id": location.state["room_id"] })
        })

        return () => {
            socket.off("connect")
            socket.off("join-request")
        }
    }, []);

    socket.on('disconnect', () => {
    });

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

    return (
        <div className='meet-root'>
            <div className='left'>
                <div id="videos">
                    <div id="video_grid" className="video-grid"></div>
                    <video id="local_vid" autoplay muted></video>
                </div>
                <div>
                    <button id="mic_mute_btn">mic_off</button>
                    <button id="vid_mute_btn">videocam_off</button>
                </div>

            </div>
            <div className='right'>
                <DataContext.Provider value={dataToServer}>
                    <Input />
                    <ChattingList />
                </DataContext.Provider>
            </div>
        </div>
    );
};

export default MeetingPage