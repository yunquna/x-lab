/** table-exporter/content.js */
// 遵循 YAGNI：仅专注于实现提取、导出、关闭功能
// 遵循 SOLID：职能拆分为多个独立函数
// 遵循 KISS：无依赖的原生 JS DOM 操作
// 遵循 DRY：统一从单元格读取文本的逻辑

(function() {
    'use strict';

    // 防止同一个 table 被注入多次的标记属性
    const PROCESSED_ATTR = 'data-yq-exported';

    /**
     * 程序入口，初始化并监听新插入的表格
     */
    function init() {
        scanTables();
        
        // 使用简单的 MutationObserver 扫描后来动态添加的表格
        // 防抖函数可减少短时间内的重复扫描性能开销
        const observer = new MutationObserver(debounce(scanTables, 800));
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * 防抖函数（KISS）
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * 扫描全页面所有未处理的表格对象
     */
    function scanTables() {
        const tables = document.querySelectorAll(`table:not([${PROCESSED_ATTR}])`);
        tables.forEach(table => {
            // 给处理过的表格打上标记，保证单一表格仅处理一次
            table.setAttribute(PROCESSED_ATTR, 'true');
            injectToolbar(table);
        });
    }

    /**
     * 向表格旁注入含“导出”和“关闭”的工具栏
     */
    function injectToolbar(table) {
        // 创建最外层避免干涉表格内结构
        const container = document.createElement('div');
        container.className = 'yq-table-toolbar-container';

        const group = document.createElement('div');
        group.className = 'yq-table-toolbar-group';

        const exportBtn = document.createElement('button');
        exportBtn.className = 'yq-table-btn yq-table-btn-export';
        exportBtn.textContent = '导出 CSV';
        // 绑定导出事件
        exportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            exportTableToCSV(table);
        });

        const closeBtn = document.createElement('button');
        closeBtn.className = 'yq-table-btn yq-table-btn-close';
        closeBtn.textContent = '关闭';
        // 单击关闭按钮时直接隐藏/移除该工具栏，刷新后再次生效
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.remove();
        });

        group.appendChild(exportBtn);
        group.appendChild(closeBtn);
        container.appendChild(group);

        // KISS 插入策略，放在被追踪表格标签之上
        if (table.parentNode) {
            table.parentNode.insertBefore(container, table);
        }
    }

    /**
     * 解析并生成带当前日期的文件
     */
    function exportTableToCSV(table) {
        const csvData = extractTableData(table);
        
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const filename = `table_data_${yyyy}${mm}${dd}.csv`;

        downloadCSV(csvData, filename);
    }

    /**
     * DRY: 抓取当前表格内部数据并生成标准格式文本
     */
    function extractTableData(table) {
        const rows = table.querySelectorAll('tr');
        const csvRows = [];

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const rowData = [];
            
            cols.forEach(col => {
                let text = (col.innerText || col.textContent || '').trim();
                
                // 处理CSV的标准转义方法（防止单元格含逗号，换行双引号引发解析混乱）
                if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    // 转义双重引用
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                rowData.push(text);
            });
            csvRows.push(rowData.join(','));
        });

        // 拼接成结果，并打上BOM头解决中文Excel系统常见乱码问题
        return '\uFEFF' + csvRows.join('\n');
    }

    /**
     * 利用 Blob 原生方式抛出下载指令
     */
    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理内存对象
        URL.revokeObjectURL(url);
    }

    // 初始化入口
    init();

})();
