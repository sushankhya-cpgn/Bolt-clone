import './App.css'
import Chatpage from "../pages/ChatPage"
import AppBuilder from "../pages/AppBuilder"

import { BrowserRouter, Route, Routes } from 'react-router-dom'


function App() {
 
  return (
  
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Chatpage />} />
      <Route path="/:id" element={<AppBuilder/>}/>
    </Routes>
  </BrowserRouter>

  )
}

export default App


