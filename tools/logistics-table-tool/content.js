/**
 * 物流数据自动叉车 - 内容脚本
 * 功能：在网页表格右上角添加导出 CSV 按钮
 */

(function() {
    console.log('物流数据自动叉车已激活...');

    function injectExportButtons() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach((table, index) => {
            // 防止重复注入或用户已手动关闭
            if (table.dataset.forkliftInjected === 'true' || table.dataset.forkliftClosed === 'true') return;
            table.dataset.forkliftInjected = 'true';

            // 确保容器相对定位，以便按钮定位
            const parent = table.parentElement;
            if (getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }

            // 创建工具栏容器
            const toolbar = document.createElement('div');
            toolbar.className = 'forklift-toolbar';

            // 创建下载按钮
            const exportBtn = document.createElement('button');
            exportBtn.className = 'forklift-export-btn';
            exportBtn.innerHTML = '<i></i> 导出 Excel (CSV)';
            exportBtn.title = '点击导出当前表格数据';
            
            // 点击事件：提取并下载
            exportBtn.onclick = (e) => {
                e.preventDefault();
                exportTableToCSV(table);
            };

            // 创建关闭按钮
            const closeBtn = document.createElement('button');
            closeBtn.className = 'forklift-close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.title = '关闭此表格的导出按钮';
            
            // 点击事件：关闭并记录状态
            closeBtn.onclick = (e) => {
                e.preventDefault();
                table.dataset.forkliftClosed = 'true';
                toolbar.style.display = 'none';
            };

            toolbar.appendChild(exportBtn);
            toolbar.appendChild(closeBtn);

            // 插入到表格上方或包装容器内
            parent.insertBefore(toolbar, table);
        });
    }

    function exportTableToCSV(table) {
        let csvContent = "\uFEFF"; // UTF-8 BOM，解决 Excel 打开乱码
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            cols.forEach(col => {
                // 清理文本内容，去除换行和多余空格
                let text = col.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
                // 处理 CSV 中的引号转义
                text = text.replace(/"/g, '""');
                rowData.push(`"${text}"`);
            });
            csvContent += rowData.join(',') + "\r\n";
        });

        // 触发下载
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Logistics_Data_${dateStr}_${Math.floor(Math.random()*100)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 初始注入
    injectExportButtons();

    // 监听动态加载的表格（如单页面应用 WMS）
    const observer = new MutationObserver((mutations) => {
        injectExportButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
