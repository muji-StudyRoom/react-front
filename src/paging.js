import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons"
import './css/paging.css';
import './css/App.css';
import Pagination from "react-js-pagination"
import EnterModal from './components/EnterModal';
import "../src/css/Modal.css"

const Paging = () => {
    //새로 렌더링 될 때 다시 false 상태로 돌아감! 
    let tmp_len = 20;
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = (i) => {
        let enterModal = document.getElementById({i})
    };
    const closeModal = () => {
        //setModalOpen(false);
    };

    let tmplist = [];
    for (let i = 0; i < tmp_len; i++) {
        tmplist.push([<>
            <div className="room" key={i}>
                <div className='room-header' onClick={openModal}></div>
                <div className='room-body'>testroom</div>
                <div className='room-footer'>
                    <FontAwesomeIcon icon={faEye} /> {i * 100}
                </div>
            </div>
            <EnterModal open={false} close={closeModal} header="방 입장하기"></EnterModal>
        </>])
    }

    const [rooms] = useState(tmplist)
    const [currentRooms, setCurrentRooms] = useState([])
    // 첫 렌더링 시 setCurrentRooms에 의해 currentRooms의 상태가 변하므로 렌더링이 추가로 1회 일어난다.
    const [page, setPage] = useState(1);
    const handlePageChange = (page) => {
        setPage(page);
    };

    const [roomPerPage] = useState(2)
    const indexOfLastRoom = page * roomPerPage
    const indexOfFirstRoom = indexOfLastRoom - roomPerPage

    useEffect(() => {
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom))
    }, [indexOfFirstRoom, indexOfLastRoom, page, rooms])


    return (<>
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