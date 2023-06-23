import * as React from 'react'
import { lineStyle } from '../style'

export function LoadingUserItem() {
  return (
    <div
      style={{
        display: 'flex',
        padding: '1rem',
        alignItems: 'center',
        // @todo: remove the below color
        // purpose was to just test the code
        background: 'red',
      }}
    >
      <div
        style={{
          background: lineStyle.background,
          backgroundSize: lineStyle.backgroundSize,
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          animation: lineStyle.animation,
        }}
      />
      <div
        style={{
          display: 'block',
          alignItems: 'center',
          marginLeft: '0.5rem',
        }}
      >
        <div style={{ ...lineStyle, width: '12rem' }} />
        <div style={{ ...lineStyle, width: '10rem' }} />
        <div style={{ ...lineStyle, width: '8rem' }} />
      </div>
    </div>
  )
}
