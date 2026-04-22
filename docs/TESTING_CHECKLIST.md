# Testing Checklist — Bống Cà Phê POS

---

## Hướng dẫn sử dụng

- Chạy checklist này sau khi hoàn thành MỖI Phase
- Chạy trên trình duyệt Chrome hoặc Safari mobile (cả 2 nếu có thể)
- Ghi kết quả vào HANDOFF.md — mục "Kết quả TESTING_CHECKLIST.md"
- Nếu bất kỳ item nào FAIL → dừng lại, ghi vào HANDOFF.md, không tiếp tục

## Cách chạy
```bash
npm run dev
# Mở http://localhost:5173
# Thực hiện từng bước bên dưới theo đúng thứ tự
```

## Ký hiệu
[ ] Chưa test
[✅] Pass
[❌] Fail — ghi mô tả vấn đề vào cột "Ghi chú"
[⏭️] Skip — ghi lý do

---

## NHÓM 1 — Khởi động & Navigation

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 1.1 | Mở http://localhost:5173 lần đầu | Hiển thị StartView với ảnh gif và tên "Bống Cà Phê" | [ ] | |
| 1.2 | Bấm vào ảnh gif | Chuyển sang ViewSelectionView | [ ] | |
| 1.3 | Bấm "Quay lại" ở ViewSelectionView | Về lại StartView | [ ] | |
| 1.4 | Bấm vào ảnh gif lần 2 | Vào ViewSelectionView | [ ] | |
| 1.5 | Reload trang (F5) khi đang ở ViewSelectionView | Vẫn ở ViewSelectionView, không về StartView | [ ] | |
| 1.6 | Bấm nút "🌙 Tối" | Toàn bộ UI chuyển sang dark mode | [ ] | |
| 1.7 | Reload trang sau khi bật dark mode | Vẫn giữ dark mode | [ ] | |
| 1.8 | Bấm nút "☀️ Sáng" | Toàn bộ UI chuyển sang light mode | [ ] | |
| 1.9 | Reload trang sau khi bật light mode | Vẫn giữ light mode | [ ] | |

---

## NHÓM 2 — Màn hình bàn

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 2.1 | Bấm "Trong Nhà" | Hiển thị 8 bàn (T1–T8) | [ ] | |
| 2.2 | Quan sát màu bàn trống | Màu xanh (teal) | [ ] | |
| 2.3 | Bấm "Quay lại" ở InsideView | Về ViewSelectionView | [ ] | |
| 2.4 | Bấm "Ngoài Trời" | Hiển thị 12 bàn (N1–N12) | [ ] | |
| 2.5 | Bấm "Quay lại" ở OutsideView | Về ViewSelectionView | [ ] | |
| 2.6 | Bấm vào bàn T1 | Vào OrderView, header hiển thị "T1 — Trống" | [ ] | |
| 2.7 | Bấm "←" ở OrderView | Về InsideView | [ ] | |
| 2.8 | Bấm vào bàn N1 | Vào OrderView, header hiển thị "N1 — Trống" | [ ] | |
| 2.9 | Bấm "←" ở OrderView của bàn ngoài trời | Về OutsideView (không về InsideView) | [ ] | |

---

## NHÓM 3 — Thêm món vào order

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 3.1 | Vào OrderView bàn T1, quan sát categories | Hiển thị đầy đủ các nhóm (CÀ PHÊ, TRÀ, SINH TỐ...) | [ ] | |
| 3.2 | Bấm category "CÀ PHÊ" | Danh sách hiển thị các món cà phê | [ ] | |
| 3.3 | Bấm category "TRÀ" | Danh sách chuyển sang các món trà | [ ] | |
| 3.4 | Bấm món "Nâu" | Toast hiện "Đã thêm «Nâu»", món xuất hiện trong order panel | [ ] | |
| 3.5 | Bấm món "Nâu" lần 2 | Số lượng tăng lên 2, KHÔNG tạo dòng mới | [ ] | |
| 3.6 | Bấm món "Đen" | Xuất hiện dòng mới trong order panel | [ ] | |
| 3.7 | Quan sát order panel | Hiển thị đúng: tên món, số lượng, giá từng món | [ ] | |
| 3.8 | Quan sát tổng tiền ở thanh dưới | Tổng tiền = 35000 + 35000 + 30000 = 100000đ | [ ] | |
| 3.9 | Quan sát header bàn T1 | Chuyển từ "Trống" sang "Có khách" | [ ] | |
| 3.10 | Quan sát bàn T1 ở InsideView | Bàn chuyển màu vàng, hiển thị tổng tiền | [ ] | |

