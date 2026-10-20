# Vũ Trụ Tình Yêu 3D — Bản Nâng Cấp Chuyên Sâu Cho iPhone & Quét Mã QR

Ứng dụng web quà tặng 3D tương tác thời gian thực được thiết kế chuyên biệt cho kịch bản **bạn tạo quà trên máy mình và bạn gái dùng iPhone quét mã QR để mở quà**: kết hợp 12.000 hạt 3D biến hình, vòng xoay ảnh kỷ niệm, gợi ý xoay ngang thông minh, cảm ứng đa điểm + nghiêng máy 3D, điều khiển cử chỉ tay AI, nhạc nền lãng mạn và phong bì thư tình.

## User Review & Critical Decisions (Nâng Cấp Mới)

> [!IMPORTANT]
> **Tư duy sâu cho trải nghiệm quét QR trên iPhone (iOS Safari)**:
> Khi bạn gái quét mã QR bằng Camera iPhone, trình duyệt Safari trên iOS có 4 đặc thù kỹ thuật cực kỳ quan trọng mà bản nâng cấp này giải quyết triệt để:
> 1. **Đồng bộ Ảnh & Thư qua Server khi quét QR**: Nếu chỉ lưu ảnh trên máy của bạn (`localStorage`), khi bạn gái lấy iPhone quét QR sẽ không thấy ảnh bạn đã tải lên. Bản nâng cấp bổ sung **Server lưu trữ quà tặng + Bộ tạo Thiệp Mã QR** để bạn tải ảnh/viết thư trên máy mình, bấm *Lưu & Lấy QR*, và khi bạn gái quét trên iPhone sẽ hiện đúng bộ ảnh và lá thư của hai đứa!
> 2. **Gợi ý Xoay Ngang Thông Minh (Smart Landscape + Adaptive 3D)**: Khi cầm dọc iPhone, màn hình sẽ có hiệu ứng gợi ý xoay ngang để ngắm trọn vẹn Vũ Trụ 3D chuẩn điện ảnh. Đặc biệt, nếu iPhone của bạn gái đang bật **Khóa xoay dọc (Portrait Lock)**, hệ thống vẫn cho phép bấm xem ngay và tự động thu phóng lùi Camera 3D (`Adaptive FOV/Zoom`) để vòng ảnh và trái tim không bao giờ bị cắt lẹm ở mép màn hình dọc.
> 3. **Màn hình "Chạm Mở Hộp Quà 3D" vượt rào cản chặn nhạc của iPhone**: iOS Safari chặn tự động phát nhạc nền cho đến khi người dùng chạm tay lần đầu. Màn hình **Chạm để Mở Hộp Quà Vũ Trụ** ngay khi quét QR vừa tạo bất ngờ cảm xúc, vừa giúp **nhạc nền tự động ngân vang ngay khoảnh khắc mở quà**.
> 4. **3 Chế độ tương tác trên iPhone (Vuốt Đa Điểm + Nghiêng Máy Hologram + Camera AI)**: Cầm iPhone một tay để giơ ngón tay trước camera đôi khi dễ mỏi hoặc rung; vì vậy trên iPhone bạn gái có thể **vuốt 1 ngón xoay 360°, chụm 2 ngón Zoom, nghiêng nhẹ iPhone để dịch chuyển góc nhìn 3D**, hoặc bấm bật **Camera AI** bất cứ lúc nào để điều khiển bằng cử chỉ ngón tay.

---

## 1. Overview & Core Concept

- **Trải nghiệm cốt lõi**:
  - **Dành cho bạn (Người tặng)**: Tải ảnh kỷ niệm của hai người lên web, viết lời chúc tiêu đề, soạn tâm thư trong phong bì, chọn giai điệu nhạc nền và bấm **Lưu & Tạo Mã QR**. Hệ thống xuất ra tấm **Thiệp QR Vũ Trụ** để bạn in kẹp vào bó hoa hoặc gửi cho bạn gái quét.
  - **Dành cho bạn gái (Trên iPhone / Máy tính)**: Quét mã QR -> Màn hình gợi ý xoay ngang & Hộp Quà Ánh Sao hiện ra -> Chạm mở hộp quà -> Nhạc nền vang lên cùng 12.000 hạt sáng tụ lại thành **Trái Tim 3D** và **Vòng Quỹ Đạo Ảnh Kỷ Niệm** bay xung quanh.
