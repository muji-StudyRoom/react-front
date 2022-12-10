import Input from "../components/Input";
import ChattingList from "../components/ChattingList";
import React, { useState, useEffect, createContext } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import "../css/Meetingpage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDisplay, faMicrophone, faRightFromBracket, faSmile } from "@fortawesome/free-solid-svg-icons";
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

export const DataContext = createContext();

var myVideo;
var selectCamera = true;
var myID;
var _peer_list = {};

var display_name;

var PC_CONFIG = {
  iceServers: [
    {
      urls: "turn:3.34.250.120",
      username: "eyestalk",
      credential: "pass123#",
    },
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
      ],
    },
  ],
};

// ===============[webrtc]=================
function sendViaServer(data) {
  socket.emit("data", data);
}
function log_error(e) {
  console.log("[ERROR] ", e);
}

function handleNegotiationNeededEvent(peer_id) {
  console.log("handleNegotiationNeededEvent Start");
  _peer_list[peer_id]
    .createOffer()
    .then((offer) => {
      return _peer_list[peer_id].setLocalDescription(offer);
    })
    .then(() => {
      console.log(`sending offer to <${peer_id}> ...`);
      sendViaServer({
        sender_id: myID,
        target_id: peer_id,
        type: "offer",
        sdp: _peer_list[peer_id].localDescription,
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
  if (event.candidate) {
    console.log("handleICECandidateEvent");
    sendViaServer({
      sender_id: myID,
      target_id: peer_id,
      type: "new-ice-candidate",
      candidate: event.candidate,
    });
  }
}

function createPeerConnection(peer_id) {
  _peer_list[peer_id] = new RTCPeerConnection(PC_CONFIG);

  _peer_list[peer_id].onicecandidate = (event) => {
    handleICECandidateEvent(event, peer_id);
  };
  _peer_list[peer_id].ontrack = (event) => {
    handleTrackEvent(event, peer_id);
  };
  _peer_list[peer_id].onnegotiationneeded = () => {
    handleNegotiationNeededEvent(peer_id);
  };
}

async function invite(peer_id) {
  if (_peer_list[peer_id]) {
    console.log("[Not supposed to happen!] Attempting to start a connection that already exists!");
  } else if (peer_id === myID) {
    console.log("[Not supposed to happen!] Trying to connect to self!");
  } else {
    console.log(`Creating peer connection for <${peer_id}> ...`);
    createPeerConnection(peer_id);
    await sleep(3000); // 기존 2000
    let local_stream = myVideo.srcObject;
    local_stream.getTracks().forEach((track) => {
      _peer_list[peer_id].addTrack(track, local_stream);
      console.log(peer_id);
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function start_webrtc() {
  // send offer to all other members
  console.log("start_webrtc");
  for (let peer_id in _peer_list) {
    invite(peer_id);
  }
}

function closeConnection(peer_id) {
  console.log(_peer_list);
  if (peer_id in _peer_list) {
    _peer_list[peer_id].onicecandidate = null;
    _peer_list[peer_id].ontrack = null;
    _peer_list[peer_id].onnegotiationneeded = null;
    delete _peer_list[peer_id]; // remove user from user list
  }
}

// ===============[Send Data]==============

function handleOfferMsg(msg) {
  let peer_id = msg["sender_id"];

  console.log(`offer recieved from <${peer_id}>`);

  createPeerConnection(peer_id);
  let desc = new RTCSessionDescription(msg["sdp"]);
  _peer_list[peer_id]
    .setRemoteDescription(desc)
    .then(() => {
      let local_stream = myVideo.srcObject;
      local_stream.getTracks().forEach((track) => {
        _peer_list[peer_id].addTrack(track, local_stream);
        console.log(_peer_list);
      });
    })
    .then(() => {
      return _peer_list[peer_id].createAnswer();
    })
    .then((answer) => {
      return _peer_list[peer_id].setLocalDescription(answer);
    })
    .then(() => {
      console.log(`sending answer to <${peer_id}> ...`);
      sendViaServer({
        sender_id: myID,
        target_id: peer_id,
        type: "answer",
        sdp: _peer_list[peer_id].localDescription,
      });
    })
    .catch(log_error);
}
function handleAnswerMsg(msg) {
  let peer_id = msg["sender_id"];
  console.log(`answer recieved from <${peer_id}>`);
  let desc = new RTCSessionDescription(msg["sdp"]);
  _peer_list[peer_id].setRemoteDescription(desc);
}
function handleNewICECandidateMsg(msg) {
  let peer_id = msg["sender_id"];
  console.log(`ICE candidate recieved from <${peer_id}>`);
  var candidate = new RTCIceCandidate(msg.candidate);
  _peer_list[msg["sender_id"]].addIceCandidate(candidate).catch(log_error);
}

// ===============[Camera]=================
var mediaConstraints = {
  audio: true,
  video: {
    height: 360,
  },
};

function startCamera(mute_video, mute_audio) {
  navigator.mediaDevices
    .getUserMedia(mediaConstraints)
    .then((stream) => {
      myVideo.srcObject = stream;
      setAudioMuteState(mute_audio);
      setVideoMuteState(mute_video);
      myVideo.autoplay = true;
      myVideo.onclick = (e) => screenExpend(e);
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
  myVideo.onloadeddata = () => {
    console.log("W,H: ", myVideo.videoWidth, ", ", myVideo.videoHeight);
  };
}

function screenReduce(videoId) {
  console.log("screenReduce start");
  document.getElementById(videoId).onclick = (e) => screenExpend(e);
  checkVideoLayout();
}

function screenExpend(event) {
  console.log("screenExpend start");
  const video_grid = document.getElementById("video_grid");
  const videos = video_grid.getElementsByClassName("video-group");
  const video_count = videos.length;
  for (let i = 0; i < video_count; i++) {
    videos[i].style.width = "0%";
    videos[i].style.height = "0%";
    videos[i].style.objectFit = "cover";
    videos[i].lastChild.style.display = "none";
  }
  let targetVideo = document.getElementById(event.target.id);
  targetVideo.parentElement.parentElement.style.width = "100%";
  targetVideo.parentElement.parentElement.style.height = "100%";
  targetVideo.parentElement.parentElement.style.objectFit = "cover";
  targetVideo.parentNode.nextSibling.style.display = "";
  targetVideo.onclick = () => screenReduce(event.target.id);
}

function checkVideoLayout() {
  console.log("checkVideoLayout");
  const video_grid = document.getElementById("video_grid");
  const videos = video_grid.getElementsByClassName("video-group");
  const video_count = videos.length;
  if (parseInt(video_count) === 0) {
  } else if (parseInt(video_count) === 1) {
    videos[0].style.width = "100%";
    videos[0].style.height = "100%";
    videos[0].style.objectFit = "cover";
    videos[0].lastChild.style.display = "";
  } else {
    for (let i = 0; i < video_count; i++) {
      videos[i].style.width = "50%";
      videos[i].style.height = "50%";
      videos[i].style.objectFit = "cover";
      videos[i].lastChild.style.display = "";
    }
  }
}
function addVideoElement(element_id, display_name) {
  document.getElementById("video_grid").appendChild(makeVideoElementCustom(element_id, display_name));
  checkVideoLayout();
}
function makeVideoElementCustom(element_id, display_name) {
  let videoGroup = document.createElement("div");
  videoGroup.className = "video-group";
  videoGroup.id = "vg_" + element_id;

  let videoBox = document.createElement("div");
  videoBox.className = "video-box";
  videoBox.id = "vb_" + element_id;

  let upperName = document.createElement("div");
  upperName.className = "upper-name";
  upperName.innerText = display_name;

  let vid = document.createElement("video");
  vid.id = "vid_" + element_id;
  vid.autoplay = true;
  vid.className = "camera_video";
  vid.onclick = screenExpend;

  videoBox.appendChild(vid);

  videoGroup.appendChild(videoBox);
  videoGroup.appendChild(upperName);

  return videoGroup;
}
function getVideoObj(element_id) {
  return document.getElementById("vid_" + element_id);
}
function removeVideoElement(element_id) {
  let v = getVideoObj(element_id);
  if (v.srcObject) {
    v.srcObject.getTracks().forEach((track) => track.stop());
  }
  v.removeAttribute("srcObject");
  v.removeAttribute("src");

  document.getElementById("vg_" + element_id).remove();
  checkVideoLayout();
}

const MeetingPage = () => {
  const location = useLocation();
  const [dataToServer, setDataToServer] = useState({});

  useEffect(() => {
    getMyVideo();
    startCamera(!!parseInt(location.state.mute_video), !!parseInt(location.state.mute_audio));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("data", (msg) => {
      // eslint-disable-next-line
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
  }, []);

  useEffect(() => {
    let _dataToServer;
    socket.on("connect", () => {
      console.log("socket connected from client");

      _dataToServer = {
        userNickname: location.state["room_nickname"],
        roomName: location.state["roomName"],
        roomCapacity: location.state["room_allowed"],
        roomPassword: location.state["room_pwd"],
      };
      setDataToServer(_dataToServer);
      socket.emit("create-room", _dataToServer);
    });

    socket.on("join-request", () => {
      socket.emit("join-room", _dataToServer);
    });

    return () => {
      socket.off("connect");
      socket.off("join-request");
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("user-connect", (data) => {
      let peer_id = data["sid"];
      console.log(peer_id);
      let display_name = data["name"];
      _peer_list[peer_id] = undefined; // add new user to user list
      addVideoElement(peer_id, display_name);
    });
  }, []);

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
      if ("list" in data) {
        // not the first to connect to room, existing user list recieved
        let recvd_list = data["list"];
        let peer_id;
        // add existing users to user list
        for (peer_id in recvd_list) {
          display_name = recvd_list[peer_id];
          _peer_list[peer_id] = undefined;
          addVideoElement(peer_id, display_name);
          if (peer_id !== myID) {
            let dm_select = document.createElement("option");
            dm_select.id = peer_id;
            dm_select.value = peer_id;
            dm_select.innerText = recvd_list[peer_id];
            document.getElementById("dm-select").appendChild(dm_select);
          }
        }
        console.log("_peer_list : ", _peer_list);
        start_webrtc();
      }
    });
  }, []);

  const exitRoom = () => {
    Swal.fire({
      title: "퇴장하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#505f98",
      confirmButtonText: "퇴장하기",
      cancelButtonText: "머무르기",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "방에서 퇴장합니다.",
          showConfirmButton: false,
          timer: 1000,
        });
        window.location.replace("/");
        console.log("exit");
      } else {
        Swal.fire({
          icon: "success",
          title: "대화를 더 즐겨보세요!",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    });
  };

  const [audioIcon, setAudioIcon] = useState(!!parseInt(location.state.mute_audio));
  const modAudioIcon = () => {
    setAudioIcon(!audioIcon);
    let local_stream = myVideo.srcObject;
    local_stream.getAudioTracks().forEach((track) => {
      if (track.kind === "audio") {
        track.enabled = audioIcon;
      }
    });
  };

  const [videoIcon, setVideoIcon] = useState(!!parseInt(location.state.mute_video));
  const modVedioIcon = () => {
    setVideoIcon(!videoIcon);
    let local_stream = myVideo.srcObject;
    local_stream.getVideoTracks().forEach((track) => {
      if (track.kind === "video") {
        track.enabled = videoIcon;
      }
    });
  };

  const [selectIcon, setSelectIcon] = useState(selectCamera);

  function shareVideo() {
    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: true,
      })
      .then((screenStream) => {
        setSelectIcon(false);
        let peerLength = Object.keys(_peer_list).length; // _peer_list의 길이
        let localStream = myVideo.srcObject; // 로컬 스트림
        let videoTrack = screenStream.getVideoTracks()[0]; // 로컬 스트림의 비디오트랙
        myVideo.srcObject = screenStream; // 본인의 화면을 공유화면으로 전환

        socket.emit("share-start", { roomName: location.state.roomName });
        if (peerLength > 0) {
          // RTC 연결이 된 상대가 있을 시
          let senderList = [];
          for (let i = 0; i < peerLength; i++) {
            var sender = _peer_list[Object.keys(_peer_list)[i]].getSenders().find(function (s) {
              return s.track.kind === videoTrack.kind;
            });
            senderList.push(sender);
            sender.replaceTrack(videoTrack);
          }
          videoTrack.onended = function () {
            setSelectIcon(true);
            socket.emit("share-end", { roomName: location.state.roomName });
            for (let i = 0; i < peerLength; i++) {
              senderList[i].replaceTrack(localStream.getTracks()[1]);
            }
            myVideo.srcObject = localStream;
          };
        } else {
          // 방에 혼자 있을 시
          videoTrack.onended = function () {
            setSelectIcon(true);
            socket.emit("share-end", { roomName: location.state.roomName });
            myVideo.srcObject = localStream;
          };
        }
        setVideoIcon(false);
        setAudioIcon(true);
      })
      .catch(function (e) {
        console.log("getDisplayMedia Error! ", e);
      });
  }

  useEffect(() => {
    socket.on("share-start", (data) => {
      console.log(data);
      document.getElementById("vid_" + data.sid).className = "display_video";
    });

    socket.on("share-end", (data) => {
      console.log(data);
      document.getElementById("vid_" + data.sid).className = "camera_video";
    });
  });

  const modeModify = () => {
    if (selectIcon) {
      shareVideo();
    } else {
      Swal.fire({
        icon: "warning",
        titleText: '브라우저의 "공유 중지"\n버튼을 눌러주세요.',
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };

  window.addEventListener("keydown", (event) => {
    if (parseInt(event.keyCode) === 116) {
      event.preventDefault();
      event.returnValue = "";
      Swal.fire({
        icon: "warning",
        title: "새로고침을 권장하지 않습니다.",
        showConfirmButton: false,
        timer: 1000,
      });
    }
  });

  let defaultStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "relative",
  };

  return (
    <div className="fake-root">
      <div className="meet-root">
        <div className="left">
          <div id="video_grid" className="video-grid" style={defaultStyle}>
            <div className="video-group">
              <div className="video-box">
                <video id="local_vid" className={selectIcon ? "camera_video" : "display_video"} autoplay muted style={defaultStyle}></video>
              </div>
              <div className="upper-name">{location.state["room_nickname"]}</div>
            </div>
          </div>
        </div>
        <div className="right">
          <DataContext.Provider value={dataToServer}>
            <div className="chatting-list">
              <ChattingList />
            </div>
            <div id="dm-select-div">
              <select id="dm-select">
                <option value="all">모두</option>
              </select>
              에게 메시지를 보냅니다.
            </div>
            <div className="chat-input">
              <Input />
            </div>
          </DataContext.Provider>
        </div>
      </div>
      <div className="meet-footer">
        <div className="vid-icon">
          <div className="user_btns">
            <FontAwesomeIcon icon={faRightFromBracket} onClick={exitRoom}></FontAwesomeIcon>
          </div>
          <div className="user_btns" onClick={modAudioIcon}>
            {!audioIcon ? <FontAwesomeIcon icon={faMicrophone}></FontAwesomeIcon> : <FontAwesomeIcon icon={faMicrophoneSlash}></FontAwesomeIcon>}
          </div>
          <div className="user_btns" onClick={modVedioIcon}>
            {!videoIcon ? <FontAwesomeIcon icon={faVideo}></FontAwesomeIcon> : <FontAwesomeIcon icon={faVideoSlash}></FontAwesomeIcon>}
          </div>
          <div className="user_btns" onClick={modeModify}>
            {!selectIcon ? <FontAwesomeIcon icon={faSmile}></FontAwesomeIcon> : <FontAwesomeIcon icon={faDisplay}></FontAwesomeIcon>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
