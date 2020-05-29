import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 80, height: 80) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)

  return (
    <div
      style={{
        display: `flex`,
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt="Richard Keil"
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 80,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <div>
        Trying to craft articles like little tasty pieces of knowledge — written
        to understand things and become better at explaining them.
        <div>
          <a href="https://github.com/richartkeil">Github</a> •{" "}
          <a href="https://www.instagram.com/richartkeil/">Instagram</a> •{" "}
          <a href="https://twitter.com/richartkeil">Twitter</a>
        </div>
      </div>
    </div>
  )
}

export default Bio
