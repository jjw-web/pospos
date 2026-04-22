# Bống Cà Phê POS — Hướng dẫn cho Agent

## ĐỌC FILE NÀY TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ
## ĐỌC LẠI FILE NÀY MỖI LẦN NHẬN CA MỚI, KHÔNG NGOẠI LỆ

---

## 1. Dự án là gì

Hệ thống POS (Point of Sale) nội bộ cho quán cà phê nhỏ tên "Bống Cà Phê".
Dùng để quản lý bàn, gọi món, thanh toán.

**Đặc điểm quan trọng nhất:**
- KHÔNG có backend
- KHÔNG có database
- Toàn bộ data lưu trong `localStorage` của trình duyệt
- Đang chạy thật trên production, có người dùng thực tế
- Nhiệm vụ của agent là cải thiện chất lượng code BÊN TRONG
  mà người dùng KHÔNG nhận ra bất kỳ sự thay đổi nào ở bên ngoài

---

## 2. Tech stack

| Thành phần | Version | Ghi chú |
|---|---|---|
| React | 18.2.0 | |
| TypeScript | 5.0.2 | strict mode |
| Vite | 4.4.5 | dev server + build |
| Tailwind CSS | 4.1.12 | đang dùng chưa nhất quán |
| html-to-image | 1.11.13 | xuất ảnh hóa đơn |

---

## 3. Cấu trúc thư mục hiện tại
```
jjw-web-pos/
├── AGENTS.md                      ← file này
├── docs/
│   ├── HANDOFF.md                 ← đọc ngay sau file này
│   ├── TESTING_CHECKLIST.md       ← chạy sau mỗi Phase
│   └── phases/
│       ├── PHASE-0-setup.md
│       ├── PHASE-1-fix-bugs.md
│       ├── PHASE-2-typescript.md
│       ├── PHASE-3-utils.md
│       ├── PHASE-4-hooks.md
│       ├── PHASE-5-components.md
│       ├── PHASE-6-performance.md
│       ├── PHASE-7-quality.md
│       └── PHASE-8-verification.md
├── src/
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── hooks/                     ← sẽ được tạo ở Phase 4
│   ├── lib/
│   │   ├── config.ts
│   │   ├── daily-summary.ts
│   │   ├── data-upgrader.ts
│   │   ├── merge-menu-defaults.ts
│   │   ├── merge-orders.ts
│   │   ├── receipt.ts
│   │   ├── table-utils.ts
│   │   └── version-manager.ts
│   └── types/
│       └── static.d.ts
├── components/
│   ├── DailySummaryView.tsx
│   ├── HistoryView.tsx
│   ├── icons.tsx
│   ├── InsideView.tsx
│   ├── MenuView.tsx
│   ├── NoteModal.tsx
│   ├── OrderView.tsx
│   ├── OutsideView.tsx
│   ├── PaymentMethodModal.tsx
│   ├── QRCodeModal.tsx
│   ├── SearchBar.tsx
│   ├── StartView.tsx
│   ├── Table.tsx
│   ├── TableTransferModal.tsx
│   ├── Toast.tsx
│   ├── ToppingsModal.tsx
│   └── ViewSelectionView.tsx
├── App.tsx
├── constants.ts
├── types.ts                       ← sẽ bị thay thế ở Phase 2
├── index.tsx
├── index.css
└── index.html
```

---

## 4. localStorage keys — KHÔNG ĐƯỢC THAY ĐỔI

Đây là các keys đang tồn tại trong localStorage của người dùng thực.
Thay đổi bất kỳ key nào sẽ làm mất data của người dùng.

| Key | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `currentScreen` | string | màn hình hiện tại |
| `menuCategories` | JSON array | danh mục menu |
| `tables` | JSON array of entries | dữ liệu bàn (Map.entries format) |
| `selectedTableId` | number | bàn đang chọn |
| `history` | JSON array | lịch sử hóa đơn |
| `pos_app_theme` | `'light'` hoặc `'dark'` | theme |
| `app_version` | string | version app |
| `data_version` | string | version data schema |

---

## 5. Quy trình bắt buộc mỗi ca làm việc
BƯỚC 1 — Đọc file này (AGENTS.md) từ đầu đến cuối
↓
BƯỚC 2 — Đọc docs/HANDOFF.md để biết ca trước dừng ở đâu
↓
BƯỚC 3 — Đọc docs/phases/PHASE-X.md của Phase đang làm
↓
BƯỚC 4 — Chạy npm run dev, verify app đang hoạt động bình thường
trước khi chạm vào bất kỳ file nào
↓
BƯỚC 5 — Thực thi từng task theo đúng thứ tự trong Phase file
↓
BƯỚC 6 — Sau mỗi task nhỏ: chạy npm run dev, verify không crash
↓
BƯỚC 7 — Commit sau mỗi task hoàn thành
↓
BƯỚC 8 — Khi xong toàn bộ Phase: chạy TESTING_CHECKLIST.md
↓
BƯỚC 9 — Cập nhật HANDOFF.md với kết quả đầy đủ
↓
BƯỚC 10 — Commit HANDOFF.md, kết thúc ca

**Không được bỏ qua bất kỳ bước nào.**

---

## 6. Cách chạy project

```bash
# Cài dependencies (chỉ cần chạy lần đầu hoặc sau khi thêm package)
npm install

# Chạy dev server
npm run dev
# → Mở http://localhost:5173

# Kiểm tra TypeScript không có lỗi
npx tsc --noEmit

# Build production (chỉ chạy khi Phase file yêu cầu)
npm run build
```

---

## 7. Git workflow

### Branch
Toàn bộ công việc làm trên branch: `refactor/all-phases`

