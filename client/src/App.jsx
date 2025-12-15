import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Main from "./components/Main";
import WriteMail from "./components/WriteMail";
import Letter from "./components/Letter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/letter/:id" element={<Letter />} />
        <Route path="/write-mail" element={<WriteMail />} />
      </Routes>
    </Router>
  );
}

export default App;
