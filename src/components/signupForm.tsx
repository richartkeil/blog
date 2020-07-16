import { Link } from "gatsby"
import React from "react"

import { rhythm } from "../utils/typography"
import Button from "./button"

const SignupForm = () => {
  return (
    <div
      style={{
        marginTop: rhythm(),
        padding: rhythm(1),
        borderRadius: "2px",
        border: "1px solid #ddd",
        transform: "rotate(-.5deg)"
      }}
    >
      <h2 style={{ margin: 0 }}>Get notified about new posts</h2>
      <small>
        I'll send you a notification once per week if I've published new
        content. (<Link to="/privacy">Privacy</Link>)
      </small>
      <form
        action={process.env.GATSBY_MAILCHIMP_SIGNUP_URL}
        method="post"
        style={{
          display: "flex",
          margin: 0,
          marginTop: rhythm(1 / 2),
        }}
      >
        <input
          type="email"
          name="EMAIL"
          placeholder="Your email"
          style={{
            width: "100%",
            marginRight: "8px",
            padding: "5px 10px",
            border: "1px solid #777",
            borderRadius: "2px"
          }}
        />
        <Button type="submit">Subscribe</Button>
      </form>
    </div>
  )
}

export default SignupForm
