import React from 'react';
import axios from 'axios';
import '../Modal.css';
import {redirect} from 'react-router-dom'
const Modal = (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const { open, close, header } = props;

  const getMicInfo = () => {
    const micList = document.getElementsByName('mic_info');
    let mic_info;
    micList.forEach((mic) => {
      if(mic.checked)  {
        console.log(mic.value);
        mic_info = mic.value
      }
    })
    return mic_info;
  }

  const getVideoInfo = () => {
    const genderNodeList = document.getElementsByName('video_info');
    let video_info;
    genderNodeList.forEach((video) => {
      if(video.checked)  {
        console.log(video.value);
        video_info = video.value
      }
    })
    return video_info;
  }

  const createRoom = async () => {
    console.log("방을 생성합니다. ");
    axios.post('http://localhost:5000/join', {
      display_name : document.getElementById("room_nickname").value,
      room_allowed : document.getElementById("room_allowed").value,
      mute_audio : getMicInfo(),
      mute_video : getVideoInfo(),
      room_id : document.getElementById("room_id").value
    }).then(function (response) {
      console.log(response);
      redirect("/meeting");
    }).catch(function (error) {
          console.log(error);
    });
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
              <input className="modal-input" placeholder='방 제목을 입력주세요' id="room_id"></input>
            </div>
            <div className='modal-text'>수용 인원</div>
            <div>
              <input className="modal-input" placeholder='수용 인원을 입력해주세요'id="room_allowed"></input>
            </div>
            <div className='modal-text'>닉네임</div>
            <div>
              <input className="modal-input" placeholder='닉네임을 입력해주세요' id="room_nickname"></input>
            </div>
            <div className='modal-text'>비밀번호</div>
            <div>
              <input type="password" className="modal-input" placeholder='비밀번호를 입력해주세요' id="room_password"></input>
            </div>
            <div className='modal-text'>마이크ON/OFF</div>
            <input type="radio" name="mic_info" value="mic_on" /> ON
            <input type="radio" name="mic_info" value="mic_off" /> OFF

            <div className='modal-text'>비디오 ON/OFF</div>
            <input type="radio" name="video_info" value="video_on"  /> ON
            <input type="radio" name="video_info" value="video_off" /> OFF

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