---

## NHÓM 4 — Tìm kiếm món

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 4.1 | Gõ "nâu" vào ô tìm kiếm (có dấu) | Tìm được món "Nâu" | [ ] | |
| 4.2 | Gõ "nau" vào ô tìm kiếm (không dấu) | Vẫn tìm được món "Nâu" | [ ] | |
| 4.3 | Gõ "tra" (không dấu) | Tìm được các món trà | [ ] | |
| 4.4 | Gõ "sinh to" (không dấu) | Tìm được các món sinh tố | [ ] | |
| 4.5 | Gõ "xyz123" | Danh sách trống, không crash | [ ] | |
| 4.6 | Bấm nút "×" để xóa tìm kiếm | Ô tìm kiếm trống, hiển thị lại category đang chọn | [ ] | |

---

## NHÓM 5 — Chỉnh sửa order

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 5.1 | Bấm "+" bên cạnh món "Nâu" | Số lượng tăng từ 2 lên 3 | [ ] | |
| 5.2 | Bấm "-" bên cạnh món "Nâu" | Số lượng giảm từ 3 xuống 2 | [ ] | |
| 5.3 | Bấm "-" liên tục đến khi số lượng = 0 | Món bị xóa khỏi order, không crash | [ ] | |
| 5.4 | Xóa hết tất cả món trong order | Header bàn chuyển lại "Trống", bàn chuyển màu xanh | [ ] | |
| 5.5 | Thêm lại món "Nâu" | Order hoạt động bình thường | [ ] | |

---

## NHÓM 6 — Ghi chú món

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 6.1 | Bấm icon note (✏️) bên cạnh món "Nâu" | NoteModal mở ra, hiển thị tên món | [ ] | |
| 6.2 | Bấm tag "Ít đường" | Text "Ít đường" xuất hiện trong ô textarea | [ ] | |
| 6.3 | Bấm thêm tag "Không đá" | Text thành "Ít đường, Không đá" | [ ] | |
| 6.4 | Xóa text và gõ ghi chú thủ công "test note" | Textarea hiển thị "test note" | [ ] | |
| 6.5 | Bấm "Lưu" | Modal đóng lại, ghi chú hiển thị màu đỏ dưới tên món | [ ] | |
| 6.6 | Bấm icon note lần 2 | Modal mở ra với ghi chú cũ đã có sẵn | [ ] | |
| 6.7 | Bấm "Hủy" | Modal đóng, ghi chú không thay đổi | [ ] | |
| 6.8 | Bấm vào overlay (vùng tối ngoài modal) | Modal đóng lại | [ ] | |

---

## NHÓM 7 — Topping

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 7.1 | Bấm nút "Topping" bên cạnh món "Nâu" | ToppingsModal mở ra, hiển thị danh sách topping | [ ] | |
| 7.2 | Bấm "+" bên cạnh "Trân châu trắng" | Topping được chọn, hiện số lượng = 1 | [ ] | |
| 7.3 | Bấm "+" thêm lần nữa | Số lượng tăng lên 2 | [ ] | |
| 7.4 | Bấm "-" | Số lượng giảm xuống 1 | [ ] | |
| 7.5 | Bấm "-" khi số lượng = 1 | Topping bị bỏ chọn (về trạng thái ban đầu) | [ ] | |
| 7.6 | Chọn "Trân châu trắng" x1 và "Nha đam" x1 | Tổng hiển thị đúng: giá món + 5000 + 5000 | [ ] | |
| 7.7 | Bấm "Thêm vào order" | Modal đóng, topping hiển thị dưới món trong order panel | [ ] | |
| 7.8 | Kiểm tra tổng tiền | Tổng tiền cập nhật đúng bao gồm topping | [ ] | |
| 7.9 | Bấm "Hủy" | Modal đóng, không thêm topping | [ ] | |

---

## NHÓM 8 — Chuyển bàn

| # | Chuẩn bị | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| 8.1 | Đang ở T1 có order | Bấm "Chuyển bàn" | Modal hiện danh sách bàn trống | [ ] | |
| 8.2 | | Kiểm tra danh sách | Chỉ hiện bàn đang trống, không có T1 | [ ] | |
| 8.3 | | Chọn bàn T2 | Modal đóng, chuyển sang OrderView T2 | [ ] | |
| 8.4 | | Kiểm tra order T2 | Order của T1 đã chuyển sang T2 | [ ] | |
| 8.5 | | Về InsideView kiểm tra | T1 trống (xanh), T2 có khách (vàng) | [ ] | |
| 8.6 | T2 đang có order | Bấm "Chuyển bàn" khi không có bàn trống | Nút "Chuyển bàn" bị disabled | [ ] | |

