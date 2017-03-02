import React from 'react'

export default function Header() {
  return (
    <div className="header">
      <div className="navbar navbar-fixed-top">
        <div className="container">
          <nav>
            <ul className="nav nav-pills pull-right">
              <li>
                <a href="#examples">Examples</a>
              </li>
              <li>
                <a href="#license">License</a>
              </li>
            </ul>
          </nav>

          <h1>
            React Mentions
            <small>
              Brought to you by <a href="http://www.effektif.com">Effektif</a>
            </small>
          </h1>
        </div>
      </div>
    </div>
  )
}
