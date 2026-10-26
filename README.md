# 🛡️ TuBlock — Super AdBlocker & Circumvention Defuser

<p align="center">
  <b>Trình chặn quảng cáo chuyên dụng diệt Popunder, Click-Shield và First-Party Ads cho các trang web phim, truyện & bóng đá.</b><br>
  <i>A specialized ad blocker defusing first-party ads, popunders, and aggressive streaming overlays.</i>
</p>

<p align="center">
  <a href="#-tiếng-việt">🇻🇳 <b>Tiếng Việt</b></a> •
  <a href="#-english">🇬🇧 <b>English</b></a> •
  <a href="#-giấy-phép--license-gplv3">📄 <b>License (GPLv3)</b></a>
</p>

---

## 🇻🇳 Tiếng Việt

### 📋 Giới thiệu

**TuBlock** là phiên bản AdBlocker tùy biến mã nguồn mở mạnh mẽ, được tối ưu đặc trị các hệ thống quảng cáo xâm lấn, popunder, redirect tab-under và lớp phủ tàng hình (invisible overlays) trên các trang web giải trí, xem phim, truyện tranh và trực tiếp bóng đá:

- **🚫 Triệt tiêu First-Party Ads & Banner cờ bạc:** Tự động phát hiện và loại bỏ các banner cá cược cứng (789BET, 11BET, 78WIN, QQ88, HI88...) được nhúng trực tiếp vào mã nguồn website hoặc load qua proxy nội bộ.
- **🛑 Bẻ gãy Popunder & Tab-Under Redirect:** Giám sát `EventTarget.prototype.addEventListener`, vô hiệu hóa các listener bẫy click chuột và ngăn chặn kỹ thuật tráo đổi URL tab nền (`window.location.assign/replace`).
- **🛡️ Hóa giải Invisible Click-Shield Overlays:** Tự động phát hiện và vô hiệu hóa các lớp kính tàng hình (`z-index` cao) che phủ Video Player mà **không gây crash React / Next.js / Vue Virtual DOM** (sử dụng phương pháp safe CSS hiding thay vì `node.remove()`).
- **🍪 Vượt Cookie Walls & Distraction Dialogs:** Tự động đóng và làm sạch các popup thông báo cookie, hộp thoại yêu cầu đăng nhập và banner gây phiền nhiễu.
- **🇻🇳 Tích hợp sẵn bộ lọc ABPVN:** Tự động kích hoạt bộ luật lọc tối ưu nhất dành riêng cho người dùng mạng tại Việt Nam.

---

### 🚀 Hướng dẫn Cài đặt

1. **Tải hoặc Clone mã nguồn repository về máy:**
   ```bash
   git clone https://github.com/nguyenhoangtuantu/TuBlock.git
   ```
   *(hoặc sử dụng SSH nếu đã cài SSH Key: `git clone git@github.com:nguyenhoangtuantu/TuBlock.git`)*

2. **Mở trang quản lý tiện ích trên trình duyệt:**
   - **Google Chrome:** `chrome://extensions`
   - **Cốc Cốc:** `coccoc://extensions`
   - **Brave:** `brave://extensions`
   - **Microsoft Edge:** `edge://extensions`

3. **Bật Developer Mode:**
   - Gạt nút **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải màn hình sang trạng thái **Bật**.

4. **Tải tiện ích vào trình duyệt:**
   - Bấm vào nút **Load unpacked** (Tải tiện ích đã giải nén).
   - Điều hướng và chọn thư mục `TuBlock` vừa tải về.

5. **Hoàn tất:** Biểu tượng **TuBlock** sẽ xuất hiện trên thanh công cụ của trình duyệt và tự động kích hoạt bảo vệ trên tất cả các trang web.

---

### ⚙️ Cơ chế Kỹ thuật (Under the Hood)

- **MAIN World Injection (`document_start`):** Script `adblock-shield-main.js` được nạp ở tầng thực thi cao nhất ngay trước khi các script độc hại của website kịp khởi chạy.
- **Defensive DOM Reconciliation Guard:** Bọc an toàn các phương thức `Node.prototype.removeChild` và `Node.prototype.insertBefore`, triệt tiêu hoàn toàn lỗi vỡ giao diện `NotFoundError` trên các framework SPA.
- **Local Cooldown Key Freezing:** Ghi đè các mốc thời gian hiển thị quảng cáo trong `localStorage` (`lastPopunderTime`, `popunder-last-shown`) sang epoch tương lai (10 năm), khiến mã nguồn quảng cáo luôn đánh giá là chưa đến lượt kích hoạt.

---

### 📝 Thông báo Tuân thủ Giấy phép GNU GPLv3