---

## NHÓM 9 — Gộp bàn

| # | Chuẩn bị | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|---|
| 9.1 | T2 có order, thêm order cho T3 | Vào OrderView T2, bấm "Gộp bàn" | Modal hiện danh sách bàn có khách | [ ] | |
| 9.2 | | Kiểm tra danh sách | Chỉ hiện bàn đang có khách, không có T2 | [ ] | |
| 9.3 | | Chọn T3 | Modal đóng | [ ] | |
| 9.4 | | Kiểm tra order T2 | Order T2 chứa đủ món của cả T2 lẫn T3 | [ ] | |
| 9.5 | | Về InsideView | T3 trống (xanh), T2 vẫn có khách (vàng) | [ ] | |
| 9.6 | | Kiểm tra tổng tiền T2 | Bằng tổng của T2 cũ + T3 cũ | [ ] | |

---

## NHÓM 10 — Thanh toán

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 10.1 | Vào bàn T2 có order, bấm "Thanh toán" khi order trống | Nút disabled, không mở modal | [ ] | |
| 10.2 | Thêm món vào T2, bấm "Thanh toán" | PaymentMethodModal mở ra | [ ] | |
| 10.3 | Kiểm tra tổng tiền trong modal | Khớp với tổng tiền ở thanh dưới | [ ] | |
| 10.4 | Bấm "📋 Sao chép hóa đơn" | Thông báo "Đã sao chép", clipboard có text hóa đơn đúng format | [ ] | |
| 10.5 | Bấm "Hủy" | Modal đóng, order vẫn còn nguyên | [ ] | |
| 10.6 | Mở lại modal, chọn "💵 Cash" | Modal đóng, bàn T2 trống, về InsideView | [ ] | |
| 10.7 | Kiểm tra lịch sử | Hóa đơn vừa thanh toán xuất hiện với paymentMethod = Cash | [ ] | |
| 10.8 | Thêm order mới cho T3, thanh toán bằng "🏦 BIDV" | Tương tự 10.6, paymentMethod = BIDV | [ ] | |
| 10.9 | Thêm order mới cho T4, thanh toán bằng "💳 JJW" | Tương tự 10.6, paymentMethod = JJW | [ ] | |
| 10.10 | Thêm order mới cho T5, mở modal, bấm "📷 QR Thanh toán" | Hiển thị danh sách QR accounts | [ ] | |
| 10.11 | Bấm nút 🖥️ bên cạnh một QR account | Hiển thị QR fullscreen với tổng tiền | [ ] | |
| 10.12 | Bấm "← Chọn tài khoản khác" | Về danh sách QR | [ ] | |
| 10.13 | Bấm nút ✅ bên cạnh một QR account | Bàn trống, hóa đơn lưu vào lịch sử đúng method | [ ] | |

---

## NHÓM 11 — Lịch sử thanh toán

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 11.1 | Vào "Lịch Sử" | Hiển thị danh sách hóa đơn đã tạo | [ ] | |
| 11.2 | Kiểm tra số liệu tổng | Số hóa đơn và doanh thu tính đúng | [ ] | |
| 11.3 | Bấm vào một hóa đơn | Hóa đơn được chọn (viền xanh, checkbox tick) | [ ] | |
| 11.4 | Bấm vào hóa đơn đang chọn | Bỏ chọn (viền biến mất) | [ ] | |
| 11.5 | Bấm "Chọn tất cả" | Tất cả hóa đơn được chọn | [ ] | |
| 11.6 | Bấm "Bỏ chọn tất cả" | Tất cả hóa đơn bị bỏ chọn | [ ] | |
| 11.7 | Chọn 1 hóa đơn, bấm "Xóa mục đã chọn" | Confirm dialog hiện ra | [ ] | |
| 11.8 | Bấm OK trong confirm | Chỉ xóa hóa đơn đã chọn, các hóa đơn khác còn nguyên | [ ] | |
| 11.9 | Bấm "Xuất ảnh" khi chọn 1 hóa đơn | File PNG được tải về đúng tên | [ ] | |
| 11.10 | Chọn 1 hóa đơn, bấm "Hoàn tác" | Confirm dialog hiện ra | [ ] | |
| 11.11 | Confirm hoàn tác | Hóa đơn biến khỏi lịch sử, order quay lại bàn tương ứng | [ ] | |
| 11.12 | Kiểm tra bàn sau khi hoàn tác | Bàn chuyển sang trạng thái có khách với order cũ | [ ] | |
| 11.13 | Bấm "Xóa tất cả" | Confirm dialog hiện ra | [ ] | |
| 11.14 | Confirm xóa tất cả | Lịch sử trống | [ ] | |

