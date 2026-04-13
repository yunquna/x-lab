import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "YQNUS-X-Lab 实验室",
  description: "内部小工具、脚本、教学研发与试验分享的专属平台",
  base: '/x-lab/', 
  ignoreDeadLinks: true, 
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '教程 (Tutorials)', link: '/tutorials/tech_prompt' },
      { text: '工具 (Tools)', link: '/tools/' },
      { text: '试验场 (Playground)', link: '/playground/' }
    ],

    sidebar: {
      '/tutorials/': [
        {
          text: '教程模块',
          items: [
            { text: 'AI 指令兵器库 (Tech Prompt)', link: '/tutorials/tech_prompt' },
            { text: '开发与应用实录 (1:1演示)', link: '/tutorials/operation-records/README' },
            { text: '油猴入门与AI结合指南', link: '/tutorials/tampermonkey-intro' }
          ]
        }
      ],
      '/tools/': [
        {
          text: '发布的工具',
          items: [
            { text: '物流配载数据工具', link: '/tools/logistics-table-tool' }
          ]
        }
      ],
      '/playground/': [
        {
          text: '概念与测试项目',
          items: [
            { text: '网页表格导出器', link: '/playground/table-exporter' },
            { text: '油猴脚本安装与测试靶场', link: '/playground/tampermonkey-test' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yunquna/x-lab' }
    ],

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    
    outlineTitle: '本页目录',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '深浅模式切换'
  }
})