**TuBlock** là tác phẩm phái sinh (derivative work) được xây dựng dựa trên mã nguồn mở [AdBlock](https://getadblock.com/) (Bản quyền © Adblock, Inc. và eyeo GmbH). 

Tuân thủ nghiêm ngặt **Điều 5(a) của Giấy phép GNU General Public License v3.0 (GPLv3)**, thông báo sửa đổi được ghi nhận công khai như sau:

- **Thời gian thực hiện sửa đổi:** Tháng 09 – Tháng 10 năm 2026.
- **Tác giả sửa đổi:** Nguyễn Hoàng Tuấn Tú (<its.nhtt@gmail.com>).
- **Chi tiết các phần can thiệp:**
  - `manifest.json`: Tái định danh thương hiệu TuBlock kèm thông báo tác giả gốc; tích hợp content script bảo vệ `adblock-shield-main.js`; cấu hình tự động bật các ruleset bộ lọc ABPVN trong `declarative_net_request`.
  - `adblock-shield-main.js`: Bổ sung module bảo vệ chuyên dụng chống popunder, tab-under, overlay và first-party ads (được cấp phép theo GPLv3).
  - `abp-background.js` & `adblock-options-premiumproxy.js`: Cập nhật cờ cấu hình phía client (`hasPremium`, `isActiveLicense`) để kích hoạt cục bộ các tính năng giao diện (Themes, Image Swap, Cookie Cutter).
  - `button/header.js` & bộ SVG icons: Cập nhật logo và giao diện người dùng sang thương hiệu TuBlock nhằm tuân thủ Điều 7(e) về quyền nhãn hiệu.
  - `_locales/en_US/messages.json`: Tối ưu hóa dung lượng extension, loại bỏ 33 gói ngôn ngữ thừa và tinh gọn giữ lại duy nhất tiếng Anh (`en_US`) với đầy đủ 856 khóa giao diện chuẩn TuBlock.

---

## 🇬🇧 English

### 📋 Overview

**TuBlock** is a powerful, open-source custom ad blocker optimized specifically to neutralize aggressive circumvention ads, popunders, tab-under redirections, and intrusive overlays on streaming, manga, and media sites:

- **🚫 First-Party & Embedded Ad Defuser:** Detects and suppresses hardcoded betting banners (e.g., 789BET, 11BET, 78WIN, QQ88, HI88...) embedded directly into site source code or reverse-proxied paths.
- **🛑 Popunder & Tab-Under Redirection Neutralizer:** Intercepts `EventTarget.prototype.addEventListener` to neutralize click-jackers and prevent silent background tab redirections (`window.location.assign/replace`).
- **🛡️ Invisible Click-Shield Defuser:** Automatically detects and defuses high-`z-index` transparent layers over video players **without crashing React / Next.js / Vue Virtual DOM reconciliation** (safe non-destructive CSS hiding instead of `node.remove()`).
- **🍪 Distraction & Cookie Wall Solver:** Suppresses cookie consent notices, sign-up modals, and annoying floating distraction elements.
- **🇻🇳 Integrated Regional Rule Lists:** Pre-configures and activates the comprehensive ABPVN filter ruleset out of the box.

---

### 🚀 Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/nguyenhoangtuantu/TuBlock.git
   ```
   *(or via SSH: `git clone git@github.com:nguyenhoangtuantu/TuBlock.git`)*

2. **Open Extension Management in your Chromium Browser:**
   - **Google Chrome:** `chrome://extensions`
   - **Cốc Cốc:** `coccoc://extensions`
   - **Brave:** `brave://extensions`
   - **Microsoft Edge:** `edge://extensions`

3. **Enable Developer Mode:**
   - Toggle the **Developer mode** switch in the upper-right corner to **On**.

4. **Load the Extension:**
   - Click **Load unpacked**.
   - Select the cloned `TuBlock` directory.

5. **Done:** The **TuBlock** icon will appear on your toolbar, protecting your browsing session immediately.

---

### ⚙️ Technical Highlights

- **MAIN World Injection at `document_start`:** The `adblock-shield-main.js` script runs before external circumvention trackers mount their handlers.
- **Safe DOM Reconciler Monkey-Patching:** Safely intercepts `Node.prototype.removeChild` and `Node.prototype.insertBefore` to prevent unhandled `NotFoundError` exceptions when ad components unmount unexpectedly.
- **Popunder Interval Epoch Freezing:** Freezes internal countdown keys in `localStorage` (`lastPopunderTime`, `popunder-last-shown`) into a far-future timestamp (10 years ahead), falsifying frequency-capping checks so popunders never trigger.

---

### 📝 Modifications & GPLv3 Compliance Notice

**TuBlock** is a derivative work based on [AdBlock](https://getadblock.com/) (Copyright © Adblock, Inc. and eyeo GmbH). In full compliance with **Section 5(a) of the GNU General Public License v3.0 (GPLv3)**, the notices of modifications are stated below:

- **Modification Date:** September – October 2026
- **Modified by:** Nguyễn Hoàng Tuấn Tú
- **Summary of Modifications:**
  - `manifest.json`: Rebranded to TuBlock with clear derivative attribution; registered custom shield content script (`adblock-shield-main.js`); enabled ABPVN and regional DNR rulesets by default.
  - `adblock-shield-main.js`: Created and integrated a dedicated GPLv3 anti-circumvention engine running in `MAIN` world at `document_start`.
  - `abp-background.js` & `adblock-options-premiumproxy.js`: Adjusted local UI preference flags (`hasPremium`, `isActiveLicense`) to activate client-side features without remote payment server verification.
  - `button/header.js` & SVG theme icons: Rebranded interface assets to TuBlock to prevent confusion and respect original brand trademarks under Section 7(e).
  - `_locales/en_US/messages.json`: Streamlined extension footprint by pruning 33 redundant locale bundles, preserving exclusively English (`en_US`) with all 856 UI translation keys.

---

## 📄 Giấy phép / License (GPLv3)

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License (GPLv3)** as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

- All original AdBlock codebase: **Copyright © Adblock, Inc. and eyeo GmbH**.
- Modifications, custom shield scripts, and adaptations: **Copyright © 2026 Nguyễn Hoàng Tuấn Tú**.
- See the [COPYING](./COPYING) file for complete license terms.

---

## 🙏 Acknowledgments & Disclaimer

- **Acknowledgments:** Heartfelt thanks to the [AdBlock](https://getadblock.com/) team and [ABPVN](https://abpvn.com/) maintainers for their foundational contributions to open-source ad blocking.
- **Disclaimer:** This project is provided **strictly for educational and technical research purposes**. All original trademarks belong to their respective owners.
