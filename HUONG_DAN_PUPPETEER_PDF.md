# HƯỚNG DẪN SỬ DỤNG PUPPETEER + HANDLEBARS CHO PDF

## Tổng quan

Hệ thống đã được tích hợp **Puppeteer + Handlebars** để tạo PDF với các ưu điểm:
- ✅ Tận dụng HTML/CSS để thiết kế mẫu in
- ✅ Hỗ trợ CSS đầy đủ (flexbox, grid, animations)
- ✅ In barcode/QR code sắc nét
- ✅ Dễ dàng tùy chỉnh layout
- ✅ Hỗ trợ Unicode tiếng Việt tốt

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install puppeteer handlebars
```

**Lưu ý**: Puppeteer sẽ tự động tải Chromium (~170MB) khi cài đặt lần đầu.

### 2. Cấu trúc thư mục

```
backend/src/
├── services/
│   └── pdfService.js          # Service xử lý PDF
├── templates/
│   ├── report.hbs            # Template báo cáo
│   ├── invoice.hbs           # Template hóa đơn
│   └── delivery-note.hbs     # Template vận đơn
└── controllers/
    └── reportController.js    # Controller sử dụng service
```

## Sử dụng

### 1. Xuất PDF báo cáo

**API Endpoint:**
```
GET /api/reports/:id/export?format=pdf&pdfEngine=puppeteer
```

**Query Parameters:**
- `format`: `pdf` (bắt buộc)
- `pdfEngine`: `puppeteer` (mặc định) hoặc `pdfkit` (fallback)

**Ví dụ:**
```javascript
// Frontend
const response = await fetch(`/api/reports/${reportId}/export?format=pdf&pdfEngine=puppeteer`);
const blob = await response.blob();
// Download file
```

### 2. Tạo template mới

#### Bước 1: Tạo file template `.hbs`

Ví dụ: `backend/src/templates/invoice.hbs`

```handlebars
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hóa đơn</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .invoice-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>HÓA ĐƠN</h1>
    <p>Mã: {{invoiceCode}}</p>
  </div>

  <div class="invoice-info">
    <div>
      <h3>Thông tin khách hàng</h3>
      <p><strong>{{customerName}}</strong></p>
      <p>{{customerAddress}}</p>
      <p>Điện thoại: {{customerPhone}}</p>
    </div>
    <div>
      <h3>Thông tin xuất hóa đơn</h3>
      <p>Ngày: {{formatDate invoiceDate}}</p>
      <p>Nhân viên: {{staffName}}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>STT</th>
        <th>Sản phẩm</th>
        <th>Số lượng</th>
        <th>Đơn giá</th>
        <th>Thành tiền</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{@index}}</td>
        <td>{{productName}}</td>
        <td class="text-right">{{formatNumber quantity}}</td>
        <td class="text-right">{{formatCurrency unitPrice}}</td>
        <td class="text-right">{{formatCurrency totalPrice}}</td>
      </tr>
      {{/each}}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="text-right"><strong>Tổng cộng:</strong></td>
        <td class="text-right"><strong>{{formatCurrency totalAmount}}</strong></td>
      </tr>
    </tfoot>
  </table>
