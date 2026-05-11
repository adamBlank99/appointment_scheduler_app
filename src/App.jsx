import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NewAppointment from "./pages/NewAppointment"
import EditAppointment from "./pages/EditAppointment"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewAppointment />} />
        <Route path="/edit/:id" element={<EditAppointment />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App