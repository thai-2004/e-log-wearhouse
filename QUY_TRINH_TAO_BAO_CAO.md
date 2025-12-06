# QUY TRÌNH TẠO BÁO CÁO

## Tổng quan

Hệ thống báo cáo cho phép bạn tạo, cấu hình và xuất các loại báo cáo khác nhau với các bộ lọc tùy chỉnh.

## Các bước tạo báo cáo

### Bước 1: Mở form tạo báo cáo

1. Vào trang **Báo cáo** (Reports)
2. Click nút **"Tạo báo cáo mới"** hoặc **"+"**
3. Form tạo báo cáo sẽ hiển thị

### Bước 2: Nhập thông tin cơ bản (Tab "Thông tin cơ bản")

1. **Tên báo cáo** (bắt buộc): Nhập tên mô tả cho báo cáo
   - Ví dụ: "Báo cáo tồn kho tháng 12/2024"
2. **Loại báo cáo** (bắt buộc): Chọn loại báo cáo

   - Báo cáo tồn kho (inventory)
   - Báo cáo doanh thu (revenue)
   - Báo cáo khách hàng (customer)
   - Báo cáo nhà cung cấp (supplier)
   - Báo cáo sản phẩm (product)
   - Báo cáo nhập kho (inbound)
   - Báo cáo xuất kho (outbound)
   - Và các loại khác...

3. **Mô tả**: Nhập mô tả chi tiết (tùy chọn)

4. **Trạng thái**: Chọn trạng thái

   - Bản nháp (draft)
   - Hoạt động (active)
   - Không hoạt động (inactive)
   - Đã lưu trữ (archived)

5. **Danh mục**: Nhập danh mục (tùy chọn)

6. **Công khai**: Check nếu muốn báo cáo công khai

7. **Yêu thích**: Check nếu muốn đánh dấu yêu thích

**Lưu ý**: Khi chọn loại báo cáo, hệ thống sẽ tự động điền:

- Các cột dữ liệu mặc định
- Cấu hình biểu đồ mặc định
- Bộ lọc mặc định (nếu có)

### Bước 3: Cấu hình bộ lọc (Tab "Bộ lọc")

Đây là bước QUAN TRỌNG để đảm bảo dữ liệu được lọc đúng khi export.

#### 3.1. Bộ lọc thời gian

- **Kích hoạt**: Check để bật bộ lọc thời gian
- **Khoảng thời gian**: Chọn preset hoặc tùy chỉnh
  - Hôm nay
  - Hôm qua
  - 7 ngày qua
  - 30 ngày qua
  - 90 ngày qua
  - Tháng này
  - Tháng trước
  - Năm này
  - Năm trước
  - Tùy chỉnh (chọn từ ngày - đến ngày)

#### 3.2. Bộ lọc theo Kho

- Chọn các kho muốn lọc
- Có thể chọn nhiều kho
- Click "Chọn tất cả" để chọn tất cả kho

#### 3.3. Bộ lọc theo Sản phẩm ⚠️ QUAN TRỌNG

- **Chọn các sản phẩm** muốn lọc trong báo cáo
- Có thể chọn nhiều sản phẩm
- Click "Chọn tất cả" để chọn tất cả sản phẩm
- **Lưu ý**: Nếu không chọn sản phẩm nào, báo cáo sẽ hiển thị TẤT CẢ sản phẩm

#### 3.4. Bộ lọc theo Khách hàng

- Chọn các khách hàng muốn lọc (cho báo cáo doanh thu, xuất kho)

#### 3.5. Bộ lọc theo Nhà cung cấp

- Chọn các nhà cung cấp muốn lọc (cho báo cáo nhập kho)

#### 3.6. Bộ lọc theo Danh mục

- Chọn các danh mục sản phẩm muốn lọc

**⚠️ LƯU Ý QUAN TRỌNG**:

- Sau khi chọn filters, bạn PHẢI click **"Lưu"** để lưu cấu hình
- Filters chỉ được áp dụng khi báo cáo đã được lưu
- Khi export, hệ thống sẽ sử dụng filters đã lưu để lấy dữ liệu

### Bước 4: Cấu hình cột dữ liệu (Tab "Cột dữ liệu")

1. Xem lại các cột mặc định đã được tự động điền
2. Có thể:
   - Thêm cột mới: Click "Thêm cột"
   - Chỉnh sửa cột: Sửa tên trường, nhãn, độ rộng
   - Ẩn/hiện cột: Check/uncheck checkbox "visible"
   - Xóa cột: Click nút xóa

**Ví dụ cho báo cáo tồn kho**:

- Tên sản phẩm (productName)
- Kho (warehouseName)
- Số lượng (quantity)
- Đơn giá (unitPrice)
- Tổng giá trị (totalValue)
- Danh mục (category)

### Bước 5: Cấu hình biểu đồ (Tab "Biểu đồ") - Tùy chọn

1. **Kích hoạt biểu đồ**: Check để bật biểu đồ
2. **Loại biểu đồ**: Chọn loại
   - Biểu đồ cột (bar)
   - Biểu đồ đường (line)
   - Biểu đồ tròn (pie)
   - Biểu đồ vùng (area)
   - Biểu đồ phân tán (scatter)
   - Bảng dữ liệu (table)
3. **Trục X**: Chọn trường cho trục X
4. **Trục Y**: Chọn trường cho trục Y
5. **Tiêu đề biểu đồ**: Nhập tiêu đề
6. **Mô tả biểu đồ**: Nhập mô tả

### Bước 6: Cấu hình xuất báo cáo (Tab "Xuất báo cáo")

1. **Định dạng xuất**: Chọn các định dạng muốn xuất
   - PDF
   - Excel (XLSX)
   - CSV
