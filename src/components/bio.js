import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import styled from "styled-components"

import { rhythm } from "../utils/typography"

const BioContainer = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 450px) {
    flex-direction: column;
    align-items: center;
  }
`

const ProfileImage = styled(Image)`
  margin-right: ${rhythm(1 / 2)};
  margin-bottom: 0;
  min-width: 80px;
  border-radius: 100%;
  @media (max-width: 450px) {
    margin-bottom: ${rhythm(1 / 2)};
  }
`

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
    <BioContainer>
      <ProfileImage
        fixed={data.avatar.childImageSharp.fixed}
        alt="Richard Keil"
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <div>
        Trying to craft articles like little tasty pieces of knowledge — written
        to understand things and become better at explaining them.
        <div>
          <a href="https://github.com/richartkeil">Github</a> •{" "}
          <a href="https://www.instagram.com/richartkeil/">Art on Instagram</a> •{" "}
          <a href="https://twitter.com/richartkeil">Twitter</a>
        </div>
      </div>
    </BioContainer>
  )
}

export default Bio
