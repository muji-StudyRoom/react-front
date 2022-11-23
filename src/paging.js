import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons"
import './css/paging.css';
import './css/App.css';
import Pagination from "react-js-pagination"
import EnterModal from './components/EnterModal';
import axios from "axios";

const Paging = () => {
    const [responseRoom, setResponseRoom] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [propRoomName, setPropRoomName] = useState("");
    let roomList = [];
    useEffect( () => {
        async function getData() {
            const response = await axios.get("http://127.0.0.1:8080/room")
            // console.log(response.data)
            setResponseRoom(response.data)
            console.log(response.data)
            for (let i = 0; i < response.data.length; i++) {
                roomList.push([<>
                    <div className="room">
                        <div className='room-header' onClick={openModal} id={response.data[i].roomId}></div>
                        <div className='room-body'>{response.data[i].roomName}</div>
                        <div className='room-footer'>
                            <FontAwesomeIcon icon={faEye} /> {response.data[i].roomEnterUser}
                        </div>
                    </div>
                </>])
            }
        }
        getData();
    }, [])
    
    const openModal = (event) => {
        setPropRoomName(document.getElementById(event.target.id).nextSibling.innerText)
        setModalOpen(true);
    };
    const closeModal = () => {
        //console.log("close")
        setModalOpen(false);
    };

    const [rooms] = useState(roomList)
    const [currentRooms, setCurrentRooms] = useState([])
    // 첫 렌더링 시 setCurrentRooms에 의해 currentRooms의 상태가 변하므로 렌더링이 추가로 1회 일어난다.
    const [page, setPage] = useState(1);
    const handlePageChange = (page) => {
        setPage(page);
    };

    const [roomPerPage] = useState(5)
    const indexOfLastRoom = page * roomPerPage
    const indexOfFirstRoom = indexOfLastRoom - roomPerPage

    useEffect(() => {
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom))
    }, [indexOfFirstRoom, indexOfLastRoom, page, rooms, responseRoom])


    return (<>
        <EnterModal open={modalOpen ? true : false} close={closeModal} header="방 입장하기" roomName={propRoomName}></EnterModal>
        <div id="rooms">
            {currentRooms}
        </div>
        <Pagination
            activePage={page}
            itemsCountPerPage={roomPerPage}
            totalItemsCount={rooms.length ? rooms.length : 0}
            pageRangeDisplayed={5}
            firstPageText={"<<"}
            prevPageText={"<"}
            nextPageText={">"}
            lastPageText={">>"}
            onChange={handlePageChange}
        />
    </>
    );
};


export default Paging;