import './App.css'
import Chatpage from "../pages/ChatPage"
import AppBuilder from "../pages/AppBuilder"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Box } from '@mui/material'



function App() {
  return (
  <Box color='black' sx={{backgroundColor:"black", height:"100vh",boxSizing:"border-box"}}>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Chatpage />} />
      <Route path="/builder" element={<AppBuilder/>}/>
      <Route path="*" element={<p>Route Not Found</p>}/>

    </Routes>
  </BrowserRouter>
  </Box>

  )
}

export default App


