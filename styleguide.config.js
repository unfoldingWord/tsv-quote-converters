const webpack = require('webpack');
const path = require('path');
const { styles, theme } = require('./styleguide.styles');
const pkg = require('./package.json');

module.exports = {
  title: `TSV Quote Converters v${pkg.version}`,
  theme: theme,
  styles: styles,
  ribbon: {
    url: 'https://github.com/unfoldingWord/tsv7-ult-quotes-to-origl-quotes',
    text: 'View code on GitHub'
  },
  styleguideDir: 'styleguide',
  assetsDir: 'public',
  template: {
    head: {
      links: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: 'favicon.svg'  // Remove leading slash
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'  // Replace with your desired Font Awesome version 
        }
      ]
    }
  },
  components: 'src/components/**/*.js',
  sections: [
    {
      name: 'Core Functions',
      sections: [
        {
          name: 'addGLQuoteCols',
          content: 'src/docs/AddGLQuoteCols.md',
        },
        {
          name: 'convertGLQuotes2OLQuotes',
          content: 'src/docs/ConvertGLQuotes2OLQuotes.md',
        },
      ],
    },
    {
      name: 'Other uses',
      sections: [
        {
          name: 'Round Trip (OL->GL->OL) (Quote Cleanup)',
          content: 'src/docs/QuoteRoundTrip.md',
        }
      ]
    }
  ],
  exampleMode: 'expand', // 'hide' | 'collapse' | 'expand'
  usageMode: 'expand', // 'hide' | 'collapse' | 'expand'
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(png|jpg|gif|svg|ico)$/,
          type: 'asset/resource'
        }
      ],
    },
    resolve: {
      fallback: {
        buffer: require.resolve('buffer/'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
};