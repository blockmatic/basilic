import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for icon.tsx
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#2dd4a8',
        borderRadius: 6,
        color: 'white',
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      B
    </div>,
    { ...size },
  )
}
