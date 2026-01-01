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
}

export function MobileNav({ nav }: MobileNavProps) {
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
            <nav className="flex flex-col gap-4">
              {nav.map((section) => (
                <div key={section.name}>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    {section.name}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm hover:bg-accent"
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
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

