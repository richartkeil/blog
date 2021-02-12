import { graphql, PageProps } from "gatsby"
import React from "react"
import Bio from "../components/bio"
import Category from "../components/category"
import Layout from "../components/layout"
import Post from "../components/post"
import SEO from "../components/seo"
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
          category: string
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
  const category = location.search.match(/category=(.+)/)?.[1]

  return (
    <Layout title={siteTitle} root>
      <SEO title="Articles about Software and Humans" />
      <Bio />
      <SignupForm />
      <Category />
      {/* <UpcomingPost
        title="How to build a team based user management system in Firebase"
        date="September 13th, 2020"
      /> */}
      {posts
        .filter(
          post => !category || post.node.frontmatter.category === category
        )
        .map(({ node }) => (
          <Post
            title={node.frontmatter.title}
            slug={node.fields.slug}
            excerpt={node.frontmatter.description || node.excerpt}
            readingTime={node.fields.readingTime.text}
            date={node.frontmatter.date}
            key={node.fields.slug}
          />
        ))}
      <p style={{ textAlign: "center", opacity: 0.5, marginTop: rhythm() }}>
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
            category
          }
        }
      }
    }
  }
`
