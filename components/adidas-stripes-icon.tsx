import type * as React from "react"
import { cn } from "@/lib/utils"

interface AdidasStripesIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

export function AdidasStripesIcon({ className, ...props }: AdidasStripesIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 50"
      className={cn("w-24 h-12 fill-current text-black dark:text-white", className)}
      {...props}
    >
      {/* Three skewed rectangles for Adidas stripes */}
      <rect x="0" y="0" width="25" height="50" transform="skewX(-20)" />
      <rect x="35" y="0" width="25" height="50" transform="skewX(-20)" />
      <rect x="70" y="0" width="25" height="50" transform="skewX(-20)" />
    </svg>
  )
}
