# 🍃 Bống Cà Phê POS

Hệ thống quản lý đơn hàng sang trọng cho quán cà phê Bống, được thiết kế với giao diện luxury và responsive hoàn hảo.

## ✨ Tính năng

- 🏠 **Quản lý bàn trong nhà**: 8 bàn với layout tối ưu
- 🌳 **Quản lý bàn ngoài trời**: 8 bàn với grid responsive
- 📱 **Responsive design**: Hoạt động hoàn hảo trên mobile, tablet và desktop
- 🎨 **Giao diện luxury**: Thiết kế hiện đại với glass morphism và gradient
- 💳 **Quản lý đơn hàng**: Thêm, sửa, xóa món ăn dễ dàng
- 📊 **Thực đơn đầy đủ**: 9 danh mục với hơn 100 món
- 💰 **Tính tiền tự động**: Tính tổng và thanh toán nhanh chóng

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd bống-cà-phê-pos

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

### Truy cập
- **Local**: http://localhost:5173
- **Network**: http://[your-ip]:5173

## 🎯 Cách sử dụng

### 1. Chuyển đổi view
- Click "🏠 Trong nhà" để xem bàn trong nhà
- Click "🌳 Ngoài trời" để xem bàn ngoài trời

### 2. Quản lý bàn
- **Bàn trống**: Hiển thị màu xanh dương
- **Bàn có khách**: Hiển thị màu cam
- Click vào bàn để mở modal đặt hàng

### 3. Đặt hàng
- Chọn món từ thực đơn bên phải
- Điều chỉnh số lượng bằng nút +/- 
- Xóa món bằng nút 🗑️
- Click "💳 Thanh toán" để hoàn tất

## 🎨 Thiết kế

### Color Scheme
- **Primary**: Gradient xanh dương (#4facfe → #00f2fe)
- **Secondary**: Gradient tím (#667eea → #764ba2)
- **Warning**: Gradient cam (#fa709a → #fee140)
- **Background**: Gradient slate (#f8fafc → #e2e8f0)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Effects
- **Glass morphism**: Backdrop blur và transparency
- **Gradient**: Linear gradient cho buttons và backgrounds
- **Shadows**: Luxury shadow với độ sâu tinh tế
- **Animations**: Smooth transitions và hover effects

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (2 cột grid)
- **Tablet**: 640px - 1024px (3-4 cột grid)
- **Desktop**: > 1024px (Layout 2 cột)

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Cấu trúc project

```
bống-cà-phê-pos/
├── components/          # React components
│   ├── Header.tsx      # Header với navigation
│   ├── Table.tsx       # Component bàn
│   ├── InsideView.tsx  # View bàn trong nhà
│   ├── OutsideView.tsx # View bàn ngoài trời
│   ├── OrderModal.tsx  # Modal đặt hàng
│   └── icons.tsx       # SVG icons
├── constants.ts         # Dữ liệu menu và bàn
├── types.ts            # TypeScript interfaces
├── App.tsx             # Component chính
├── index.tsx           # Entry point
├── index.html          # HTML template
├── index.css           # Custom styles
└── package.json        # Dependencies
```

## 🔧 Tùy chỉnh

### Thay đổi menu
Chỉnh sửa file `constants.ts` để thêm/sửa/xóa món ăn và danh mục.

### Thay đổi số lượng bàn
Cập nhật `INITIAL_TABLES` trong `constants.ts`.

### Tùy chỉnh giao diện
Sửa đổi `index.css` để thay đổi colors, fonts và effects.

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

---

**Bống Cà Phê** - Nơi hương vị gặp gỡ công nghệ ✨
