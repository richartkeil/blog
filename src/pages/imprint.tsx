import React from "react"
import { PageProps, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

type Data = {
  site: {
    siteMetadata: {
      title: string,
      siteUrl: string
    }
  }
}

const Imprint = ({ data, location }: PageProps<Data>) => {
  const site = data.site.siteMetadata

  return (
    <Layout location={location} title={site.title}>
      <SEO title="Imprint" />
      <h1>Legal Disclosure</h1>
      <p>Information in accordance with Section 5 TMG</p>
      <p>
        Richard Keil
        <br />
        {process.env.GATSBY_ADDRESS}
      </p>
      <h2>Contact Information</h2>
      <p>
        Telephone: {process.env.GATSBY_PHONE}
        <br />
        Website: {site.siteUrl}
        <br />
        E-Mail: {process.env.GATSBY_EMAIL}
      </p>
      <h2>Disclaimer</h2>
      <h3>Accountability for content</h3>
      The contents of our pages have been created with the utmost care. However,
      we cannot guarantee the contents' accuracy, completeness or topicality.
      According to statutory provisions, we are furthermore responsible for our
      own content on these web pages. In this matter, please note that we are
      not obliged to monitor the transmitted or saved information of third
      parties, or investigate circumstances pointing to illegal activity. Our
      obligations to remove or block the use of information under generally
      applicable laws remain unaffected by this as per §§ 8 to 10 of the
      Telemedia Act (TMG).
      <h3>Accountability for links</h3>
      Responsibility for the content of external links (to web pages of third
      parties) lies solely with the operators of the linked pages. No violations
      were evident to us at the time of linking. Should any legal infringement
      become known to us, we will remove the respective link immediately.
      <h3>Copyright</h3>
      Our web pages and their contents are subject to German copyright law.
      Unless expressly permitted by law, every form of utilizing, reproducing or
      processing works subject to copyright protection on our web pages requires
      the prior consent of the respective owner of the rights. Individual
      reproductions of a work are only allowed for private use. The materials
      from these pages are copyrighted and any unauthorized use may violate
      copyright laws.
    </Layout>
  )
}

export default Imprint

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
  }
`
