import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faEye, faUser } from "@fortawesome/free-solid-svg-icons"
import './css/paging.css';
import './css/App.css';
import Pagination from "react-js-pagination"
import EnterModal from './components/EnterModal';
import axios from "axios";

const Paging = () => {
    const [responseRoom, setResponseRoom] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [propRoomInfo, setPropRoomInfo] = useState({});
    let roomList = [];
    useEffect(() => {
        async function getData() {
            const response = await axios.get("/room")
            console.log(response)
            setResponseRoom(response.data)
            // console.log(response.data.length)
            for (let i = response.data.length - 1; i >= 0; i--) {
                let createAt = response.data[i].roomCreateAt
                let displayCreate = createAt.substring(0, 4) + "년 " + createAt.substring(5, 7) + "월 " + createAt.substring(8, 10) + "일 " + createAt.substring(11, 13) + "시 " + createAt.substring(14, 16) + "분"
                roomList.push([
                    <div className="room" key={response.data[i].roomId}>
                        <div className='room-header' onClick={openModal} id={response.data[i].roomId} style={{ backgroundImage: `url(/box/kakao${parseInt(i) % 10 + 1}.jpg)` }}></div>
                        <div className='room-body'>{response.data[i].roomName}</div>
                        <div className='room-footer'>
                            <div>
                                <FontAwesomeIcon icon={faUser} /> {response.data[i].roomEnterUser}
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faCalendarDays} /> {displayCreate}
                            </div>
                        </div>
                        <div style={{ display: 'none' }} className={response.data[i].roomCapacity}></div>
                    </div>
                ])
            }
        }
        getData();
        // eslint-disable-next-line
    }, [])

    const openModal = (event) => {
        console.log("roomName : ", document.getElementById(event.target.id).nextSibling.innerText)
        setPropRoomInfo({ roomName: document.getElementById(event.target.id).nextSibling.innerText, roomId: event.target.id, roomCapacity: document.getElementById(event.target.id).nextSibling.nextSibling.nextSibling.className })
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

    const [roomPerPage] = useState(4)
    const indexOfLastRoom = page * roomPerPage
    const indexOfFirstRoom = indexOfLastRoom - roomPerPage

    useEffect(() => {
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom))
    }, [indexOfFirstRoom, indexOfLastRoom, page, rooms, responseRoom])


    return (<>
        <EnterModal open={modalOpen ? true : false} close={closeModal} roomInfo={propRoomInfo}></EnterModal>
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