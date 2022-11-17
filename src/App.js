import React, { useContext, useState, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './page/MainPage';
import MeetingPage from './page/MeetingPage'

export const RoomContext = createContext();

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