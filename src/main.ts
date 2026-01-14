import { createSSRApp } from 'vue';
import App from '@/App.vue';
import setupPlugins from '@/plugins';
// 引入UnoCSS
import 'virtual:uno.css';
// 引入 vconsole
import VConsole from 'vconsole'
// 初始化，一行代码即可开启
new VConsole()

export function createApp() {
  const app = createSSRApp(App);
  app.use(setupPlugins);

  return {
    app,
  };
}
