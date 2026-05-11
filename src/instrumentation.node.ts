import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { CompositePropagator, W3CTraceContextPropagator, W3CBaggagePropagator } from '@opentelemetry/core';
import { CloudPropagator } from '@google-cloud/opentelemetry-cloud-trace-propagator';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  const sdk = new NodeSDK({
    // 定義這個服務的名稱，你在 Cloud Trace 畫面上會看到這個名字
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'test-k8s-app-frontend',
    }),
  
    /**
     * 指向 GKE 代管的 OpenTelemetry Relay
     * GCP url example:             http://opentelemetry-collector.gke-managed-otel.svc.cluster.local:4318
     * - opentelemetry-collector：  Kubernetes 裡的 Service 名稱
     * - gke-managed-otel：         Google 幫你建的命名空間 (Namespace)
     * - svc.cluster.local：        Kubernetes 叢集內部預設的 DNS 後綴
     * - 4318：                     OTLP 標準的 HTTP 接收埠 (若是 gRPC 則是 4317)
     * - /v1/traces：               OTLP 官方規範的固定路由(通常會自動補上，不用自己加)，用來接收 Trace 數據（K8s 介面上看不到這個路徑，這是 Collector 程式內部的設定）
    */
    traceExporter: new OTLPTraceExporter(),

    // 設定與 GCP 連結，讓它能接住 GCP Load Balancer 傳來的 X-Cloud-Trace-Context
    textMapPropagator: new CompositePropagator({
      propagators: [
        new CloudPropagator(),           // GCP
        new W3CTraceContextPropagator(), // 標準 W3C
        new W3CBaggagePropagator()       // 標準附帶資訊
      ],
    }),

    sampler: new TraceIdRatioBasedSampler(1.0),

    // 自動掛載常用的 Node.js 追蹤 (如 HTTP 請求、資料庫查詢等)
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}