</body>
</html>
```

#### Bước 2: Sử dụng trong service

```javascript
// Trong controller hoặc service
const pdfBuffer = await pdfService.generatePDFFromTemplate('invoice', {
  invoiceCode: 'INV-001',
  customerName: 'Nguyễn Văn A',
  customerAddress: '123 Đường ABC',
  customerPhone: '0123456789',
  invoiceDate: new Date(),
  staffName: 'Trần Thị B',
  items: [
    { productName: 'Sản phẩm 1', quantity: 10, unitPrice: 100000, totalPrice: 1000000 },
    { productName: 'Sản phẩm 2', quantity: 5, unitPrice: 200000, totalPrice: 1000000 }
  ],
  totalAmount: 2000000
}, {
  format: 'A4',
  printBackground: true
});
```

### 3. Handlebars Helpers có sẵn

Service đã đăng ký các helpers sau:

#### Format Currency
```handlebars
{{formatCurrency 1000000}}
<!-- Output: 1.000.000 ₫ -->
```

#### Format Number
```handlebars
{{formatNumber 1234567}}
<!-- Output: 1.234.567 -->
```

#### Format Date
```handlebars
{{formatDate date 'DD/MM/YYYY'}}
{{formatDate date 'DD/MM/YYYY HH:mm'}}
<!-- Output: 25/12/2024 hoặc 25/12/2024 14:30 -->
```

#### So sánh
```handlebars
{{#if (eq status 'active')}}
  Hoạt động
{{/if}}

{{#ifCond total '>' 1000}}
  Lớn hơn 1000
{{/ifCond}}
```

#### Toán học
```handlebars
{{add a b}}
{{multiply quantity price}}
```

#### Array
```handlebars
{{length items}}
```

### 4. Tùy chỉnh PDF options

```javascript
const pdfBuffer = await pdfService.generatePDF(html, {
  format: 'A4',              // A4, Letter, Legal, etc.
  printBackground: true,      // In background colors/images
  margin: {
    top: '10mm',
    right: '10mm',
    bottom: '10mm',
    left: '10mm'
  },
  preferCSSPageSize: true   // Sử dụng CSS @page
});
```

## So sánh Puppeteer vs PDFKit

| Tính năng | Puppeteer | PDFKit |
|-----------|-----------|--------|
| **HTML/CSS** | ✅ Hỗ trợ đầy đủ | ❌ Không hỗ trợ |
| **Layout phức tạp** | ✅ Dễ dàng (Grid, Flexbox) | ❌ Khó khăn |
| **Barcode/QR Code** | ✅ Sắc nét (HTML/CSS/JS) | ⚠️ Cần thư viện riêng |
| **Unicode** | ✅ Tự động | ⚠️ Cần font riêng |
| **Performance** | ⚠️ Chậm hơn (cần Chrome) | ✅ Nhanh hơn |
| **Memory** | ⚠️ Nặng hơn | ✅ Nhẹ hơn |
| **Dễ thiết kế** | ✅ Rất dễ (HTML/CSS) | ❌ Phải code từng dòng |
| **Responsive** | ✅ Có | ❌ Không |

## Best Practices

### 1. Tối ưu performance

```javascript
// Reuse browser instance (đã implement trong service)
// Không cần tạo browser mới mỗi lần

// Nếu cần close browser (khi shutdown server)
await pdfService.closeBrowser();
```

### 2. Xử lý lỗi

```javascript
try {
  const pdfBuffer = await pdfService.generateReportPDF(report, data, summary);
  // Success
} catch (error) {
  console.error('PDF generation error:', error);
  // Fallback to PDFKit hoặc trả về lỗi
}
```

### 3. Tối ưu template

- Sử dụng CSS thay vì inline styles khi có thể
- Tránh images quá lớn
- Sử dụng `@media print` cho print-specific styles
- Test trên nhiều kích thước trang

### 4. Barcode/QR Code

```handlebars
<!-- Sử dụng thư viện JS trong template -->
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
<div class="barcode-container">
  <svg id="barcode"></svg>
</div>
<script>
  JsBarcode("#barcode", "{{barcode}}", {
    format: "CODE128",
    width: 2,
    height: 50
  });
</script>
```

## Troubleshooting

### Lỗi: Chromium không tải được

**Giải pháp:**
```bash
# Set environment variable
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
npm install puppeteer

# Hoặc dùng puppeteer-core và cài Chromium thủ công
```

### Lỗi: Timeout khi generate PDF

**Giải pháp:**
```javascript
// Tăng timeout trong puppeteer launch
const browser = await puppeteer.launch({
  timeout: 60000, // 60 seconds
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Lỗi: Memory leak

**Giải pháp:**
- Đảm bảo đóng page sau khi dùng
- Reuse browser instance (đã implement)
- Monitor memory usage

## Ví dụ đầy đủ: Tạo Invoice PDF

### 1. Template: `invoice.hbs`

```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Styles */
  </style>
</head>
<body>
  <!-- Content -->
</body>
</html>
```

### 2. Controller

```javascript
const pdfService = require('../services/pdfService');

const generateInvoice = async (req, res) => {
  try {
    const invoiceData = {
      invoiceCode: 'INV-001',
      // ... other data
    };

    const pdfBuffer = await pdfService.generateInvoicePDF(invoiceData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoiceData.invoiceCode}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Kết luận

**Puppeteer + Handlebars** là giải pháp tốt cho:
- ✅ Hóa đơn, vận đơn cần layout đẹp
- ✅ Báo cáo cần barcode/QR code
- ✅ Documents cần CSS phức tạp
- ✅ Dễ maintain và update template

**PDFKit** vẫn phù hợp cho:
- ✅ Performance critical
- ✅ Simple documents
- ✅ Server resource hạn chế

Hệ thống hiện tại hỗ trợ **cả 2** và có thể chuyển đổi qua query param.

