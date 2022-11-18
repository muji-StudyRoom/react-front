import React, { useContext, useState, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './page/MainPage';
import MeetingPage from './page/MeetingPage'

// export const SetRoomContext = createContext(() => {})

// !! route 경로에 /meeting 을 제거해야 함 -> 직접적인 접근 제한 ?? 해당 코드 삭제 시 modal 창에서 navigate로 meeting으로 이동할 수 있을 지 확인해보아야 함
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/meeting' element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;