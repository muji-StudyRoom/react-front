import '../css/App.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-solid-svg-icons"
import Paging from "../paging.js"
import { useState } from 'react';
import Modal from '../components/Modal';
import { RoomContext } from '../App';
import '../Modal.css';

var rooms = [<div className="room" key={50}>
  <div className='room-header'></div>
  <div className='room-body'>EBS 1타 강사</div>
  <div className='room-footer'>
    <FontAwesomeIcon icon={faEye} /> 1234
  </div>
</div>];

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  return <header>
    <div id="header-app">
      <div id="header-title">Eyes Talk</div>
      <div id="header-text">Eyes Talk은 화상 회의를 통해 실시간으로 소통이 가능합니다.
        <br></br><br></br>관심사에 맞는 회의방을 만들어 소통해보세요!</div>
      <button onClick={openModal} id="start-button">회의 시작</button>
      <Modal open={modalOpen} close={closeModal} header="방 만들기">
      </Modal>
    </div>
  </header>
}

const Search = () => {
  const [text, setText] = useState("");
  return <div id="search-box">
    <input type="text" id="search-input" placeholder='검색어를 입력하세요' value={text} onChange={event => {
      setText(event.target.value)
    }}></input>
    <div id='icon'>
      <div id='search'>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </div>
      <div id='delete'>
        <FontAwesomeIcon icon={faX} onClick={() => {
          setText("")
        }} />
      </div>
    </div>
  </div>
}


const Rooms = () => {
  const [roomCount, setRoomcount] = useState(1);
  const [rooms, setRooms] = useState([<div className="room" key={roomCount}>
    <div className='room-header'></div>
    <div className='room-body'>EBS {roomCount}타 강사</div>
    <div className='room-footer'>
      <FontAwesomeIcon icon={faEye} /> 179
    </div>
  </div>])

  return <div id="rooms">
    {rooms}
  </div>
}

const App = () => {
  const [rooms, setRooms] = useState([<div className="room" key={1}>
  <div className='room-header'></div>
  <div className='room-body'>test1234</div>
  <div className='room-footer'>
    <FontAwesomeIcon icon={faEye} /> {777}
  </div>
</div>]);
  return (
    <RoomContext.Provider value={{ rooms, setRooms }}>
      <div className="App">
        <Header></Header>
        <Search></Search>
        <Paging></Paging>
        <footer id="first-footer"></footer>
      </div>
    </RoomContext.Provider>
  );
}

export default App;
