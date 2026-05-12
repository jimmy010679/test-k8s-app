# AGENTS.md - test-k8s-app 指南

這份文件定義了 **test-k8s-app** 專案的開發規範與 AI 代理行為準則。

## 常用指令 (Build & Dev)
- 安裝依賴：`yarn install`
- 啟動開發伺服器：`yarn dev`
- 專案編譯：`yarn build`
- 啟動生產環境：`yarn start`

## 測試規範 (Testing) => 測試尚未完成
- 執行所有測試：`yarn test`
- 測試監控模式：`yarn test:watch`
- **核心準則**：避免直接測試私有方法或函式，應專注於公開介面 (Public Interfaces) 的測試。

## 程式碼風格與規範 (Style Guides)
### 1. 通用規範
- **檔案路徑**：`docs/style_guides/general.md`
- **行長度**：每行最大長度預設為 **80 個字元**（除非特定語言指南有明確覆蓋）。

### 2. TypeScript 與 React (UI)
- **檔案路徑**：`docs/style_guides/typescript.md`
- **類型系統**：確保嚴謹的類型定義 (Strict Typing)。
- **架構範式**：優先採用遵循 **Next.js Server/Client 範式** 的 Functional React 組件。
- **導出規範**：在主要導出 (Primary Exports) 中 **避免使用獨立的 Arrow Functions**。
- **樣式標準**：維持現有設計系統中的動態樣式標準。

### 3. 架構參考
- 在進行重大變更前，務必參考 **`ARCHITECTURE.md`**。
- 重點關注：GKE (Google Kubernetes Engine)、OpenTelemetry 與 PostgreSQL 的整合邏輯。

## AI 代理行為準則
- **規格優先**：專案特定的指令優先於通用的 Web 開發標準。
- **禁止幻覺**：不要根據通用訓練數據產生幻覺或覆蓋本文件及 `docs/style_guides/` 中的規則。