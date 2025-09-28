// Helper: format number as VND
function formatVND(num) {
  if(isNaN(num)) return "";
  return num.toLocaleString('vi-VN');
}

// Tự động set ngày, tháng, năm hiện tại khi load, cho phép chỉnh sửa
window.onload = function() {
  const now = new Date();
  document.getElementById('invoice-day').value = now.getDate();
  document.getElementById('invoice-month').value = now.getMonth() + 1;
  document.getElementById('invoice-year').value = now.getFullYear();
  updateTotals();
  setupGiaInputEvents();
  setupMoneyInputEvents();
  // Cho phép user chỉnh sửa ngày tháng năm
  document.getElementById('invoice-day').addEventListener('input', updateTotals);
  document.getElementById('invoice-month').addEventListener('input', updateTotals);
  document.getElementById('invoice-year').addEventListener('input', updateTotals);
};

// Thêm sản phẩm
function addProductRow() {
  const tbody = document.getElementById('product-tbody');
  const rowCount = tbody.rows.length;
  const row = tbody.insertRow();
  row.innerHTML = `
    <td><input type="number" min="1" max="999" value="${rowCount + 1}" class="input-stt"></td>
    <td><input type="text" class="input-name" placeholder="Tên sản phẩm"></td>
    <td><input type="number" min="1" max="999" value="1" class="input-sl"></td>
    <td><input type="text" inputmode="numeric" pattern="[0-9.]*" maxlength="13" value="0" class="input-gia"></td>
  `;
  setRowEvents(row);
  setupGiaInputEvents(row);
}

// Xoá sản phẩm dòng cuối
function removeProductRow() {
  const tbody = document.getElementById('product-tbody');
  if (tbody.rows.length > 1) {
    tbody.deleteRow(tbody.rows.length - 1);
    updateTotals();
  }
}

// Sự kiện tính toán lại tổng khi thay đổi bảng sản phẩm, phí, cọc
function setRowEvents(row) {
  Array.from(row.querySelectorAll('input')).forEach(input => {
    input.addEventListener('input', updateTotals);
  });
}
Array.from(document.getElementById('product-tbody').rows).forEach(setRowEvents);
document.getElementById('deposit').addEventListener('input', updateTotals);

// Format giá tiền tự động dấu chấm hàng nghìn, chặn tối đa 10 số thực
function setupGiaInputEvents(scope) {
  let rows;
  if (scope) {
    rows = [scope];
  } else {
    rows = document.querySelectorAll('#product-tbody tr');
  }
  rows.forEach(row => {
    const giaInput = row.querySelector('.input-gia');
    if (giaInput) {
      giaInput.addEventListener('input', function(e) {
        let val = giaInput.value.replace(/[^\d]/g, '');
        if(val.length > 10) val = val.slice(0,10); // chỉ 10 số
        if(val === "") val = "0";
        giaInput.value = formatVND(Number(val));
        updateTotals();
      });
      giaInput.addEventListener('focus', function() {
        giaInput.value = giaInput.value.replace(/[^\d]/g, '');
        if(giaInput.value === "") giaInput.value = "0";
      });
      giaInput.addEventListener('blur', function() {
        let val = giaInput.value.replace(/[^\d]/g, '');
        if(val === "") val = "0";
        giaInput.value = formatVND(Number(val));
      });
    }
  });
}
setupGiaInputEvents();

// Format các ô tiền khác (vận chuyển, cọc trước) tự động dấu chấm hàng nghìn
function setupMoneyInputEvents() {
  const moneyInputs = document.querySelectorAll('.input-money');
  moneyInputs.forEach(input => {
    input.addEventListener('input', function() {
      let val = input.value.replace(/[^\d]/g, '');
      if(val.length > 10) val = val.slice(0,10);
      if(val === "") val = "0";
      input.value = formatVND(Number(val));
      updateTotals();
    });
    input.addEventListener('focus', function() {
      input.value = input.value.replace(/[^\d]/g, '');
      if(input.value === "") input.value = "0";
    });
    input.addEventListener('blur', function() {
      let val = input.value.replace(/[^\d]/g, '');
      if(val === "") val = "0";
      input.value = formatVND(Number(val));
    });
  });
}
setupMoneyInputEvents();

// Tính tổng tiền
function updateTotals() {
  let total = 0;
  const rows = document.querySelectorAll('#product-tbody tr');
  rows.forEach(row => {
    const sl = parseInt(row.querySelector('.input-sl').value) || 0;
    const giaStr = row.querySelector('.input-gia').value.replace(/[^\d]/g, '');
    const gia = parseInt(giaStr) || 0;
    total += sl * gia;
  });
  const shipping = parseInt((document.getElementById('shipping-fee').value+"").replace(/[^\d]/g, '')) || 0;
  const deposit = parseInt((document.getElementById('deposit').value+"").replace(/[^\d]/g, '')) || 0;
  document.getElementById('total-fee').value = formatVND(total + shipping);
  document.getElementById('final-payment').value = formatVND(Math.max(0, total + shipping - deposit));
}

// Sự kiện cập nhật khi nhập liệu
document.getElementById('product-tbody').addEventListener('input', updateTotals);
document.getElementById('shipping-fee').addEventListener('input', updateTotals);
document.getElementById('deposit').addEventListener('input', updateTotals);

// Lưu hoá đơn: tải ảnh (dùng html2canvas)
function saveInvoice() {
  const btns = document.querySelector('.action-buttons');
  btns.style.display = 'none';
  importHtml2Canvas(() => {
    html2canvas(document.getElementById('invoice-content')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'hoadon.png';
      link.href = canvas.toDataURL();
      link.click();
      btns.style.display = 'flex';
    });
  });
}

// import html2canvas nếu chưa có
function importHtml2Canvas(cb) {
  if (window.html2canvas) { cb(); return; }
  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  script.onload = cb;
  document.body.appendChild(script);
}

// Xoá hoá đơn: reset all fields
function resetInvoice() {
  if (!confirm('Bạn có chắc chắn muốn xoá hết thông tin hoá đơn?')) return;
  document.getElementById('hotline').value = '0568.638.638';
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('customer-address').value = '';
  // Reset bảng sản phẩm về 1 dòng
  const tbody = document.getElementById('product-tbody');
  while (tbody.rows.length > 1) tbody.deleteRow(1);
  const firstRow = tbody.rows[0];
  firstRow.querySelector('.input-stt').value = 1;
  firstRow.querySelector('.input-name').value = '';
  firstRow.querySelector('.input-sl').value = 1;
  firstRow.querySelector('.input-gia').value = '0';
  setupGiaInputEvents();
  document.getElementById('shipping-fee').value = 0;
  document.getElementById('deposit').value = 0;
  document.getElementById('writer-name').value = 'Thiên';

  // Reset ngày tháng năm
  const now = new Date();
  document.getElementById('invoice-day').value = now.getDate();
  document.getElementById('invoice-month').value = now.getMonth() + 1;
  document.getElementById('invoice-year').value = now.getFullYear();

  setupMoneyInputEvents();
  updateTotals();
}
