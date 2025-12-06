# HƯỚNG DẪN CÀI ĐẶT PUPPETEER TRÊN WINDOWS

## Vấn đề thường gặp

Khi cài đặt Puppeteer trên Windows, bạn có thể gặp lỗi:
- `EPERM: operation not permitted`
- File đang được sử dụng
- Quyền truy cập không đủ

## Giải pháp

### Cách 1: Đóng tất cả Node processes và cài lại

```powershell
# 1. Đóng tất cả Node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# 2. Xóa node_modules nếu cần
Remove-Item -Recurse -Force node_modules\puppeteer* -ErrorAction SilentlyContinue

# 3. Cài đặt lại
npm install puppeteer handlebars
```

### Cách 2: Chạy PowerShell với quyền Administrator

1. Click chuột phải vào PowerShell
2. Chọn "Run as Administrator"
3. Chạy lệnh:
```powershell
cd D:\code\e-log_cuoi-ky\backend
npm install puppeteer handlebars
```

### Cách 3: Bỏ qua Puppeteer (Khuyến nghị nếu không cần ngay)

**App đã được cấu hình để chạy được mà không cần Puppeteer!**

- App sẽ tự động dùng PDFKit (đã có sẵn)
- Khi nào cần Puppeteer, cài sau cũng được
- Không ảnh hưởng đến chức năng hiện tại

**Để kiểm tra app có chạy được không:**
```powershell
npm run dev
```

### Cách 4: Cài Puppeteer sau (khi cần)

Khi bạn cần tính năng PDF với HTML/CSS:
1. Đảm bảo đóng tất cả Node processes
2. Chạy PowerShell với quyền Admin
3. Cài đặt:
```powershell
npm install puppeteer handlebars
```

## Kiểm tra cài đặt

Sau khi cài xong, kiểm tra:
```powershell
npm list puppeteer handlebars
```

Nếu thấy cả 2 package, nghĩa là đã cài thành công.

## Lưu ý

- Puppeteer sẽ tải Chromium (~170MB) khi cài đặt lần đầu
- Quá trình này có thể mất 5-10 phút tùy tốc độ mạng
- Nếu bị timeout, thử lại hoặc dùng VPN

## Tạm thời không cần Puppeteer?

**Không sao cả!** App vẫn chạy bình thường với PDFKit. Puppeteer chỉ cần khi bạn muốn:
- Thiết kế PDF bằng HTML/CSS
- In barcode/QR code sắc nét
- Layout phức tạp hơn

