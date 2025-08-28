// content.js - 修正「事件未觸發」問題

if (window.hasRunNtuScholarshipNotes) {
  console.log('[NTU Notes] 擴充功能已注入過，跳過執行。');
} else {
  window.hasRunNtuScholarshipNotes = true;
  console.log('[NTU Notes] 擴充功能開始執行！');

  // 直接檢查當前頁面狀態
  if (document.readyState === 'loading') {
    // 還在 loading，等 DOMContentLoaded
    console.log('[NTU Notes] 頁面仍在載入，監聽 DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[NTU Notes] DOMContentLoaded 觸發，準備處理表格...');
      addRemarksColumn();
    });
  } else {
    // 已經載入完畢，直接執行
    console.log('[NTU Notes] 頁面已載入完畢，直接執行 addRemarksColumn');
    addRemarksColumn();
  }

  function addRemarksColumn() {
    console.log('[NTU Notes] 嘗試尋找表格...');

    const table = document.querySelector('.list-result table');
    if (!table) {
      console.warn('[NTU Notes] ❌ 找不到表格 .list-result table');
      return;
    }
    console.log('[NTU Notes] ✅ 找到表格');

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const headerRow = thead?.querySelector('tr');

    if (!headerRow) {
      console.warn('[NTU Notes] ❌ 找不到表頭列');
      return;
    }

    const lastHeader = headerRow.querySelector('td:last-child');
    if (lastHeader && lastHeader.textContent.trim() === '備註') {
      console.log('[NTU Notes] ✅ 備註欄已存在');
      return;
    }

    // 新增「備註」標題
    const th = document.createElement('td');
    th.style.width = '120px';
    th.style.textAlign = 'center';
    th.style.fontWeight = 'bold';
    th.textContent = '備註';
    headerRow.appendChild(th);
    console.log('[NTU Notes] ✅ 已新增「備註」標題');

    // 為每一列新增輸入框
    const rows = tbody.querySelectorAll('.tr_data');
    console.log(`[NTU Notes] 找到 ${rows.length} 列資料`);

    rows.forEach((tr) => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '例如：v看過了, x不能申請, OK要申請';
      input.style.width = '90%';
      input.style.padding = '4px';
      input.style.fontSize = '14px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '4px';
      input.style.boxSizing = 'border-box';
      td.appendChild(input);
      tr.appendChild(td);
    });

    console.log(`[NTU Notes] ✅ 成功為 ${rows.length} 列新增輸入框！`);
  }
}