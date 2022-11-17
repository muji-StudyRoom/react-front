import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons"
import './css/paging.css';
import './css/App.css';
import Pagination from "react-js-pagination";
import { RoomContext } from "./App";


const Paging = () => {


    const {rooms, setRooms} = useContext(RoomContext)

    console.log(rooms)

    const [currentRooms, setCurrentRooms] = useState(rooms)
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
    
    //currentRooms 대신 rooms 도입
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