// ==UserScript==
// @name         Hello YQNUS-X-Lab Demo
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  A demonstration script for YQNUS-X-Lab internal tutorial. It injects a congratulation banner when visiting the playground.
// @author       YQNUS-X-Lab
// @include      *tampermonkey-test*
// @grant        none
// ==/UserScript==

(function() {
    'use script';

    // 延时等待页面框架加载，或者使用 DOMContentLoaded
    window.addEventListener('load', () => {
        const targetBtn = document.getElementById('tm-test-target');
        const statusArea = document.getElementById('tm-status-area');
        
        if (targetBtn && statusArea) {
            // 修改页面的 UI 元素证明脚本正在工作
            statusArea.innerHTML = `
                <div style="padding: 15px; margin: 15px 0; background-color: #e6f7ff; border-left: 4px solid #1890ff; color: #0050b3; border-radius: 4px;">
                    <strong>🎉 恭喜！</strong>
                    您的 Tampermonkey 脚本【Hello YQNUS-X-Lab Demo】已成功在此页面生效。
                </div>
            `;
            
            targetBtn.textContent = '我是被脚本改造过的按钮！';
            targetBtn.style.backgroundColor = '#52c41a';
            targetBtn.style.borderColor = '#52c41a';
            targetBtn.style.color = '#fff';
            
            targetBtn.addEventListener('click', () => {
                alert('Tampermonkey 脚本为您带来了特别点击事件！');
            });
            
            console.log("X-Lab Demo Tampermonkey 脚本运行完毕。");
        }
    });

})();
