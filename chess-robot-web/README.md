# Chess Robot Web Application

Ứng dụng web quản lý Chess Robot được xây dựng với React + TypeScript + Vite, đồng bộ giao diện với ứng dụng mobile.

## 🎨 Tính năng

- **Dashboard**: Trang chủ với thống kê, quick play, và bảng xếp hạng
- **Difficulty Select**: Chọn độ khó để chơi với bot (Easy/Medium/Hard)
- **Match History**: Lịch sử các trận đấu đã chơi
- **Ranking**: Bảng xếp hạng toàn cầu và bạn bè
- **Profile**: Quản lý thông tin cá nhân và cài đặt
- **Puzzles**: Danh sách các câu đố cờ vua
- **Tutorial**: Hướng dẫn học cách chơi cờ vua

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── pages/           # Các trang chính
│   ├── DifficultySelect.tsx
│   ├── MatchHistory.tsx
│   ├── Ranking.tsx
│   ├── Profile.tsx
│   ├── Puzzles.tsx
│   └── Tutorial.tsx
├── components/      # Shared components
│   └── GameModeModal.tsx
├── App.tsx          # Router và Dashboard
├── index.css        # CSS variables và global styles
├── Dashboard.css    # Styles cho Dashboard
├── DifficultySelect.css
├── MatchHistory.css
├── Ranking.css
├── Profile.css
├── Puzzles.css
└── Tutorial.css
```

## 🎨 Design System

### Colors (CSS Variables)
- `--color-text`: Màu chữ chính
- `--color-text-secondary`: Màu chữ phụ
- `--color-background`: Màu nền
- `--color-primary`: Màu chính (#2563EB - Royal Blue)
- `--color-secondary`: Màu phụ (#4F46E5 - Indigo)
- `--color-card`: Màu card/panel
- `--color-border`: Màu viền
- `--color-icon`: Màu icon

### Typography
- Font family: System UI stack
- Headings: Bold, 18-32px
- Body text: Regular, 14-16px

## 🔄 Đồng bộ với Mobile

Giao diện web được thiết kế đồng bộ với `chess-robot-mobile`:
- Sử dụng cùng bảng màu (Colors)
- Layout tương tự (Sidebar + Main Content)
- Component styles được port từ React Native sang CSS

## 📱 Responsive Design

- Desktop: Sidebar dọc bên trái
- Mobile: Sidebar ngang ở dưới cùng
- Breakpoint: 768px

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Lucide React** - Icons
- **CSS Variables** - Theming

## 📝 Notes

- Ứng dụng hiện tại sử dụng mock data
- Chưa tích hợp backend API
- Dark mode đã được chuẩn bị trong CSS variables nhưng chưa implement toggle
