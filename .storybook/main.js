module.exports = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
    '@storybook/addon-themes',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: 'tag',
  },

  staticDirs: ['../public'],

  core: {
    builder: '@storybook/builder-vite',
  },

  async viteFinal(config) {
    const { mergeConfig } = require('vite')

    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': '/src',
          '@components': '/src/components',
          '@utils': '/src/utils',
          '@hooks': '/src/hooks',
          '@store': '/src/store',
          '@services': '/src/services',
          '@types': '/src/types',
          '@assets': '/src/assets',
        },
      },
    })
  },

  // Babel configuration for older browsers if needed
  babel: async (options) => ({
    ...options,
    presets: [
      ...options.presets,
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
        },
      ],
    ],
  }),

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
}
