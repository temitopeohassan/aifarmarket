"use client"

import { useEffect } from "react"

export function FarcasterMetaTags() {
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || "https://ecoguideminiapp.vercel.app"
    
    // Remove existing Farcaster meta tags if any
    const existingTags = document.querySelectorAll('meta[name^="fc:"]')
    existingTags.forEach(tag => tag.remove())

    // Add Farcaster meta tags
    const metaTags = [
      { name: "fc:frame", content: "vNext" },
      { name: "fc:frame:image", content: `${baseUrl}/og-image.png` },
      { name: "fc:frame:button:1", content: "Start Coaching" },
      { name: "fc:miniapp", content: "v1" },
    ]

    metaTags.forEach(({ name, content }) => {
      const meta = document.createElement("meta")
      meta.name = name
      meta.content = content
      document.head.appendChild(meta)
    })
  }, [])

  return null
}
