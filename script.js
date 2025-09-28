// Helper: format number as VND
function formatVND(num) {
  return num.toLocaleString('vi-VN');
}

// Cập nhật ngày tự động
window.onload = function() {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('invoice-date').value = today;
  updateTotals();
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
    <td><input type="number" min="0" max="99999999999" value="0" class="input-gia"></td>
  `;
  setRowEvents(row);
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
document.getElementById('shipping-fee').addEventListener('input', updateTotals);
document.getElementById('deposit').addEventListener('input', updateTotals);

// Tính tổng tiền
function updateTotals() {
  let total = 0;
  const rows = document.querySelectorAll('#product-tbody tr');
  rows.forEach(row => {
    const sl = parseInt(row.querySelector('.input-sl').value) || 0;
    const gia = parseInt(row.querySelector('.input-gia').value) || 0;
    total += sl * gia;
  });
  const shipping = parseInt(document.getElementById('shipping-fee').value) || 0;
  const deposit = parseInt(document.getElementById('deposit').value) || 0;
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
  firstRow.querySelector('.input-gia').value = 0;
  document.getElementById('shipping-fee').value = 0;
  document.getElementById('deposit').value = 0;
  document.getElementById('writer-name').value = 'Thiên';
  document.getElementById('invoice-date').value = new Date().toISOString().slice(0,10);
  updateTotals();
}