- **4 Hình thái Biến hình Vũ trụ Hạt 3D**:
  1. **Trái Tim Tình Yêu (1 Ngón / Nút 1)**: Trái tim 3D khổng lồ có nhịp đập sinh động.
  2. **Thiên Hà Kỷ Niệm (2 Ngón / Nút 2)**: Dải ngân hà xoắn ốc 4 nhánh rực rỡ.
  3. **Đóa Hoa Hồng 3D (3 Ngón / Nút 3)**: Bông hoa 3D nở rộ tặng người thương.
  4. **Tinh Cầu Vĩnh Cửu (4 Ngón / Nút 4)**: Hành tinh Sao Thổ và vành đai ánh sáng.

---

## 2. User Experience & Visual Design

### Hành trình trải nghiệm trên iPhone khi Quét Mã QR

1. **Bước 1 — Quét QR & Màn Hình Hộp Quà + Gợi Ý Xoay Ngang**:
   - Bạn gái đưa Camera iPhone quét mã QR.
   - Màn hình chào đón hiện hộp quà phát sáng giữa bầu trời sao cùng biểu tượng xoay ngang điện thoại mềm mại: *"Xoay ngang iPhone để đắm chìm trong không gian 3D toàn cảnh ✨"*.
   - Nếu bạn gái xoay ngang máy, giao diện tự động chuyển sang bố cục **Cinema Widescreen** (tận dụng tối đa màn hình iPhone và tránh tai thỏ/Dynamic Island nhờ `safe-area-inset`). Nếu vẫn giữ máy dọc, nút **"Mở Món Quà Của Em 🎁"** vẫn hoạt động mượt mà với góc nhìn 3D tự động căn chỉnh vừa khít chiều dọc.
2. **Bước 2 — Bung Nở Vũ Trụ Hạt & Vòng Ảnh Kỷ Niệm**:
   - Ngay khi chạm mở quà, giai điệu nhạc nền lãng mạn cất lên. Hàng vạn hạt sáng từ hư không hội tụ về tâm thành Trái Tim 3D, đồng thời các khung ảnh Polaroid phát sáng bay theo quỹ đạo nghiêng bao quanh.
3. **Bước 3 — Tương Tác Đa Chiều (Touch + Nghiêng Máy + AI Camera)**:
   - **Trên màn hình cảm ứng iPhone**: Vuốt nhẹ để xoay vòng ảnh, chụm 2 ngón để phóng to, **chạm đúp (Double Tap)** vào màn hình để bắn pháo hoa tim sáng rực.
   - **Chế độ Camera AI Cử Chỉ Tay**: Trên máy tính có Webcam sẽ tự động kích hoạt; trên iPhone được đặt thành nút chuyển nhanh `🖐️ Bật Điều Khiển Tay AI` ở thanh công cụ dưới để không làm hiện bảng xin quyền Camera thô kệch của iOS ngay lúc bạn gái đang xúc động mở hộp quà.
4. **Bước 4 — Chạm Vào Ảnh & Mở Phong Bì Thư Tình**:
   - Chạm vào bất kỳ bức ảnh nào đang bay trên quỹ đạo 3D (hoặc bấm nút **Thư Tình 💌**) sẽ mở hiệu ứng lật phong bì 3D, rút bức thư tay ngọt ngào kèm ảnh kỷ niệm sắc nét.

### Visual Identity & Theme

- **Phong cách thẩm mỹ**: *Romantic Cosmic Neon* — Tông **Hồng Neon (`#ff2a75`, `#ff6b9d`) & Tím Tinh Vân (`#a855f7`, `#05020a`)** như bản mẫu bạn yêu thích, nâng cấp thêm lớp bụi sao lấp lánh (Starfield) ở hậu cảnh tạo chiều sâu 3D.
- **Typography & Hierarchy**:
  - **Tiêu đề lãng mạn**: `Dancing Script` phát sáng neon hồng phấn.
  - **Nội dung & Điều khiển**: `Quicksand` rõ nét, kích thước nút bấm đạt chuẩn cảm ứng iPhone ($\ge 44\text{px}$).
