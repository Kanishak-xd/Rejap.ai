import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/ui/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

interface Level {
  id: string
  title: string
  order: number
}

interface Module {
  id: string
  title: string
  levelId: string
  level: {
    id: string
    title: string
    order: number
  }
}

interface User {
  id: string
  email: string
  name: string | null
  profileImage: string | null
  levelStatus: any[]
  currentLevel: {
    id: string
    title: string
    order: number
  } | null
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchLevels()

    // Refresh auth state when window regains focus (e.g., after OAuth redirect)
    const handleFocus = () => {
      checkAuth()
    }
    window.addEventListener('focus', handleFocus)

    // Also check on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Refresh auth state when location changes (e.g., after OAuth redirect back to app)
  useEffect(() => {
    checkAuth()
  }, [location.pathname])

  useEffect(() => {
    if (user) {
      fetchModules()
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/me`, {
        credentials: "include",
        cache: 'no-store', // Ensure we get fresh data
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // If not authenticated, clear user state
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${API_BASE}/levels`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setLevels(data.sort((a: Level, b: Level) => a.order - b.order))
      }
    } catch (error) {
      console.error("Failed to fetch levels:", error)
    }
  }

  const fetchModules = async () => {
    try {
      const allModules: Module[] = []
      for (const level of levels) {
        const response = await fetch(
          `${API_BASE}/modules?levelId=${level.id}`,
          { credentials: "include" }
        )
        if (response.ok) {
          const data = await response.json()
          allModules.push(...data)
        }
      }
      setModules(allModules)
    } catch (error) {
      console.error("Failed to fetch modules:", error)
    }
  }

  const handleSignIn = () => {
    // Use the general signin page - it will show the Google provider option
    window.location.href = `${API_BASE}/auth/signin`
  }

  const handleSignOut = () => {
    // Auth.js signout endpoint works with GET - it will sign out and redirect
    // Clear user state immediately for better UX
    setUser(null)
    // Redirect to signout endpoint - Auth.js will handle the logout and redirect back
    window.location.href = `${API_BASE}/auth/signout`
  }

  const scrollToFeatures = () => {
    navigate("/")
    setTimeout(() => {
      const element = document.getElementById("features")
      element?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Build navigation links for mobile
  const mobileNavItems = [
    {
      name: "Menu",
      items: [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
      ],
    },
    {
      name: "Levels",
      items: levels.map((level) => ({
        href: `/learn/${level.id}`,
        label: level.title,
      })),
    },
    {
      name: "Modules",
      items: modules.map((module) => ({
        href: `/learn/${module.levelId}/${module.id}`,
        label: `${module.level.title} - ${module.title}`,
      })),
    },
  ]

  // Desktop navigation structure
  const desktopNavItems = [
    { href: "/learning-path", label: "Learning Path", active: location.pathname === "/learning-path" },
    { href: "/about", label: "About", active: location.pathname === "/about" },
  ]

  return (
    <header className="container mx-auto flex h-14 items-center justify-between gap-4 border-b relative z-50 bg-background sticky top-0 px-4">
      <div className="flex items-center justify-start gap-2">
        <MobileNav
          nav={mobileNavItems}
          user={user}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
        />

        <Link to="/" className="dark:hover:bg-accent text-accent-foreground px-4 py-0.5 rounded-sm">
          <span className="text-lg font-bold font-['Roboto']">rejap.ai</span>
        </Link>
      </div>

      <NavigationMenu className="max-md:hidden relative z-50" viewport={true}>
        <NavigationMenuList>
          {user ? (
            desktopNavItems.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  asChild
                  data-active={link.active}
                  className={cn(
                    "rounded-sm px-3 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    link.active && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link to={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))
          ) : (
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/about"
                asChild
                className="rounded-xs px-3 py-1.5 font-medium"
              >
                <Link to="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        {loading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-3 py-1.5 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user.name || user.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <button
              onClick={scrollToFeatures}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Features
            </button>
            <button
              onClick={handleSignIn}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </header>
  )
}

