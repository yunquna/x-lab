import DefaultTheme from 'vitepress/theme'
import PluginMarket from './components/PluginMarket.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PluginMarket', PluginMarket)
  }
}
