import { useLocation } from "@reach/router"
import { Link } from "gatsby"
import React from "react"
import styled from "styled-components"
import { rhythm } from "../utils/typography"

const Container = styled.div`
  margin-top: ${rhythm(1)};
  text-align: right;
`

const CategoryLink = styled(Link)`
  display: inline-block;
  margin-left: ${rhythm(0.3)};
  &.active {
    color: black;
  }
`

const Category = () => {
  const location = useLocation()
  const category = location.search.match(/category=(.+)/)?.[1]

  return (
    <Container>
      <CategoryLink to="/" className={!category && "active"}>
        All
      </CategoryLink>
      <CategoryLink
        to="/?category=tech"
        className={category === "tech" && "active"}
      >
        Tech
      </CategoryLink>
      <CategoryLink
        to="/?category=people"
        className={category === "people" && "active"}
      >
        People
      </CategoryLink>
    </Container>
  )
}

export default Category
