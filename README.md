# 結合 Gemini API 自動化PR審查 與 GKE 自動化部署

![PROD deployment](https://github.com/jimmy010679/test-k8s-app/actions/workflows/deploy.yml/badge.svg?branch=main)
![Gemini - AI Code Review](https://github.com/jimmy010679/test-k8s-app/actions/workflows/ai-review.yml/badge.svg)
![Gemini - Issues Auto Fix](https://github.com/jimmy010679/test-k8s-app/actions/workflows/gemini-safe-fix.yml/badge.svg)

本專案是一個基於 **Next.js (Standalone 模式)** 的應用程式，透過 Docker 進行容器化，自動部署至 Google GKE，並整合了 Gemini AI 進行自動化的 Issue Auto-Fix + Code Review。

## 🚀 正式環境網址

您可以造訪以下網址查看最新部署版本：(省錢會關閉)
**[https://test-k8s-app.kyjhome.com/](https://test-k8s-app.kyjhome.com/)**

---

## 🌟 架構核心亮點

本項目在架構設計上實現了多項進階雲原生實踐：

* **無密鑰安全架構 (Keyless Authentication)**：全面捨棄長期有效的 Service Account Key，導入 **Workload Identity Federation (WIF)**，實現 GitHub Actions 與 GCP 之間的短效、動態權限交換，大幅提升部署安全性。
* **多 VPC 分層網絡架構 (Multi-VPC Architecture)**：配合底層的基礎設施設計，應用程序運行於專屬的 App VPC，並透過 **Private Service Connect (PSC)** 存取 Data VPC 中的 Cloud SQL，確保數據層的絕對隔離與私密性。
* **基礎設施與應用代碼解耦 (IaC Separation)**：本項目的雲端基礎設施 (GKE, VPC, Artifact Registry 等) 統一交由 Terraform 管理，相關配置存放在獨立的 **[gcp-infra-core](https://github.com/jimmy010679/gcp-infra-core)** 項目中，確保環境的標準化與可複製性。

---

## ✨ AI 應用

### 1. 🛠️ AI Issue 自動修復 (Issue Auto-Fix)
透過 GitHub Issues 觸發的 **Self-healing** 機制，實現「貼標籤，AI 發 PR」：
- **環境感知 (Environment Aware)**：自動解析 Issue 目標修改分支，動態切換代碼基線。
- **品質防線 (Quality Gates)**：AI 生成修復代碼後，強制通過 `yarn lint` 與 `yarn build` 驗證，確保 PR 具備可合併性。
- **物理護欄 (Physical Guardrails)**：透過 Git 物理還原技術，強制保護 `.github/` 與 `scripts/` 目錄，防止 AI 竄改維運配置。

### 2. 🔍 AI 自動化 Code Review
每當開發者開啟 Pull Request (PR) 或更新內容時，系統會自動進行深度審查：
- **資深 Leader 視角**：擷取 `git diff` 內容並發送至 Gemini API，由 AI 擔任資深前端主管提供改進建議。
- **自動化留言**：審查結果會直接留言於 PR 下方，大幅縮短人工 Review 時間。

### 相關設定
請在 GitHub Repository 中設定：

| 類型 | GitHub 變數名稱 | 來源 / 範例值 | 說明 |
| :--- | :--- | :--- | :--- |
| **Secrets** | `GEMINI_API_KEY` | Google AI Studio | 用於調用 Gemini API 的授權密鑰 |
| **Variables** | `GEMINI_CODE_REVIEWER_MODEL` | `gemini-2.5-flash-lite` | 指定使用的 AI 模型版本 |
| **Variables** | `GEMINI_AUTO_FIX_MODEL` | `gemini-2.5-flash-lite` | 指定使用的 AI 模型版本 |

---

## 🏗 基礎設施管理 (Infrastructure as Code)

本專案的雲端基礎架構採用 **Terraform** 進行管理，相關配置於另一個 **[gcp-infra-core](https://github.com/jimmy010679/gcp-infra-core)** 專案中。這種方式確保了環境的可複製性與安全性。

### Environment variables 資源與變數對照表
請在 Environment variables 的 production/uat/development 新增下面變數：

| 類型           | GitHub 變數名稱        | Terraform 資源 / 屬性             | 說明 |
| :---          | :---                  | :---                            | :--- |
| **Variables** | `GCP_APP_NAME`        | `test-k8s-app`                  | GCP 專案名稱 |
| **Variables** | `GCP_PROJECT_ID`      | `test-k8s-app-xxxx`             | GCP 專案 ID |
| **Variables** | `GCP_SERVICE_ACCOUNT` | `tf-github-test-k8s-app@...`    | 用於部署的專屬 Service Account Email |
| **Variables** | `GKE_CLUSTER_NAME`    | `test-k8s-app-cluster`          | Kubernetes 叢集 |
| **Variables** | `DB_INSTANCE_NAME`    | `xxxxxx-prod-db`                | DB名稱 |


### Repository variables 資源與變數對照表
若需重新配置或部署，請參考以下對應關係：

| 類型 | GitHub 變數名稱 | Terraform 資源 / 屬性 | 說明 |
| :--- | :--- | :--- | :--- |
| **Variables** | `GCP_REGION` | `var.region` | 部署區域 (預設: `asia-east1`) |
| **Variables** | `GAR_REPO_NAME` | `test-k8s-app-repo` | Artifact Registry 儲存庫 ID |
| **Variables** | `GCP_WIF_PROVIDER` | `google_iam_workload_identity_pool_provider` | WIF Provider 的完整名稱 |

---

## 🛠 CI/CD 流程說明

1. **Issue-to-PR**: 
   - 監聽 Issue `labeled` 事件 -> 解析目標分支 -> AI 嘗試修復 -> **物理還原運維腳本** -> 通過 Lint/Build 驗證 -> 自動發起 PR。
2. **Code Review**: 
   - PR 開啟或更新時，觸發 `ai-review.yml` 進行程式碼差異分析與建議。
3. **Production Deployment**: 
   - 合併至 `main` 後，觸發 WIF 認證並推送 Image 至 GKE。

- **多環境佈署策略**: 
  - `main` 分支 -> `production` 環境 (Namespace: `prod`)
  - `uat` 分支 -> `uat` 環境 (Namespace: `uat`)
  - `dev` 分支 -> `development` 環境 (Namespace: `dev`)
- **精準部署邏輯**: 透過腳本自動替換網域、IP 名稱與映像檔標籤，確保環境完全隔離。

---

## 🛡️ 安全性與架構特色

- **無密鑰架構 (Keyless)**：完全捨棄傳統 Service Account Key，採用 **Workload Identity Federation (WIF)** 實現 GitHub 與 GCP 間的短效權限交換。
- **基礎設施即代碼 (IaC)**：運用 **Terraform** 進行跨專案資源管理，將基礎建設與應用程式資源分層管控。
- **輕量化容器**：利用 Next.js Standalone 與 Docker Multi-stage Build，產出極小化映像檔並存於 **Artifact Registry**。

---

## 💻 本地開發 (Local Development)


### 1. 環境變數，參考 .env.example

#### 本機開發範例

- NEXT_PUBLIC_APP_ENV: 環境 (local)
- NEXT_PUBLIC_SITENAME: 網站名稱
- NEXT_PUBLIC_DESCRIPTION: 網站說明
- DB_USER: 使用者
- DB_NAME: 資料庫名
- DB_PORT: 資料庫PORT號
- DB_PASSWORD: 資料庫密碼

```env
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_SITENAME="TEST"
NEXT_PUBLIC_DESCRIPTION="TEST"
DB_HOST="localhost"
DB_USER="app_runner"
DB_NAME="test_k8s_app_main"
DB_PORT="5432"
DB_PASSWORD=your_local_password_here
```

#### 線上範例 (Cloud/K8s)

- NEXT_PUBLIC_APP_ENV: 環境 (prod, uat, dev)
- NEXT_PUBLIC_SITENAME: 網站名稱
- NEXT_PUBLIC_DESCRIPTION: 網站說明
- DB_HOST: 不用填寫，由 K8s ConfigMap 注入同名變量
- DB_USER: 不用填寫，由 K8s ConfigMap 注入同名變量
- DB_NAME: 不用填寫，由 K8s ConfigMap 注入同名變量
- DB_PORT: 不用填寫，由 K8s ConfigMap 注入同名變量
- DB_PASSWORD: 不用填寫，改由 DB_PASSWORD_PATH 控制讀取密碼檔案位子
- DB_PASSWORD_PATH: 不用填寫，由 K8s ConfigMap 注入同名變量

```env
NEXT_PUBLIC_APP_ENV=prod
NEXT_PUBLIC_SITENAME="TEST"
NEXT_PUBLIC_DESCRIPTION="TEST"
```

### 3. 把資料庫通道硬射在本機上，需登入GCP，搭配 **[gcp-infra-core](https://github.com/jimmy010679/gcp-infra-core)** 專案，使用跳板機+IAP
```bash
gcloud compute ssh test-k8s-app-prod-bastion \
    --tunnel-through-iap \
    --project test-k8s-app-492717 \
    --zone asia-east1-a \
    -- -L 5432:10.10.0.2:5432 -N
```

### 4. 安裝與執行開發
```bash
corepack enable
yarn install
yarn dev
```

### 5. Docker 本地測試
```bash
# 建置
docker build -t test-k8s-app .

# 啟動 (對應至本地 3000 埠)
docker run -d -p 3000:3000 --name test-k8s-app-container test-k8s-app

# 造訪 http://localhost:3000
```

---

## 使用 AI Agent 開發

### Codex
讀取 AGENTS.md

### Gemini CLI

```bash
gemini -i "$(cat AGENTS.md)"
```

### Claude Code
讀取 CLAUDE.md

---

## 專案結構

```text
/
├── k8s/                         # Kubernetes Manifests (針對 GKE)
├── public/                      # 靜態資源 (Images, Icons)
├── scripts/                     # 自動化與 Review 腳本
├── docs/                        # 參考文件規範
│   ├── specs/                   # AI歷史需求歸檔（歸檔，供 AI 檢索参考）
│   └── style_guides/            # 開發風格指南與規範
├── src/                         #
│   ├── app/                     # Next.js App Router (頁面、佈局、API Routes)
│   │   ├── (api)/               # 內部 API 路由 (Health Check, Metrics)
│   │   └── ...                  # 前端頁面
│   ├── lib/                     # 共用函式庫與工具函式
│   │   ├── db.ts                # PostgreSQL 連線管理 (使用 postgres.js)
│   │   └── metrics.ts           # Prometheus Metrics 配置
│   ├── types/                   # 全域 TypeScript 型別定義
│   ├── instrumentation.ts       # Next.js Instrumentation 入口點
│   └── instrumentation.node.ts  # OpenTelemetry Node.js SDK 設定
├── .github/                     # CI/CD 工作流 (GitHub Actions)
├── Dockerfile                   # Container Image 定義
├── CLAUDE.md                    # CLAUDE rules
├── ARCHITECTURE.md              # 專案技術藍圖
├── AGENTS.md                    # Gemini CLI 與 Codex rules
├── DESIGN.md                    # 當前執行的規格 (AI 讀取的焦點)
├── DESIGN.template.md           # 規格模板 (供複製使用)
└── package.json                 # 專案依賴與腳本
```

