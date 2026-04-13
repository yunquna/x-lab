# 油猴脚本靶场测试页 (Tampermonkey Playground)

本页面专用于油猴脚本 (Tampermonkey) 的内部分发与演示测试。
当您在本页面下方安装了专属的 Demo 脚本后，它应当会自动改变页面上某个靶心按钮的样子，并在区域内予以反馈。

## 📥 步骤 1：安装与体验

> [!CAUTION]  
> 必须确保您的浏览器已经安装了 [Tampermonkey 扩展程序](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) 后，方可进行这一步。

您不仅可以点击安装我们内置的例子：**[👉 点击直接安装内置 Demo 脚本](/scripts/hello-world.user.js)** 

**或者，您也可以在这个内置的代码编辑器中，自由修改脚本内容并一键安装：**

<script setup>
import { ref } from 'vue'

const tmCode = ref(`// ==UserScript==
// @name         自定义内测脚本试玩 (Playground)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  在编辑器中动态安装体验
// @author       YQNUS-X-Lab
// @include      *tampermonkey-test*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // 我们在这里加一个明显的对话框
    alert('从编辑器自定义的脚本执行成功拉！😎');
    
    // 如果你有更多的业务逻辑，可以大胆修改这部分进行测试
    const btn = document.getElementById('tm-test-target');
    if(btn) {
        btn.textContent = '被自定义脚本挟持成功~';
        btn.style.backgroundColor = '#faad14';
        btn.style.borderColor = '#faad14';
    }
})();`)

function installTM() {
  navigator.clipboard.writeText(tmCode.value).then(() => {
    alert('✅ 脚本代码已成功复制到剪贴板！\n\n受限于浏览器安全策略，动态生成的脚本无法一键自动安装。\n\n请点击浏览器右上角的油猴图标 -> 【添加新脚本】 -> 将刚刚复制的代码粘贴进去并保存 (Ctrl+S) 即可生效。');
  }).catch(err => {
    console.error('复制失败', err);
    alert('复制失败，请手动全选上方代码并复制。');
  });
}
</script>

<div style="margin: 15px 0;">
  <textarea v-model="tmCode" style="width:100%; height:200px; font-family:monospace; padding: 10px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
  <br>
  <button 
    @click="installTM" 
    style="background-color:#10b981; color:white; padding:10px 20px; font-weight: bold; border:none; border-radius:4px; cursor:pointer; margin-top: 10px;"
  >
    📋 复制我的特制代码（去油猴手动添加）
  </button>
</div>

*无论是直接安装还是编辑器安装，完成后，请主动刷新当前这个页面，观察是否生效。*

---

## 🎯 步骤 2：交互靶场观察区 (Target UI)

<div style="border: 2px dashed #999; padding: 20px; border-radius: 8px; background: #fafafa;">
  <h3>我是脚本需要干涉的区域</h3>
  <p>如果没有脚本在运行，下方就是一个普普通通的灰色按钮。如果有脚本在运行，它的样式文案会发生改变。</p>
  
  <div id="tm-status-area"></div>
  <button id="tm-test-target" style="padding: 10px 20px; font-size: 14px; background: #e0e0e0; border: 1px solid #ccc; cursor: pointer; border-radius: 4px;">我是待改造的原生按钮！点我是没用的！</button>
</div>

<br>
<hr>

> [!NOTE]  
> 更多有关油猴（Tampermonkey）的指令获取机制和内部教程，请转移回主线的 [教程：油猴的入门与AI结合指南](../tutorials/tampermonkey-intro.md) 进行阅读。
