import React from 'react';
import '../css/EnterModal.css';
import { useNavigate } from 'react-router-dom'
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye } from "@fortawesome/free-solid-svg-icons"
const EnterModal = (props) => {
    // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
    const { open, close, header, roomName } = props;
    console.log(props)
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
        navigate("/meeting", {
            state: {
                room_id: document.getElementById("room_id").value,
                room_allowed: document.getElementById("room_allowed").value,
                room_nickname: document.getElementById("room_nickname").value,
                room_pwd: document.getElementById("room_password").value,
                mute_audio: getMicInfo(),
                mute_video: getVideoInfo()
            }
        })
    }

    return (
        // 모달이 열릴때 openModal 클래스가 생성된다.
        <div className={open ? 'openModal modal' : 'modal'}>
            {open ? (
                <section>
                    <header>
                        {"[" + roomName + "] 입장하기"}
                        <button className="close" onClick={close}>
                            &times;
                        </button>
                    </header>
                    <main id="room-create">
                        <div className='modal-text'>닉네임</div>
                        <div>
                            <input className="modal-input" placeholder='닉네임을 입력해주세요' id="room_nickname"></input>
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
                                <input type="radio" name="mic_info" value="0" defaultChecked />
                                <span>ON</span>
                            </label>
                            <label>
                                <input type="radio" name="mic_info" value="1" />
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