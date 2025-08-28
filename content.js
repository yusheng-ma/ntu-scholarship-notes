// ==UserScript==
// @name         臺大獎學金備註助手
// @description  在獎學金表格新增「備註」欄，點擊不跳轉，內容自動儲存
// @version      1.0
// @match        https://advisory.ntu.edu.tw/CMS/Scholarship*
// @grant        storage
// ==/UserScript==

// 防止重複執行
if (window.hasRunNtuScholarshipNotes) {
  console.log('[NTU Notes] 擴充功能已注入過，跳過執行。');
} else {
  window.hasRunNtuScholarshipNotes = true;
  console.log('[NTU Notes] 擴充功能開始執行！');

  // 確保 DOM 已載入
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRemarksColumn);
  } else {
    addRemarksColumn();
  }
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

  // 檢查是否已有「備註」欄
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

  // 讀取已儲存的備註
  chrome.storage.local.get(null, function (savedNotes) {
    console.log('[NTU Notes] 已載入儲存的備註:', savedNotes);

    const rows = tbody.querySelectorAll('.tr_data');
    rows.forEach((tr) => {
      const scholarshipId = tr.id; // 例如 "7747"
      const noteKey = 'scholarship_note_' + scholarshipId;

      // 建立 td（備註欄）
      const td = document.createElement('td');

      // ✅ 重點：在整個 td 上阻止事件冒泡（避免點空白處誤觸跳轉）
      ['click', 'mousedown', 'mouseup'].forEach(event => {
        td.addEventListener(event, function (e) {
          e.stopPropagation();
        });
      });

      // 樣式設定
      td.style.padding = '4px';
      td.style.verticalAlign = 'middle';
      td.style.cursor = 'text'; // 提示這是可編輯區域
      td.title = '可輸入個人備註，例如：v看過了、x不能申請、OK要申請';

      // 建立 input
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '例如：v看過了, x不能申請, OK要申請';
      input.style.width = '90%';
      input.style.padding = '4px';
      input.style.fontSize = '14px';
      input.style.border = '1px solid #ccc';
      input.style.borderRadius = '4px';
      input.style.boxSizing = 'border-box';

      // 還原儲存的內容
      if (savedNotes[noteKey]) {
        input.value = savedNotes[noteKey];
      }

      // 輸入時自動儲存
      input.addEventListener('input', function () {
        const data = {};
        data[noteKey] = input.value;
        chrome.storage.local.set(data, function () {
          console.log(`[NTU Notes] 已儲存獎學金 ${scholarshipId} 的備註:`, input.value);
        });
      });

      // 雙重保險：input 本身也阻止冒泡
      ['click', 'mousedown', 'mouseup'].forEach(event => {
        input.addEventListener(event, function (e) {
          e.stopPropagation();
        });
      });

      // 插入元素
      td.appendChild(input);
      tr.appendChild(td);
    });

    console.log(`[NTU Notes] ✅ 成功為 ${rows.length} 列新增可儲存的備註欄！`);
  });
}