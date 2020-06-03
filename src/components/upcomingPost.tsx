import { Link } from "gatsby"
import React from "react"

import { rhythm } from "../utils/typography"

const UpcomingPost = (props: { title: string; date: string }) => {
  return (
    <div
      style={{
        padding: rhythm(1),
        marginTop: rhythm(1),
        borderRadius: `2px`,
        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='2' ry='2' stroke='%23ccc' stroke-width='2' stroke-dasharray='6%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
      }}
    >
      <header style={{ opacity: .5 }}>
        <h3
          style={{
            marginTop: 0,
            marginBottom: rhythm(1 / 4),
          }}
        >
          {props.title}
        </h3>
        <small>Upcoming ∙ {props.date}</small>
      </header>
    </div>
  )
}

export default UpcomingPost
