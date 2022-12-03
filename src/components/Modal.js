import React, { useState } from 'react';
import '../css/Modal.css';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';

const Modal = (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, header } = props;

  const [createEnable, setCreateEnable] = useState(false)

  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  const getMicInfo = () => {
    const micList = document.getElementsByName('mic_info');
    let mic_info;
    micList.forEach((mic) => {
      if (mic.checked) {
        mic_info = mic.value
      }
    })
    return mic_info;
  }

  const getVideoInfo = () => {
    const genderNodeList = document.getElementsByName('video_info');
    let video_info;
    genderNodeList.forEach((video) => {
      if (video.checked) {
        video_info = video.value
      }
    })
    return video_info;
  }

  const navigate = useNavigate();

  const createRoom = () => {
    if (createEnable === false) {
      Toast.fire({
        icon: 'error',
        title: '확인 버튼을 먼저 눌러주세요.'
      })
    }
    else {
      let roomName = document.getElementById("room_id").value
      let room_allowed = document.getElementById("room_allowed").value
      let room_nickname = document.getElementById("room_nickname").value
      let room_pwd = document.getElementById("room_password").value
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: '방이 생성되었습니다.',
        showConfirmButton: false,
        timer: 2000
      })
      navigate("/meeting", {
        state: {
          type: "create",
          roomName: roomName,
          room_allowed: room_allowed,
          room_nickname: room_nickname,
          room_pwd: room_pwd,
          mute_audio: getMicInfo(),
          mute_video: getVideoInfo()
        }
      })
    }

  }

  const validCreate = () => {
    let room_id = document.getElementById("room_id").value
    let room_allowed = document.getElementById("room_allowed").value
    let room_nickname = document.getElementById("room_nickname").value
    let room_pwd = document.getElementById("room_password").value

    if (room_id.length < 4 || room_id.length > 15) {
      document.getElementById("room_id").focus()
      Toast.fire({
        icon: 'error',
        title: '방 제목은 3 이상 15 이하의 길이만 입력 가능합니다.'
      })
    }
    else if (room_allowed === "" || isNaN(room_allowed)) {
      document.getElementById("room_allowed").focus()
      Toast.fire({
        icon: 'error',
        title: '수용 인원은 2 이상 4 이하의 숫자만 입력 가능합니다.'
      })
    }
    else if (parseInt(room_allowed) > 4 || parseInt(room_allowed) < 2) {
      document.getElementById("room_allowed").focus()
      Toast.fire({
        icon: 'error',
        title: '수용 인원은 2 이상 4 이하의 숫자만 입력 가능합니다.'
      })
    }
    else if (room_nickname === "" || room_nickname.length > 10) {
      document.getElementById("room_nickname").focus()
      Toast.fire({
        icon: 'error',
        title: '닉네임은 1이상 10 이하의 길이만 입력 가능합니다.'
      })
    }
    else if (room_pwd === "" || room_pwd.length > 10) {
      document.getElementById("room_password").focus()
      Toast.fire({
        icon: 'error',
        title: '비밀번호는 1이상 10 이하의 길이만 입력 가능합니다.'
      })
    }

    else {
      axios.post("/room/valid/create", {roomName: room_id})
        .then(response => {
          if (response.data === true) {
            setCreateEnable(true)
            Toast.fire({
              icon: 'success',
              title: '생성 가능한 방 제목입니다.'
            })
          }
          else {
            Toast.fire({
              icon: 'error',
              title: '방 제목을 바꿔주세요.'
            })
          }

        })
    }
  }

  return (
    // 모달이 열릴때 openModal 클래스가 생성된다.
    <div className={open ? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <header>
            {header}
            <button className="close" onClick={close}>
              &times;
            </button>
          </header>
          <main id="room-create">
            <div className='modal-text' >방 제목</div>
            <div>
              <input className="modal-title" placeholder='방 제목을 입력주세요' id="room_id" required></input><button onClick={validCreate} className="verify_btn">확인</button>
            </div>
            <div className='modal-text'>수용 인원</div>
            <div>
              <input className="modal-input" placeholder='수용 인원을 입력해주세요' id="room_allowed" required></input>
            </div>
            <div className='modal-text'>닉네임</div>
            <div>
              <input className="modal-input" placeholder='닉네임을 입력해주세요' id="room_nickname" required></input>
            </div>
            <div className='modal-text'>비밀번호</div>
            <div>
              <input type="password" className="modal-input" placeholder='비밀번호를 입력해주세요' id="room_password" required></input>
            </div>
            <div className='modal-text'>비디오</div>
            <div className='radios'>
              <label>
                <input type="radio" name="video_info" value="0" defaultChecked />
                <span>ON</span>
              </label>
              <label>
                <input type="radio" name="video_info" value="1" />
                <span>OFF</span>
              </label>
            </div>
            <div className='modal-text'>마이크</div>
            <div className='radios'>
              <label>
                <input type="radio" name="mic_info" value="0" />
                <span>ON</span>
              </label>
              <label>
                <input type="radio" name="mic_info" value="1" defaultChecked />
                <span>OFF</span>
              </label>
            </div>
          </main>
          <footer>
            <button className="close" onClick={createRoom}>
              생성
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  );
};

export default Modal;