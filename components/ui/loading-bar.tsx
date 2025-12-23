"use client"

import { useEffect, useState, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

function LoadingBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // Instant feedback: Start loading on any internal link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Find closest anchor tag (handles clicks on child elements like icons/text)
      const link = target.closest('a')

      if (link && link.href) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)

        // Only start loader for internal navigation (same origin)
        // Ignore external links, hash links, and downloads
        if (
          url.origin === currentUrl.origin &&
          url.pathname !== currentUrl.pathname &&
          !link.hasAttribute('download') &&
          link.target !== '_blank'
        ) {
          setIsLoading(true)
        }
      }
    }

    // Use capture phase to catch clicks before other handlers
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  // Complete loading when navigation finishes (pathname changes)
  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-primary dark:via-primary/80 dark:to-primary z-50 origin-left shadow-[0_0_12px_rgba(59,130,246,0.5)] dark:shadow-glow"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
    </AnimatePresence>
  )
}

export function LoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBarInner />
    </Suspense>
  )
}
