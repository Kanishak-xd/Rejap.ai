import * as React from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface NavItem {
  name: string
  items: { href: string; label: string }[]
}

interface MobileNavProps {
  nav: NavItem[]
  user: any | null
  onSignOut: () => void
  onSignIn: () => void
}

export function MobileNav({ nav, user, onSignOut, onSignIn }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X />
              </Button>
            </div>
            <nav className="flex flex-col gap-6 overflow-y-auto pb-8">
              {nav.map((section) => (
                <div key={section.name}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 px-3">
                    {section.name}
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent active:bg-accent/80"
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mt-4 pt-6 border-t border-border/50 px-3">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold truncate max-w-[180px]">{user.name || user.email}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button asChild variant="outline" className="justify-start h-11 rounded-xl" onClick={() => setOpen(false)}>
                        <Link to="/profile">View Profile</Link>
                      </Button>
                      <Button variant="destructive" className="justify-start h-11 rounded-xl" onClick={() => { onSignOut(); setOpen(false); }}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button className="w-full h-12 rounded-xl font-bold text-lg shadow-md" onClick={() => { onSignIn(); setOpen(false); }}>
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

