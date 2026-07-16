"use client"

import * as React from "react"

/**
 * VERY-LIGHTWEIGHT PLACEHOLDER
 * ----------------------------
 * The original Chart component wasn’t needed for the current site.
 * This stub keeps any existing imports working so that the build succeeds.
 * You can safely extend or replace it later with your preferred charting library.
 */

export const ChartContainer = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
)

export const ChartTooltip = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
)

/* eslint-disable react/display-name */
export const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />,
)

export const ChartLegend = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
)

export const ChartLegendContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />,
)
/* eslint-enable react/display-name */

export const ChartStyle = () => null