- **Bố cục Chuẩn iPhone (iOS Safe Area & Thumb-Zone)**:
  - Thanh điều khiển dưới đáy màn hình thiết kế gọn gàng trong vùng ngón tay cái, có nút **Thu gọn giao diện (Cinema Mode)** để bạn gái ngắm trọn vẹn 100% không gian 3D hoặc quay màn hình lưu giữ kỷ niệm.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Đồng bộ Quà Tặng Qua Backend API + Tạo Thiệp QR Trực Tiếp**
  - *Giải pháp chọn*: Xây dựng API lưu trữ dữ liệu quà tặng (danh sách ảnh kỷ niệm đã nén tối ưu, lời chúc, nội dung thư tình, cấu hình nhạc) trên Server kèm mã định danh `?gift=...` và trình tạo mã QR ngay trong ứng dụng.
  - *Lý do*: Đảm bảo khi bạn chuẩn bị xong món quà trên máy của mình và xuất mã QR, bạn gái dùng iPhone quét mã ở bất kỳ đâu cũng tải đúng 100% ảnh và lời nhắn bạn đã thiết lập.
- **Decision 2: Cơ chế Gợi Ý Xoay Ngang "Mềm" Kết Hợp Tự Động Căn Khung 3D (Responsive FOV)**
  - *Giải pháp chọn*: Hiển thị hiệu ứng nhắc xoay ngang trực quan khi iPhone ở chiều dọc nhưng không khóa cứng màn hình, đồng thời tự động tính toán khoảng cách Camera 3D (`camera.position.z`) theo tỷ lệ `width / height` của màn hình.
  - *Lý do*: 80% người dùng iPhone bật chế độ Khóa xoay dọc (Portrait Orientation Lock). Nếu ép buộc phải xoay ngang mới mở được web, bạn gái sẽ tưởng web bị đơ; giải pháp vừa gợi ý xoay ngang vừa tự động co giãn 3D giúp trải nghiệm hoàn hảo trong mọi tư thế cầm máy.
- **Decision 3: Khởi Tạo Camera AI Thông Minh Theo Thiết Bị**
  - *Giải pháp chọn*: Trên máy tính (Desktop), tự động bật khung AI Camera góc phải dưới như bản mẫu; trên iPhone (Mobile), ưu tiên cảm ứng đa điểm + nghiêng máy mượt mà ngay khi mở quà và cung cấp nút `🖐️ Bật Cam AI` 1 chạm (sử dụng camera trước `facingMode: "user"` với thuộc tính `playsinline` chuẩn iOS).
  - *Lý do*: Tránh hộp thoại *"Trang web muốn sử dụng Camera"* của iOS nhảy ra che mất khoảnh khắc mở hộp quà và phát nhạc đầu tiên.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     VŨ TRỤ TÌNH YÊU 3D (FULL-STACK GIFT APP)                 │
├───────────────────────────────────────┬──────────────────────────────────────┤
│     KHÔNG GIAN 3D & ĐỒ HỌA (WEBGL)    │    ĐIỀU KHIỂN ĐA PHƯƠNG THỨC (INPUT) │
│  ┌─────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ 12.000 Hạt 3D + Bụi Sao Nền     │  │  │ 1. Cảm Ứng Đa Điểm iPhone      │  │
│  │ • Trái Tim / Thiên Hà / Hoa /   │◄─┼──┤    • Vuốt 1 ngón xoay 360°     │  │
│  │   Sao Thổ + Pháo hoa chạm đúp   │  │  │    • Chụm 2 ngón Pinch-to-Zoom │  │
│  └────────────────┬────────────────┘  │  ├────────────────────────────────┤  │
│                   │                   │  │ 2. Cảm Biến Nghiêng (Gyro)     │  │
│  ┌────────────────▼────────────────┐  │  │    • Nghiêng iPhone tạo chiều  │  │
│  │ Vòng Quỹ Đạo Ảnh Kỷ Niệm 3D     │  │  │      sâu 3D Hologram           │  │
│  │ • Khung ảnh Polaroid phát sáng  │◄─┼──┼────────────────────────────────┤  │
│  │ • Tự động căn khoảng cách Z     │  │  │ 3. AI Camera (MediaPipe Hands) │  │
│  │   theo màn hình Ngang / Dọc     │  │  │    • Đếm 1-4 ngón đổi hình 3D  │  │
│  └────────────────┬────────────────┘  │  │    • Chụm cái-trỏ & xoay tay   │  │
│                   │                   │  └────────────────────────────────┘  │
├───────────────────┴───────────────────┴──────────────────────────────────────┤
│                GIAO DIỆN TRẢI NGHIỆM & ĐỒNG BỘ MÃ QR (SERVER + UI)           │
│  ┌────────────────────┐ ┌───────────────────┐ ┌───────────────────────────┐  │
│  │ Màn Hình Mở Quà &  │ │ Phong Bì Thư Tình │ │ Studio Sửa Ảnh, Nhạc &    │  │
│  │ Gợi Ý Xoay Ngang   │ │ 3D + Nhạc Nền iOS │ │ Tạo Thiệp QR (/api/gift)  │  │
│  └────────────────────┘ └───────────────────┘ └───────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Server Sync Strategy

