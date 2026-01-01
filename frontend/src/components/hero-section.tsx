import { Button, buttonVariants } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export default function HeroSection() {
  const navigate = useNavigate()

  const handleStartLearning = () => {
    // Check if user is authenticated
    fetch(`${API_BASE}/user/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          res.json().then((user) => {
            if (user.currentLevel === null) {
              navigate("/onboarding/level")
            } else {
              navigate("/learning-path")
            }
          })
        } else {
          // Not authenticated, trigger login
          window.location.href = `${API_BASE}/auth/signin`
        }
      })
      .catch(() => {
        window.location.href = `${API_BASE}/auth/signin`
      })
  }

  return (
    <section className="">
      <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-32 md:px-10 lg:px-32 xl:max-w-4xl">
        <h1 className="font-bold leading-tight text-3xl sm:text-5xl md:text-6xl dark:text-white">
          Master Japanese with <br className="hidden sm:block" />
          AI-Powered Learning
        </h1>
        <p className="mt-6 mb-10 text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-neutral-500 dark:text-neutral-400 max-w-2xl px-2">
          Personalized lessons, adaptive quizzes, and intelligent feedback to
          accelerate your Japanese learning journey.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={handleStartLearning}
            className="px-10 py-5 text-lg font-semibold rounded-md bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 hover:cursor-pointer"
          >
            Start Learning
          </Button>
          <Button
            className={buttonVariants({
              variant: "ghost",
              className:
                "border-1 border-neutral-600 bg-transparent text-black dark:text-white flex justify-center items-center text-center text-lg px-8 py-5 rounded-md",
            })}
            onClick={() => {
              const element = document.getElementById("features")
              element?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Explore Features
          </Button>
        </div>
      </div>
    </section>
  )
}