---

## NHÓM 12 — Quản lý menu

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 12.1 | Vào "Quản Lý Menu" | Hiển thị danh sách categories và món | [ ] | |
| 12.2 | Chọn category "CÀ PHÊ" | Bảng hiển thị các món cà phê | [ ] | |
| 12.3 | Bấm "Sửa giá" bên cạnh món "Nâu" | Ô input giá xuất hiện với giá hiện tại | [ ] | |
| 12.4 | Sửa giá thành 40000, bấm "Lưu" | Giá cập nhật thành 40.000đ | [ ] | |
| 12.5 | Reload trang | Giá 40.000đ vẫn giữ nguyên | [ ] | |
| 12.6 | Sửa giá lại thành 35000 | Trả về giá gốc | [ ] | |
| 12.7 | Nhập tên "Test Món" và giá 50000, bấm "Thêm vào CÀ PHÊ" | Món mới xuất hiện cuối danh sách | [ ] | |
| 12.8 | Vào OrderView bất kỳ | Món "Test Món" xuất hiện trong category CÀ PHÊ | [ ] | |
| 12.9 | Quay lại MenuView, xóa món "Test Món" | Món biến khỏi danh sách | [ ] | |
| 12.10 | Bấm "+ Thêm nhóm mới", nhập "TEST GROUP" | Nhóm mới xuất hiện trong tab | [ ] | |
| 12.11 | Bấm "Xóa" bên cạnh "TEST GROUP" | Nhóm bị xóa | [ ] | |
| 12.12 | Reload trang | Tất cả thay đổi menu được giữ nguyên | [ ] | |

---

## NHÓM 13 — Persistence (giữ data sau reload)

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 13.1 | Thêm order cho bàn T1, reload trang | Order T1 vẫn còn nguyên | [ ] | |
| 13.2 | Đang ở OrderView T1, reload trang | Vẫn ở OrderView T1, không về màn hình khác | [ ] | |
| 13.3 | Thanh toán tạo 2-3 hóa đơn, reload trang | Lịch sử vẫn đầy đủ | [ ] | |
| 13.4 | Đang ở dark mode, reload trang | Vẫn giữ dark mode | [ ] | |
| 13.5 | Đóng tab hoàn toàn, mở lại | Tất cả data vẫn còn (order, lịch sử, theme) | [ ] | |

---

## NHÓM 14 — Edge cases

| # | Thao tác | Kết quả mong đợi | Kết quả | Ghi chú |
|---|---|---|---|---|
| 14.1 | Bấm "Chuyển bàn" khi chưa có order | Nút bị disabled | [ ] | |
| 14.2 | Bấm "Gộp bàn" khi không có bàn nào có khách | Nút bị disabled | [ ] | |
| 14.3 | Thanh toán khi order trống | Nút "Thanh toán" bị disabled | [ ] | |
| 14.4 | Hoàn tác hóa đơn khi bàn đang có khách | Tạo bàn tạm mới, không ghi đè order cũ | [ ] | |
| 14.5 | Mở app trên mobile (hoặc resize nhỏ) | Layout không bị vỡ | [ ] | |
| 14.6 | Gõ tìm kiếm trong khi đang có order | Order panel không bị ảnh hưởng | [ ] | |

---

## Tổng kết
Tổng số items: 89
NHÓM 1  — Navigation:        9 items
NHÓM 2  — Màn hình bàn:      9 items
NHÓM 3  — Thêm món:         10 items
NHÓM 4  — Tìm kiếm:          6 items
NHÓM 5  — Chỉnh sửa order:   5 items
NHÓM 6  — Ghi chú:           8 items
NHÓM 7  — Topping:           9 items
NHÓM 8  — Chuyển bàn:        6 items
NHÓM 9  — Gộp bàn:           6 items
NHÓM 10 — Thanh toán:       13 items
NHÓM 11 — Lịch sử:          14 items
NHÓM 12 — Quản lý menu:     12 items
NHÓM 13 — Persistence:       5 items
NHÓM 14 — Edge cases:        6 items
Kết quả ca này: ___/89 passed

---

*Nếu kết quả dưới 89/89 → ghi rõ items fail vào HANDOFF.md, không tiếp tục Phase tiếp theo.*