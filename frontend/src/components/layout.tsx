import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./navbar"
import Footer from "./footer"
import LearningSidebar from "./learning-sidebar"
import LockedModuleModal from "./locked-module-modal"

export default function Layout() {
  const location = useLocation()
  const isLearningPage = location.pathname.startsWith('/learn') || location.pathname.startsWith('/quiz')

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {isLearningPage && <LearningSidebar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <LockedModuleModal />
      <Footer />
    </div>
  )
}

