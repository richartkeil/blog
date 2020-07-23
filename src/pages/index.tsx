import React from "react"
import { PageProps, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Post from "../components/post"
import UpcomingPost from "../components/upcomingPost"
import SignupForm from "../components/signupForm"
import { rhythm } from "../utils/typography"

type Data = {
  site: {
    siteMetadata: {
      title: string
    }
  }
  allMarkdownRemark: {
    edges: {
      node: {
        excerpt: string
        frontmatter: {
          title: string
          date: string
          description: string
        }
        fields: {
          slug: string
          readingTime: {
            text: string
          }
        }
      }
    }[]
  }
}

const BlogIndex = ({ data, location }: PageProps<Data>) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />
      <UpcomingPost
        title="How to build an event log system with Google Firebase Firestore"
        date="July 30th, 2020"
      />
      {posts.map(({ node }) => (
        <Post
          title={node.frontmatter.title}
          slug={node.fields.slug}
          excerpt={node.frontmatter.description || node.excerpt}
          readingTime={node.fields.readingTime.text}
          date={node.frontmatter.date}
          key={node.fields.slug}
        />
      ))}
      <p
        style={{ textAlign: "center", opacity: 0.5, marginTop: rhythm() }}
      >
        Looks like you've reached the end :)
      </p>
      <SignupForm />
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
            readingTime {
              text
            }
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
