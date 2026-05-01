import { Routes, Route } from "react-router-dom";
import StatsPage from "./pages/EntryPage";
import ManagementPage from "./pages/ManagementPage";

import './App.css';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<StatsPage/>}/>
        <Route path="/manage" element={<ManagementPage/>}/>
      </Routes>
    </div>
  )
}

export default App;