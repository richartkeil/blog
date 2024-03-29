import React from "react"
import { graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import SignupForm from "../components/signupForm"
import Post from "../components/post"
import Helmet from "react-helmet"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  return (
    <Layout title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
        image={post.frontmatter.image?.childImageSharp.fluid.src}
      />
      {post.frontmatter.canonical && (
        <Helmet
          link={[{ rel: "canonical", href: post.frontmatter.canonical }]}
        />
      )}
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date} • {post.fields.readingTime.text}
            {post.frontmatter.date_updated && (
              <> • Last updated {post.frontmatter.date_updated}</>
            )}
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr style={{ marginBottom: rhythm(1), marginTop: rhythm(1) }} />
        <p>
          Got thoughts on this?{" "}
          <a
            href={`mailto:hello@richartkeil.com?subject=Response to "${post.frontmatter.title}"`}
            target="_blank"
            rel="noreferrer"
          >
            Write me a response
          </a>
          !
        </p>
        <hr style={{ marginBottom: rhythm(1), marginTop: rhythm(1) }} />
        <footer>
          <Bio />
          <SignupForm />
        </footer>
      </article>

      {previous && (
        <>
          <h3>Previous Post:</h3>
          <Post
            title={previous.frontmatter.title}
            slug={previous.fields.slug}
            excerpt={previous.frontmatter.description || previous.excerpt}
            readingTime={previous.fields.readingTime.text}
            date={previous.frontmatter.date}
          />
        </>
      )}

      {next && (
        <>
          <h3>Next Post:</h3>
          <Post
            title={next.frontmatter.title}
            slug={next.fields.slug}
            excerpt={next.frontmatter.description || next.excerpt}
            readingTime={next.fields.readingTime.text}
            date={next.frontmatter.date}
          />
        </>
      )}
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        date_updated(formatString: "MMMM DD, YYYY")
        description
        canonical
        image {
          childImageSharp {
            fluid(maxWidth: 1000) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      fields {
        readingTime {
          text
        }
      }
    }
  }
`
