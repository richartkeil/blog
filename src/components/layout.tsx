import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { Helmet } from "react-helmet"

const Layout: React.FC<{ title: string; root?: boolean }> = ({
  title,
  root,
  children,
}) => {
  let header

  if (root) {
    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          fontFamily: `Montserrat, sans-serif`,
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>{children}</main>
      <footer
        style={{
          textAlign: "center",
          marginTop: rhythm(2),
          opacity: 0.5,
        }}
      >
        © {new Date().getFullYear()} Richard Keil (with ❤️ for{" "}
        <a href="https://www.gatsbyjs.org">Gatsby</a>) |{" "}
        <Link to="/imprint">Imprint</Link> | <Link to="/privacy">Privacy</Link>
      </footer>
    </div>
  )
}

export default Layout
