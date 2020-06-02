import { Link } from "gatsby"
import React from "react"

import { rhythm } from "../utils/typography"

const Post = (props: {
  title: string
  slug: string
  date: string
  readingTime: string
  excerpt: string
}) => {
  return (
    <article
      style={{
        padding: rhythm(1),
        marginTop: rhythm(1),
        borderRadius: "2px",
        border: "1px solid #ddd",
      }}
    >
      <header>
        <h3
          style={{
            marginTop: 0,
            marginBottom: rhythm(1 / 4),
          }}
        >
          <Link style={{ boxShadow: `none` }} to={props.slug}>
            {props.title}
          </Link>
        </h3>
        <small>
          {props.date} ∙ {props.readingTime}
        </small>
      </header>
      <section>
        <p
          style={{ marginBottom: 0 }}
          dangerouslySetInnerHTML={{
            __html: props.excerpt,
          }}
        />
      </section>
    </article>
  )
}

export default Post
