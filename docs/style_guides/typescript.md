# TypeScript 與 UI 程式碼風格指南 (TypeScript & UI Code Style Guide)

本文件概述了在 **test-k8s-app** 專案中建立與修改 TypeScript 程式碼的核心規則與最佳實踐。

## 1. 一般 TypeScript 規則 (General TypeScript Rules)
- **嚴謹型別 (Strict Typing):** 始終使用強型別與明確型別定義。避免使用 `any`。使用 Interface 和 Type Alias 來定義資料結構。
- **變數 (Variables):** 預設使用 `const`。僅在變數值需要重新賦值時才使用 `let`。嚴禁使用 `var`。
- **函式 (Functions):** 針對組件 (Components) 和簡單的輔助函式 (Helper Functions)，使用標準函式宣告 (例如：`function MyComponent() {...}`)。除非是作為 Props 傳遞或作為閉包 (Closures)，否則避免在主要導出 (Primary Exports) 中使用 Arrow Functions。確保使用 JSDoc 正確記錄 Props 與參數。
- **導入 (Imports):** 邏輯化分組導入：React/Next.js 核心優先，第三方庫次之，專案內部的組件/工具 (Utils) 最後。

## 2. React 與 Next.js 最佳實踐 (React & Next.js Best Practices)
- **組件 (Components):** 建立模組化的 Functional Components。保持組件檔案功能集中且易於維護。
- **Client vs Server Components:** 遵守 Next.js App Router 原則。組件預設應為 Server Components，除非需要用戶端互動或 React Hooks。在這種情況下，必須在檔案最頂部明確宣告 `"use client"`。
- **Hooks:** 保持 Hook 邏輯簡潔。適時利用 Custom Hooks (`use*`) 將複雜的業務邏輯從 UI 呈現層中分離出來。

## 3. 格式化與樣式 (Formatting & Styling)
- **美學與樣式系統 (Aesthetics & Styling Systems):** 根據現有的專案模式使用 CSS Modules (SASS)，以實現動態且高度響應式的樣式。追求現代美學（例如：精選調色盤、平滑漸層、懸停狀態等細微的微互動）。留意現有的視覺選擇（如圓角設計和標準化間距 Padding）。
- **縮排與空格 (Indentation & Spacing):** 使用 2 個空格進行縮排。確保編輯器配置為使用空格而非 Tabs。
- **分號 (Semicolons):** 使用結尾分號以防止 ASI (Automatic Semicolon Insertion) 的邊際案例。
- **行長度 (Line Length):** 盡可能維持每行 80 個字元的限制，以提高可讀性。

## 4. 測試 (Testing - Frontend)
- **框架 (Frameworks):** 依賴 Playwright 和 React Testing Library (RTL)。
- **範圍 (Scope):** 專注於測試公開介面 (Public Interface) 和使用者互動，而非組件內部的實作細節。
- **模擬 (Mocking):** 保持 Mock 的針對性，並將其用於隔離測試中的組件。
