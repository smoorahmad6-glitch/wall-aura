# Changelog - Wall Aura

جميع التغييرات البارزة في هذا المشروع سيتم توثيقها في هذا الملف.

## [0.2.0] - 22-04-2026

### ✨ جديد
- ✅ اختبارات شاملة (Unit Tests) للـ Frontend باستخدام Vitest و Testing Library
- ✅ اختبارات شاملة للـ Backend باستخدام Cargo
- ✅ 24 اختبار React اجتازت بنجاح
- ✅ 8 اختبارات Rust وحدة في lib.rs
- ✅ إصلاح جميع أخطاء TypeScript (28 خطأ → 0)
- ✅ تثبيت متطلبات الاختبار (vitest, @testing-library/react, jsdom)
- ✅ تحديث package.json بـ test scripts
- ✅ إنشاء vitest.config.ts و vitest.setup.ts

### 🐛 الإصلاحات
- ✅ إصلاح Mock Tauri API في App.test.tsx باستخدام vi.doMock
- ✅ إضافة mock data للاختبارات (monitors, isPaused, isFullscreen)
- ✅ إصلاح tauri.invoke() لإرجاع array من المراقبات
- ✅ تصحيح TypeScript config مشاكل النوع
- ✅ إزالة types غير المتوفرة من tsconfig.json

### 📦 التحسينات
- ✅ تحديث npm scripts في package.json الجذر
- ✅ تثبيت jsdom كـ dependency لـ environment
- ✅ تحسين test runner قابلية

### 📋 معروف (Known Issues)
- ⏳ دعم متعدد المراقبات (TODO في src-tauri/src/lib.rs)
- ⏳ Tauri API version mismatch (frontend v1.5.0, backend v2)

### 🔧 متطلبات التطوير
- Node.js v24.15.0
- npm v11.12.1
- Rust 1.95.0 (cargo)
- Tauri CLI 2.x

---

## [0.1.0] - 22-04-2026 (الإصدار الأولي)

### ✨ الميزات الأولية
- ✅ تطبيق Tauri مع React + TypeScript
- ✅ دعم بسيط للمراقب الأساسي
- ✅ كشف ملء الشاشة (500ms polling)
- ✅ 4 قوالب GLSL للـ shaders (Perlin Noise, Plasma, Waves, Particles)
- ✅ إدارة الإعدادات المركزية (WallpaperManager)
- ✅ واجهة رسومية أساسية (Dashboard, MonitorSelector, ContentManager, ShaderEditor)
- ✅ بناء آلي Vite + Tauri
- ✅ إعدادات Tailwind CSS

---

**آخر تحديث:** طيب٢٢ أبريل ٢٠٢٦
