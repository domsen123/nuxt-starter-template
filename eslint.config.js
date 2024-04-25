// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['.nuxt', '.output'],
    vue: true,
    typescript: true,
    rules: {
      'node/prefer-global/process': 'off',
      'antfu/top-level-function': 'off',
      'no-console': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/no-v-html': 0,
      'vue/html-self-closing': ['error', {
        html: {
          void: 'any',
          normal: 'any',
          component: 'any',
        },
        svg: 'always',
        math: 'always',
      }],
    },
  },
)
