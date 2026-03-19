PLAN: LivinX — Customer UI Overhaul
Mode: PLANNING (Phase 1–3 only — No code yet) Agent: project-planner + frontend-specialist Ngày lập: 2026-03-19

📋 Overview
Dự án LivinX là nền tảng tìm kiếm và cho thuê phòng trọ tại Việt Nam. Stack: React 19 + Vite + Tailwind CDN (via 
index.html
) + Node.js/Express + MySQL/Sequelize.

Sau khi rà soát toàn bộ codebase, yêu cầu là:

Kiểm kê tất cả vấn đề còn tồn đọng (thiếu, chưa ổn, bugs).
Thiết kế lại UI trang khách hàng theo chuẩn premium, professional.
🔍 Audit Findings — Những gì còn thiếu & chưa ổn
🔴 Critical — Bugs / Broken Features
#	Vấn đề	Vị trí	Mức độ
1	RegisterPage dùng class CSS cũ (auth-page, auth-card, auth-input) không match với style system hiện tại của login page (dùng Tailwind JIT)	
RegisterPage.jsx
Critical
2	ListingsSection "Xem tất cả →" link dùng href="#" — broken link, không route đến /rooms	ListingsSection.jsx:108	Critical
3	FavoritesPage: nút "Bỏ yêu thích" không có confirm — user dễ xóa nhầm	
FavoritesPage.jsx
High
4	ProfilePage: tất cả form fields đều readOnly — không có chức năng cập nhật thông tin (fullName, phone, area)	
ProfilePage.jsx
High
5	ChatPage: nút call và info trong header chat không có handler — chết hoàn toàn	ChatPage.jsx:188-193	High
6	Socket trên RoomDetailPage: socket được tạo trong useMemo nhưng điều khiển connect/disconnect theo showChatComposer — có thể gây race condition	RoomDetailPage.jsx:60-69	High
7	RoomsPage và HomePage duplicate hoàn toàn logic loadRooms — vi phạm DRY	
RoomsPage.jsx
 + 
HomePage.jsx
Medium
8	AppointmentsPage: không có nút huỷ lịch hẹn cho user	
AppointmentsPage.jsx
Medium
9	RoomDetailPage: averageRating hiển thị "0.0" khi không có review thay vì "Chưa có đánh giá"	RoomDetailPage.jsx:91-97	Low
10	index.html: title "LivinX - Tim phong tro de dang" thiếu dấu tiếng Việt (SEO)	index.html:41	Low
🟡 Warning — UX Issues
#	Vấn đề	Mô tả
11	RegisterPage thiếu hình ảnh minh hoạ (left panel) như Login page	Inconsistent UX
12	FavoritesPage / AppointmentsPage dùng class CSS cũ không nhất quán với RoomDetailPage	Style inconsistency
13	HeroSection dùng static mock data (số liệu "12.400+", "98%")	Fake data
14	SearchSection không có debounce khi gõ input	Performance issue
15	ChatPage trên mobile: sidebar inbox bị ẩn hoàn toàn — không có tab chuyển đổi	Mobile UX broken
16	ProfilePage icon verified — chưa check từ backend	Fake state
17	SiteFooter: tất cả link dùng href="#" — dead links	SEO/UX
18	RoomDetailPage: Map section chỉ là placeholder SVG — không tích hợp Maps	Missing feature
19	LoadingState component cực kỳ đơn giản — cần skeleton UI	Poor UX
🔵 Code Quality Issues
#	Vấn đề	Mô tả
20	uploadBaseUrl được tính lại bằng regex trong nhiều component	DRY violation
21	
formatMessageTime
 duplicate giữa 
ChatPage.jsx
 và 
RoomDetailPage.jsx
DRY violation
22	
renderRatingStars
 chỉ tồn tại trong 
RoomDetailPage.jsx
 — nên là shared component	Not reusable
23	AuthContext: functions không wrap useCallback nhưng nằm trong useMemo	Minor perf
24	Backend: 
middleware/auth.js
 không cache user — mỗi request đều query DB	Performance
25	Backend không có rate limiting trên auth endpoints	Security
❌ Thiếu hoàn toàn (Missing Features)
#	Feature	Ghi chú
26	Pagination trên /rooms page — hiện load 50 phòng flat	Missing
27	Tìm kiếm theo từ khoá (search by title/description)	Missing
28	Huỷ lịch hẹn (cancel appointment) từ phía khách hàng	Missing
29	Cập nhật thông tin cá nhân (update profile)	Missing
30	Đổi mật khẩu	Missing
31	Forgot password — button có nhưng không có logic	Missing
32	Notification real-time khi lịch hẹn được duyệt/từ chối	Missing
33	Breadcrumb navigation trên room detail	Missing
34	Share room functionality	Missing
35	Image lazy loading với placeholder blur	Missing
🎯 Success Criteria (Immediate Scope)
 Audit document hoàn chỉnh với 35 vấn đề được ghi nhận
 Customer UI pages redesigned — premium, professional, không generic
 RegisterPage đồng nhất visual với LoginPage
 
