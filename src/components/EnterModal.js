import React, { useState } from 'react';
import '../css/EnterModal.css';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import Swal from 'sweetalert2';
const EnterModal = (props) => {
    const { open, close, roomInfo } = props;
    const [enterEnable, setEnterEnable] = useState(false);
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
        if (enterEnable === false) {
            Toast.fire({
                icon: 'error',
                title: '확인 버튼을 먼저 눌러주세요.'
            })
        }
        else {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: '방이 생성되었습니다.',
                showConfirmButton: false,
                timer: 2000
            })
            navigate("/meeting", {
                state: {
                    type: "join",
                    roomName: roomInfo["roomName"],
                    room_allowed: roomInfo["roomCapacity"],
                    room_nickname: document.getElementById("room_nickname").value,
                    room_pwd: document.getElementById("room_password").value,
                    mute_audio: getMicInfo(),
                    mute_video: getVideoInfo()
                }
            })
        }

    }

    const validInfo = () => {
        let nickname = document.getElementById("room_nickname").value
        let password = document.getElementById("room_password").value
        if (nickname === "" || nickname.length > 10) {
            document.getElementById("room_nickname").focus()
            Toast.fire({
                icon: 'error',
                title: '닉네임은 1이상 10 이하의 길이만 입력 가능합니다.'
            })
        }
        else if (password === "" || password.length > 10) {
            document.getElementById("room_password").focus()
            Toast.fire({
                icon: 'error',
                title: '비밀번호는 1이상 10 이하의 길이만 입력 가능합니다.'
            })
        }
        else {
            let postData = {
                userNickname: nickname,
                roomId: roomInfo["roomId"],
                roomPassword: password
            }
            axios.post(process.env.REACT_APP_BACK_BASE_URL + "/room/valid/enter", postData)
                .then(response => {
                    if (parseInt(response.status) === 200) {
                        setEnterEnable(true)
                        Toast.fire({
                            icon: 'success',
                            title: '입장 가능합니다.'
                        })
                    }
                })
                .catch(error => {
                    if (error.response.data === "nickname_error") {
                        Toast.fire({
                            icon: 'error',
                            title: '중복된 닉네임입니다.'
                        })
                    }
                    else if (error.response.data === 'password_error') {
                        Toast.fire({
                            icon: 'error',
                            title: '일치하지 않는 비밀번호입니다.'
                        })
                    }
                    else if (error.response.data === 'capacity_error') {
                        Toast.fire({
                            icon: 'error',
                            title: '수용 인원을 초과하였습니다.'
                        })
                    }
                })
        }

    }

    return (
        // 모달이 열릴때 openModal 클래스가 생성된다.
        <div className={open ? 'openModal modal' : 'modal'} >
            {open ? (
                <section>
                    <header>
                        {"[" + roomInfo["roomName"] + "] 입장하기"}
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                    </header>
                    <main id="room-enter">
                        <div className='modal-text'>닉네임</div>
                        <div>
                            <input className="modal-title" placeholder='닉네임을 입력해주세요' id="room_nickname"></input><button onClick={validInfo} className="verify_btn">확인</button>
                        </div>
                        <div className='modal-text'>비밀번호</div>
                        <div>
                            <input type="password" className="modal-input" placeholder='비밀번호를 입력해주세요' id="room_password"></input>
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
                            입장
                        </button>
                    </footer>
                </section>
            ) : null}
        </div>
    );
};

export default EnterModal;