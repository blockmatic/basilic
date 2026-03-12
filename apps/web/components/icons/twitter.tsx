import type { SVGProps } from 'react'

export function Twitter({ width = 24, height = 24, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m4 4l11.733 16H20L8.267 4zm0 16l6.768-6.768m2.46-2.46L20 4"
      />
    </svg>
  )
}