ListingsSection
 link "Xem tất cả" hoạt động
 LoadingState → Skeleton UI
 ChatPage mobile tab switcher
 FavoritesPage confirm trước khi xóa
 SEO: title, meta description đầy đủ tiếng Việt
 prefers-reduced-motion được respect
🎨 Design System — LivinX Customer Portal
Color Palette (Premium Property Style)
--primary:        #0D3B2E   (Deep Forest Green — trust, premium)
--primary-mid:    #25A97A   (Emerald — CTA, energy)  
--primary-light:  #E8F5EF   (Mint tint — backgrounds)
--accent:         #FF5C35   (Warm Coral — urgency, price highlight)
--accent-light:   #FFF1EC
--bg:             #F8F9FA   (Neutral gray-white)
--surface:        #FFFFFF
--text-primary:   #0D1117
--text-secondary: #4B5563
--text-muted:     #9CA3AF
--border:         #E5E7EB
--shadow-card:    0 2px 8px rgba(13,59,46,0.08), 0 1px 2px rgba(0,0,0,0.04)
Typography
Heading:  "Plus Jakarta Sans" — modern, bold, readable
Body:     "Be Vietnam Pro"    — đã có sẵn, Vietnamese-native
Import:   fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800
Design Principles
🎨 DESIGN COMMITMENT: EDITORIAL PROPERTY MARKETPLACE
Geometry:       Sharp 8px radius for cards, full pill for tags only
Animation:      Hover: translateY(-4px) + shadow lift — 200ms ease-out
                Scroll: staggered fade-in-up per card
                No: glassmorphism, mesh gradients, aurora
Cards:          Magazine-style staggered grid (NOT equal-column bento)
Hero:           Full-width editorial, search bar overlaps hero bottom
Color:          Deep green primary (NOT blue, NOT purple)
Typography:     Bold display headings, lightweight body
📁 Files to Change
Rental/frontend/
├── index.html                               → SEO, fonts, title fix
├── public/css/index.css                     → New color tokens
├── src/components/common/
│   ├── LoadingState.jsx                     → Skeleton upgrade
│   ├── RatingStars.jsx          [NEW]       → Shared star component
│   └── SkeletonCard.jsx         [NEW]       → Skeleton card
├── src/components/home/components/
│   ├── HeroSection.jsx                      → Full redesign
│   ├── ListingsSection.jsx                  → Fix link + new cards
│   └── SearchSection.jsx                    → Debounce
├── src/components/layout/
│   └── SiteFooter.jsx                       → Fix dead links
├── src/pages/
│   ├── RegisterPage.jsx                     → Match LoginPage layout
│   ├── FavoritesPage.jsx                    → New card + confirm
│   ├── AppointmentsPage.jsx                 → Timeline UI
│   ├── ChatPage.jsx                         → Mobile tabs fix
│   └── ProfilePage.jsx                      → Editable fields
📋 Task Breakdown
Phase 1: Foundation
Task	File	Agent	Priority
1.1 CSS Tokens	
public/css/index.css
frontend-specialist	P0
1.2 SEO/HTML	
index.html
frontend-specialist	P0
Phase 2: Shared Components
Task	File	Agent	Priority
2.1 Skeleton UI	
LoadingState.jsx
 + SkeletonCard.jsx	frontend-specialist	P1
2.2 RatingStars	RatingStars.jsx (new)	frontend-specialist	P1
Phase 3: Customer Pages
Task	File	Focus
3.1 HeroSection	
HeroSection.jsx
 + 
home.css
Full redesign
3.2 ListingsSection	
ListingsSection.jsx
Fix + new cards
3.3 RegisterPage	
RegisterPage.jsx
Match LoginPage
3.4 FavoritesPage	
FavoritesPage.jsx
New UI + confirm
3.5 AppointmentsPage	
AppointmentsPage.jsx
Timeline layout
3.6 ChatPage	
ChatPage.jsx
Mobile tabs
3.7 ProfilePage	
ProfilePage.jsx
Editable fields
Phase 4: Minor Fixes
Task	File	Fix
4.1 Footer links	
SiteFooter.jsx
Real routes
4.2 Pagination	
RoomsPage.jsx
Pagination component
4.3 Debounce	
SearchSection.jsx
300ms debounce
🗓 Execution Order
1.1 → 1.2 → [2.1, 2.2] → 3.1 → 3.2 → [3.3, 3.4, 3.5] → [3.6, 3.7] → [4.1, 4.2, 4.3] → Phase X
⚠ Risks
Risk	Mitigation
Backend không có PATCH /api/auth/me	Check trước khi làm task 3.7
Tailwind CDN — một số utilities không work	Test per page, fallback CSS
CSS conflict old classes vs Tailwind	Migrate file-by-file, test each
Phase X: Verification Checklist
[ ] npm run lint — no errors
[ ] npm run build — success
[ ] All pages responsive: 375px, 768px, 1024px, 1440px
[ ] No dead href="#" links
[ ] Skeleton shows before data loads
[ ] prefers-reduced-motion: animations disabled
[ ] SEO: proper Vietnamese title + meta description
[ ] WCAG AA contrast: 4.5:1
[ ] No purple/violet as primary
[ ] Cards have cursor-pointer
[ ] Hover transitions 150-300ms