2. **Tùy chọn xuất**:
   - ✅ Bao gồm biểu đồ
   - ✅ Bao gồm dữ liệu chi tiết
   - ✅ Bao gồm tóm tắt

### Bước 7: Lưu báo cáo

1. Click nút **"Lưu"** ở góc trên bên phải
2. Hệ thống sẽ:
   - Validate dữ liệu
   - Lưu tất cả cấu hình (bao gồm filters)
   - Hiển thị thông báo thành công

**⚠️ QUAN TRỌNG**:

- Bạn PHẢI lưu báo cáo trước khi có thể export
- Filters chỉ được áp dụng sau khi đã lưu

### Bước 8: Xem trước báo cáo (Sau khi lưu)

1. Sau khi lưu, báo cáo sẽ có ID
2. Click nút **"Xem trước"** hoặc **"Chạy báo cáo"**
3. Hệ thống sẽ:
   - Lấy dữ liệu dựa trên filters đã lưu
   - Hiển thị preview trong modal

### Bước 9: Xuất báo cáo

1. Vào danh sách báo cáo
2. Tìm báo cáo đã tạo
3. Click nút **"Xuất"** hoặc icon download
4. Chọn định dạng: PDF, Excel, hoặc CSV
5. File sẽ được tải xuống với dữ liệu đã được lọc theo filters

## Quy trình đặc biệt cho Báo cáo tồn kho với filter sản phẩm

### Ví dụ: Tạo báo cáo tồn kho chỉ cho một số sản phẩm cụ thể

1. **Tạo báo cáo mới**:

   - Tên: "Báo cáo tồn kho sản phẩm A, B, C"
   - Loại: **Báo cáo tồn kho**

2. **Vào tab "Bộ lọc"**:

   - Tìm phần **"Sản phẩm"**
   - Chọn các sản phẩm cụ thể (ví dụ: Sản phẩm A, Sản phẩm B, Sản phẩm C)
   - Có thể chọn thêm filter kho nếu cần

3. **Kiểm tra tab "Cột dữ liệu"**:

   - Đảm bảo có các cột: product, sku, warehouse, quantity, value

4. **Lưu báo cáo**: Click "Lưu"

5. **Xem trước** (tùy chọn):

   - Click "Xem trước" để kiểm tra dữ liệu
   - Đảm bảo chỉ hiển thị các sản phẩm đã chọn

6. **Xuất file**:
   - Click "Xuất" → Chọn "Excel"
   - File Excel sẽ chứa:
     - Sheet "Báo cáo": Dữ liệu chi tiết các sản phẩm đã chọn
     - Sheet "Thông tin": Thông tin báo cáo và tổng hợp

## Các lỗi thường gặp và cách khắc phục

### ❌ Lỗi: Export file nhưng không có dữ liệu sản phẩm

**Nguyên nhân**:

1. Chưa lưu báo cáo sau khi chọn filters
2. Filters không được lưu đúng
3. Không có dữ liệu phù hợp với filters

**Cách khắc phục**:

1. ✅ Đảm bảo đã click "Lưu" sau khi chọn filters
2. ✅ Kiểm tra lại filters trong tab "Bộ lọc"
3. ✅ Xem trước báo cáo để kiểm tra dữ liệu trước khi export
4. ✅ Kiểm tra xem có dữ liệu inventory cho các sản phẩm đã chọn không

### ❌ Lỗi: Filters không được áp dụng

**Nguyên nhân**:

- Chưa lưu báo cáo
- ObjectId không được convert đúng

**Cách khắc phục**:

1. ✅ Lưu lại báo cáo
2. ✅ Chọn lại filters và lưu lại
3. ✅ Kiểm tra console log để xem có lỗi không

### ❌ Lỗi: File Excel không có dữ liệu

**Nguyên nhân**:

- Code export cũ chỉ export metadata

**Đã được sửa**: Code mới sẽ export dữ liệu thực tế từ database

## Checklist trước khi export

- [ ] Đã nhập tên báo cáo
- [ ] Đã chọn loại báo cáo
- [ ] Đã cấu hình filters (đặc biệt là sản phẩm nếu cần)
- [ ] Đã click "Lưu" để lưu báo cáo
- [ ] Đã xem trước để kiểm tra dữ liệu (tùy chọn)
- [ ] Đã chọn định dạng xuất phù hợp

## Lưu ý kỹ thuật

1. **Filters được lưu trong `report.config.filters`**
2. **Khi export, hệ thống sẽ**:

   - Đọc filters từ `report.config.filters`
   - Convert string ID thành ObjectId
   - Query database với filters
   - Export dữ liệu thực tế vào file

3. **Các trường dữ liệu cho báo cáo tồn kho**:
   - `product`: Tên sản phẩm
   - `sku`: Mã SKU
   - `warehouse`: Tên kho
   - `category`: Danh mục
   - `quantity`: Số lượng
   - `reservedQuantity`: Số lượng đã đặt
   - `availableQuantity`: Số lượng có sẵn
   - `unit`: Đơn vị
   - `value`: Giá trị (quantity × price)

## Kết luận

Quy trình đúng để tạo báo cáo tồn kho với filter sản phẩm:

1. Tạo báo cáo → Chọn loại "Báo cáo tồn kho"
2. Vào tab "Bộ lọc" → Chọn sản phẩm
3. **QUAN TRỌNG**: Click "Lưu" để lưu filters
4. Xem trước (tùy chọn) để kiểm tra
5. Xuất file Excel/PDF/CSV

Sau khi sửa code, hệ thống sẽ:

- ✅ Export dữ liệu thực tế từ database
- ✅ Áp dụng filters đúng cách
- ✅ Convert ObjectId đúng
- ✅ Hiển thị đầy đủ thông tin sản phẩm trong file export
