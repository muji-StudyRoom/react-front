import '../css/App.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import Paging from "../paging.js"
import { useState } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';
import Swal from 'sweetalert2';

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

  const searchRoom = (event) => {
    if (event.key === "Enter") {
      if (text === "") {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: '검색어를 입력해주세요.',
          showConfirmButton: false,
          timer: 1000
        })
      }
      else {
        let url = process.env.REACT_APP_BACK_BASE_URL + "/room/" + text
        axios.get(url, {withCredentials: true})
          .then(response => {
            console.log(response)
          })
      }
    }
  }

  return <div id="search-box">
    <input type="text" id="search-input" placeholder='검색어를 입력하세요' value={text} onKeyPress={searchRoom} onChange={event => {
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

const App = () => {

  return (
    <div className="App">
      <Header></Header>
      <Search></Search>
      <Paging></Paging>
      <footer id="first-footer"></footer>
      <div>
      </div>
    </div>
  );
}

export default App;