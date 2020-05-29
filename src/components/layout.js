import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { Helmet } from "react-helmet"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
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
      <Helmet>
        <script src={process.env.GATSBY_OSANO_URL}></script>
      </Helmet>
      <header>{header}</header>
      <main>{children}</main>
      <footer style={{
        textAlign: "center",
        marginTop: rhythm(2),
        opacity: .5
      }}>
        © {new Date().getFullYear()} Richard Keil (with ❤️for{" "}
        <a href="https://www.gatsbyjs.org">Gatsby</a>) | <Link to="/imprint">Imprint</Link>
      </footer>
    </div>
  )
}

export default Layout
