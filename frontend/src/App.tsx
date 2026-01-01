import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout"
import Home from "./pages/home"
import Onboarding from "./pages/onboarding"
import Learning from "./pages/learning"
import Quiz from "./pages/quiz"
import Profile from "./pages/profile"
import About from "./pages/about"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="onboarding/level" element={<Onboarding />} />
          <Route path="learn/:level/:module" element={<Learning />} />
          <Route path="quiz/:level/:module" element={<Quiz />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
