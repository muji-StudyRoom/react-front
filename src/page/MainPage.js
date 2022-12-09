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
  const [completed, setCompleted] = useState(false);
  const [searchResponse, setSearchResponse] = useState({});

  const searchRoom = (event) => {
    if (event.key === "Enter") {
      if (document.getElementById("search-input").value === "") {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: '검색어를 입력해주세요.',
          showConfirmButton: false,
          timer: 1000
        })
      }
      else {
        let url = "/room/" + document.getElementById("search-input").value
        document.getElementById("search-input").value = "";
        axios.get(url)
          .then(response => {
            console.log("response : ", response)
            setCompleted(true);
            setSearchResponse(response.data)
          })
          .catch(e => {
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: '검색어와 일치하는 방이 없습니다.',
              showConfirmButton: false,
              timer: 1000
            })
          })
      }
    }
  }

  const viewAll = () => {
    setCompleted(false);
  }

  const iconClick = () => {
    document.getElementById("search-input").focus()
  }

  return <>
    <div>
      <div id="search-box">
        <span>
          <input type="text" id="search-input" placeholder='검색어를 입력하세요' onKeyPress={searchRoom}></input>
        </span>
        <div id='icon' onClick={iconClick}>
          <div id='search'>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <div id='delete'>
            <FontAwesomeIcon icon={faX} onClick={() => {
              document.getElementById("search-input").value = "";
            }} />
          </div>
        </div>
      </div>
      <div id='all-btn-div'>
        <button id='all-btn' onClick={viewAll}>전체보기</button>
      </div>
    </div>
    {completed ? <Paging target="search" searchData={searchResponse}></Paging> : <Paging target="all"></Paging>}
  </>
}

const App = () => {

  return (
    <div className="App">
      <Header></Header>
      <Search></Search>
      <footer id="first-footer">
        <div id='desc-all'>
          <img src='logo-nobackground.png' id="title-logo" alt="title-logo"></img>
          <div className='desc-box'>
            <div className='desc-name'>노희재</div><div className='desc-mail'>rhj0830@gmail.com</div>
          </div>
          <div className='desc-box'>
            <div className='desc-name'>김남주</div><div className='desc-mail'>jupitern404@gmail.com</div>
          </div>
          <div className='desc-box'>
            <div className='desc-name'>이현지</div><div className='desc-mail'>dleeh197@gmail.com</div>
          </div>
          <div className='desc-box'>
            <div className='desc-name'>이기빈</div><div className='desc-mail'>lkb980316@gmail.com</div>
          </div>
        </div>
        <div id="logo-box">
          <a href='https://github.com/muji-StudyRoom' target="_blank" rel="noreferrer">
            <img src="github-logo.png" id="github-logo" alt='github-logo'></img>
          </a>
          <a href='https://www.notion.so/6b262eea2f9c4036a9aea58e1718650e' target="_blank" rel="noreferrer">
            <img src="notion-logo.png" id="notion-logo" alt='notion-logo'></img>
          </a>
        </div>
      </footer>
      <div>
      </div>
    </div>
  );
}

export default App;