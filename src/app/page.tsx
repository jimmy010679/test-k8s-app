"use client";
import styles from "./page.module.css";
import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function Home() {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      // Update the date and time every second
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <div className={styles.page}>
      <h1>基於 IaC 與無密鑰架構的跨專案雲端自動化部署</h1>
      <p>{currentDateTime}</p> {/* Display dynamic date and time */}
      <p>AI Code Review: 整合 Gemini API，每當開發者開啟 PR 或更新內容時，系統會自動進行代碼審查。</p>
      <p>AI Issue 自動修復: 透過 GitHub Issues 觸發，實現 AI 發 PR。</p>
      <p>自動化流程: 構建完整 CI/CD Pipeline，實現程式碼推送後會自動觸發構建。</p>
      <p>安全性強化: 捨棄傳統靜態密鑰，採用 Workload Identity Federation 實現 GitHub 與 GCP 間的無密鑰認證。</p>
      <p>Image管理: 運用 Next.js Standalone 與 Docker Multi-stage Build 產出輕量化容器映像檔，並存放於 Artifact Registry 進行版本管控。</p>
      <p>Serverless 彈性部署: 利用 Cloud Run 機制實現滾動更新。</p>
      <p>基礎設施即代碼 (IaC): 運用 Terraform 實作基礎設施即代碼，將基礎建設核心與應用程式資源進行跨專案分層管理。</p>
    </div>
  );
}
