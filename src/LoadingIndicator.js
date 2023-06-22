import React from 'react'
import useStyles from 'substyle'

function LoadingIndicator({ style, className, classNames }) {
  const styles = useStyles(defaultstyle, { style, className, classNames })
  const spinnerStyles = styles('spinner')


  const lineStyle = {
    borderRadius: '1.25rem',
    height: '0.5rem',
    marginBottom: '0.5rem',
    background:
      'linear-gradient(to right, #99A0A3 0%, #707679 20%, #464A4D 40%, #464A4D 60%, #707679 80% , #99A0A3 100%)',
    backgroundSize: '1000px',
    animation: 'placeholderShimmer 1.2s infinite linear',
    amimationFillMode: 'forwards'
  };

  function LoadingUserItem() {
    return (
      <div style={{ display: 'flex', padding: '1rem', alignItems: 'center' }}>
        <div
          style={{
            background: lineStyle.background,
            backgroundSize: lineStyle.backgroundSize,
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            animation: lineStyle.animation
          }}
        />
        <div
          style={{
            display: 'block',
            alignItems: 'center',
            marginLeft: '0.5rem'
          }}
        >
          <div style={{ ...lineStyle, width: '12rem' }} />
          <div style={{ ...lineStyle, width: '10rem' }} />
          <div style={{ ...lineStyle, width: '8rem' }} />
        </div>
      </div>
    );
  }
  return (
    <div {...styles}>
      <div {...spinnerStyles}>
        <>
          {[...Array(4)].map((ele) => (
            <LoadingUserItem key={ele} />
          ))}
        </>
        {/* <div {...spinnerStyles(['element', 'element1'])} />
        <div {...spinnerStyles(['element', 'element2'])} />
        <div {...spinnerStyles(['element', 'element3'])} />
        <div {...spinnerStyles(['element', 'element4'])} />
        <div {...spinnerStyles(['element', 'element5'])} /> */}
      </div>
    </div>
  )
}

const defaultstyle = {}

export default LoadingIndicator