- **Cấu trúc gói quà (`GiftPayload`)**:
  - `id`: Mã quà tặng định danh (mặc định đồng bộ trực tiếp vào gói chính và hỗ trợ link chia sẻ `?gift=<id>`).
  - `bannerTitle` & `bannerSubtitle`: Tiêu đề lời chúc trên đỉnh màn hình (ví dụ: *"Happy Women's Day 20/10 ❤️"*).
  - `memories`: Danh sách các bức ảnh kỷ niệm bay quanh khối hạt 3D (`imageUrl`, `caption`, `date`, `story`).
  - `loveLetter`: Nội dung phong bì thư tình (`recipient`, `title`, `content`, `sender`, `date`).
  - `musicTrack`: Giai điệu nhạc nền được chọn (3 bản Hộp nhạc/Piano có sẵn hoặc dữ liệu âm thanh tải lên).
- **API Đồng bộ (`/api/gift`)**:
  - `GET /api/gift`: Trả về cấu hình quà tặng mới nhất để khi bạn gái quét mã QR trên iPhone sẽ nhận ngay bộ ảnh và bức thư bạn vừa lưu.
  - `POST /api/gift`: Lưu toàn bộ ảnh kỷ niệm, lời chúc và thư tình từ Studio Tùy Chỉnh lên Server.

### Interactive Component & State Mapping

- **`IntroGiftOverlay` (Màn hình Mở Quà & Gợi Ý Xoay Ngang iPhone)**:
  - Tự động kiểm tra hướng màn hình (`window.innerHeight > window.innerWidth`). Nếu đang cầm dọc trên điện thoại, hiển thị hiệu ứng minh họa xoay ngang iPhone kèm nút mở hộp quà.
  - Khi bấm **"Chạm Để Mở Quà 🎁"**, khởi tạo `AudioContext` để phát nhạc nền hợp lệ trên iOS Safari, kích hoạt hiệu ứng hạt hội tụ và chuyển vào không gian 3D chính.
- **`CosmicScene3D` (Không gian 3D Adaptive + Pháo Hoa Chạm Đúp)**:
  - Lắng nghe sự kiện `resize` và `orientationchange` trên iPhone để tự động điều chỉnh `camera.position.z` (Ngang: `45`, Dọc: `68`) giúp toàn bộ vòng ảnh luôn nằm trọn trong tầm mắt.
  - Hỗ trợ chạm vào từng bức ảnh 3D đang bay (`Raycaster`) để mở cửa sổ xem ảnh lớn kèm lời nhắn riêng, hoặc chạm đúp (`dblclick` / double-tap) để tung hiệu ứng hạt pháo hoa tim.
- **`QrShareModal` (Tạo Thiệp Mã QR Tặng Bạn Gái)**:
  - Tự động vẽ tấm **Thiệp QR Vũ Trụ Tình Yêu** (gồm mã QR dẫn thẳng tới trang quà tặng trên iPhone, tên người nhận và khung viền ánh sao) với nút **Tải Thiệp QR Về Máy** để bạn gửi hoặc đưa cho bạn gái quét ngay.
