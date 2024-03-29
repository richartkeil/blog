module.exports = {
  siteMetadata: {
    title: `Richard's Blog`,
    description: `Short articles I write to get a better understanding of topics including software and communication.`,
    siteUrl: `https://blog.richartkeil.com/`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              linkImagesToOriginal: false,
              showCaptions: true,
              markdownCaptions: true,
              wrapperStyle: `
                text-align: center;
                color: #0006;
                font-size: .8em;
                font-style: italic;
              `,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-external-links`,
          `gatsby-remark-embed-gist`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          `gatsby-remark-reading-time`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-plausible`,
      options: {
        domain: `blog.richartkeil.com`,
      },
    },
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Richard's Blog`,
        short_name: `Richard's Blog`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#111`,
        display: `minimal-ui`,
        icon: `content/assets/icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: [`/imprint`, `/privacy`],
      },
    },
    `gatsby-plugin-styled-components`,
  ],
}
