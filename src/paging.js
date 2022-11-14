import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons"
import './paging.css';
import './App.css';
import Pagination from "react-js-pagination";

const Paging = () => {
    const tmp = []
    for (let i = 0; i < 20; i++) {
        tmp.push(<div className="room" key={i}>
            <div className='room-header'></div>
            <div className='room-body'>EBS {i}타 강사</div>
            <div className='room-footer'>
                <FontAwesomeIcon icon={faEye} /> {i * 100}
            </div>
        </div>)
    }
    const [rooms, setRooms] = useState(tmp)
    const [currentRooms, setCurrentRooms] = useState([])
    const [page, setPage] = useState(1);
    const handlePageChange = (page) => {
        setPage(page);
    };
    const [roomPerPage] = useState(5)
    const indexOfLastRoom = page * roomPerPage
    const indexOfFirstRoom = indexOfLastRoom - roomPerPage

    useEffect(() => {
        setCurrentRooms(rooms.slice(indexOfFirstRoom, indexOfLastRoom))
    }, [indexOfFirstRoom, indexOfLastRoom, page])

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