```bash
# Lần đầu tiên (chỉ agent đầu tiên chạy lệnh này)
git checkout -b refactor/all-phases

# Các ca sau (checkout branch đã có)
git checkout refactor/all-phases
git pull  # đảm bảo có code mới nhất từ ca trước
```

### Commit sau mỗi task
```bash
git add [các files đã thay đổi]
git commit -m "phase-X: mô tả ngắn gọn việc đã làm"
```

**Ví dụ commit message tốt:**
phase-1: fix localStorage.setItem order in version-manager
phase-1: fix unsafe PaymentMethod type in PaymentMethodModal
phase-2: move types to src/types/index.ts
phase-3: extract normalizeVietnamese to string-utils

**Ví dụ commit message xấu:**
fix bugs
refactor stuff
update code
done

### Commit HANDOFF.md cuối ca
```bash
git add docs/HANDOFF.md
git commit -m "handoff: [tên agent] ca [ngày giờ]"
```

### KHÔNG được làm với Git
- Không `git push` lên remote (chưa được phép)
- Không merge vào `main`
- Không tạo branch mới
- Không `git reset --hard` mà không ghi vào HANDOFF.md

---

## 8. Coding conventions

### TypeScript
```typescript
// ✅ ĐÚNG — dùng import type cho type-only imports
import type { TableData, MenuItem } from '../src/types';

// ❌ SAI
import { TableData, MenuItem } from '../src/types';

// ✅ ĐÚNG — explicit return type cho functions trong src/lib/
export function calcOrderTotal(items: OrderItem[]): number {

// ❌ SAI — không dùng any
const data = JSON.parse(saved) as any;

// ❌ SAI — không dùng non-null assertion trừ khi chắc chắn 100%
const table = tables.get(id)!;

// ✅ ĐÚNG — handle undefined explicitly
const table = tables.get(id);
if (!table) return;
```

### Imports — thứ tự cố định
```typescript
// 1. React
import React, { useState, useCallback } from 'react';

// 2. Thư viện ngoài
import { toPng } from 'html-to-image';

// 3. Types
import type { TableData, MenuItem } from '../src/types';

// 4. Constants
import { MENU_CATEGORIES } from '../constants';

// 5. Hooks
import { useTheme } from '../src/context/ThemeContext';

// 6. Utils/lib
import { calcOrderTotal } from '../src/lib/order-utils';

// 7. Components
import Toast from './Toast';
```

### JSDoc cho functions trong `src/lib/`
```typescript
// ✅ ĐÚNG — mọi public function phải có JSDoc
/**
 * Tính tổng tiền của một order item bao gồm toppings.
 * @param item - OrderItem cần tính
 * @returns Tổng tiền tính bằng VND
 */
export function calcItemTotal(item: OrderItem): number {

// ❌ SAI — không có JSDoc
export function calcItemTotal(item: OrderItem): number {
```

### Comments trong code
```typescript
// ✅ ĐÚNG — giải thích TẠI SAO
// Dùng Map.entries() để serialize Map thành JSON-compatible array
localStorage.setItem('tables', JSON.stringify(Array.from(tables.entries())));

// ❌ SAI — giải thích LÀM GÌ (đã rõ từ code)
// Lưu tables vào localStorage
localStorage.setItem('tables', JSON.stringify(Array.from(tables.entries())));

// ❌ SAI — không để lại debug logs
console.log('tables:', tables);

// ✅ ĐÚNG — error logs có nghĩa thì giữ lại
console.error('Failed to parse saved tables:', error);
```

---

## 9. Những điều TUYỆT ĐỐI không được làm
❌ Thay đổi localStorage key names
❌ Thay đổi UI (màu sắc, layout, text hiển thị, kích thước)
❌ Thay đổi UX (flow thanh toán, flow chọn bàn, flow gọi món)
❌ Thêm npm package mới mà không ghi vào HANDOFF.md và hỏi trước
❌ Refactor code ngoài phạm vi Phase đang làm
❌ Dùng as any để bypass TypeScript error
❌ Xóa file cũ khi code thay thế chưa được test xong
❌ Làm nhiều task cùng lúc (làm xong task 1 mới làm task 2)
❌ Bỏ qua bước test sau mỗi task
❌ Kết thúc ca mà không cập nhật HANDOFF.md
❌ Tự ý giải quyết vấn đề ngoài phạm vi Phase file mô tả

---

## 10. Khi gặp vấn đề — làm theo thứ tự này

Dừng lại, không làm thêm gì
Nếu đã thay đổi file và bị lỗi → revert file đó về trạng thái trước
git checkout -- [tên file]
Ghi vào HANDOFF.md:

Vấn đề cụ thể là gì
File nào liên quan
Đã thử cách nào
Cần quyết định gì


Commit HANDOFF.md
Kết thúc ca, chờ người quản lý hoặc agent tiếp theo xử lý


**Nguyên tắc vàng: Một bug được ghi chép rõ ràng
còn tốt hơn một bug được "fix" sai cách.**

---

## 11. Definition of Done cho toàn bộ dự án

Toàn bộ 8 phases được coi là hoàn thành khi:
- [ ] `npx tsc --noEmit` chạy với 0 errors
- [ ] `npm run build` thành công không có warnings
- [ ] Toàn bộ TESTING_CHECKLIST.md pass 100%
- [ ] Không có `console.log` debug còn sót
- [ ] Không có `as any` trong codebase
- [ ] HANDOFF.md ghi nhận tất cả phases đã hoàn thành
- [ ] Báo cáo lại người quản lý để ra quyết định tiếp theo

---

*Phiên bản tài liệu này: 1.0*
*Cập nhật bởi: người quản lý dự án*
*Agents không được tự ý chỉnh sửa file AGENTS.md*