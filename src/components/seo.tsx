import React from "react"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

interface Props {
  description: string
  lang: string
  meta: {
    name: string
    content: string
  }[]
  title: string
  image?: string
  noIndex?: boolean
}

const SEO: React.FunctionComponent<Props> = props => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  )

  const metaDescription = props.description || site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={{
        lang: props.lang,
      }}
      title={props.title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: props.title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        ...(props.image
          ? [
              {
                name: `og:image`,
                content: props.image,
              },
            ]
          : []),
        {
          name: `twitter:card`,
          content: props.image ? `summary_large_image` : `summary`,
        },
        {
          name: `twitter:creator`,
          content: "richartkeil",
        },
        {
          name: `twitter:title`,
          content: props.title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
        ...(props.image
          ? [
              {
                name: `twitter:image`,
                content: props.image,
              },
            ]
          : []),
        ...(props.noIndex
          ? [
              {
                name: `robots`,
                content: `noindex, follow`,
              },
            ]
          : []),
      ].concat(props.meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

export default SEO
