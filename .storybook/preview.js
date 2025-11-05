import '../src/index.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },

  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
    sort: 'requiredFirst',
  },

  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#1a1a1a',
      },
      {
        name: 'gray',
        value: '#f5f5f5',
      },
    ],
  },

  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
        type: 'mobile',
      },
      mobileLarge: {
        name: 'Mobile Large',
        styles: {
          width: '414px',
          height: '896px',
        },
        type: 'mobile',
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
        type: 'tablet',
      },
      laptop: {
        name: 'Laptop',
        styles: {
          width: '1366px',
          height: '768px',
        },
        type: 'desktop',
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1920px',
          height: '1080px',
        },
        type: 'desktop',
      },
    },
  },

  // Accessibility addon configuration
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'link-name',
          enabled: true,
        },
      ],
    },
    options: {
      checks: { 'color-contrast': { options: { noScroll: true } } },
      restoreScroll: true,
    },
  },

  // Layout configuration
  layout: 'centered',

  // Chromatic configuration for visual testing
  chromatic: {
    delay: 300,
    viewports: [320, 768, 1024, 1920],
    diffThreshold: 0.2,
  },
}

// Global decorators
export const decorators = [
  (Story) => (
    <div style={{ padding: '1rem' }}>
      <Story />
    </div>
  ),
]

// Global types for toolbar customization
export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
      showName: true,
      dynamicTitle: true,
    },
  },
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'es', title: 'Español' },
        { value: 'fr', title: 'Français' },
        { value: 'zh', title: '中文' },
      ],
      showName: true,
    },
  },
}

// Order stories
export const options = {
  storySort: {
    order: [
      'Introduction',
      'Getting Started',
      'Components',
      ['Basics', 'Forms', 'Layout', 'Feedback'],
      'Features',
      'Pages',
      '*',
    ],
  },
}
