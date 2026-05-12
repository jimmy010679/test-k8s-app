import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { CloudPropagator } from '@google-cloud/opentelemetry-cloud-trace-propagator';
import {
  AlwaysOnSampler,
  ParentBasedSampler,
  Sampler,
  SamplingDecision,
  SamplingResult,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { Attributes, Context, Link, SpanKind } from '@opentelemetry/api';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const sampleRateStr = process.env.TRACE_SAMPLE_RATE;
const parsedSampleRate = sampleRateStr ? parseFloat(sampleRateStr) : 0.05;
const sampleRate = Number.isFinite(parsedSampleRate)
  ? Math.min(Math.max(parsedSampleRate, 0), 1)
  : 0.05;

/**
 * 過濾不具業務意義或流量太高的路徑，避免 Trace 被例行探針與
 * 靜態資源請求洗版。
 *
 * - /healthz: Kubernetes / Load Balancer 健康檢查
 * - /metrics: Prometheus scrape endpoint
 * - /_next: Next.js 靜態資源、RSC payload、內部資產請求
 */
class RouteFilterSampler implements Sampler {
  private baseSampler: Sampler;

  constructor(baseSampler: Sampler) {
    this.baseSampler = baseSampler;
  }

  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: Attributes,
    links: Link[],
  ): SamplingResult {
    const url = (
      attributes?.['http.url']
      || attributes?.['http.target']
      || spanName
    ) as string;

    if (
      url
      && (
        url.includes('/healthz')
        || url.includes('/metrics')
        || url.includes('/_next')
      )
    ) {
      return { decision: SamplingDecision.NOT_RECORD };
    }

    return this.baseSampler.shouldSample(
      context,
      traceId,
      spanName,
      spanKind,
      attributes,
      links,
    );
  }

  toString(): string {
    return `RouteFilterSampler`;
  }
}

if (otlpEndpoint) {
  const baseRateSampler = new RouteFilterSampler(
    new TraceIdRatioBasedSampler(sampleRate),
  );
  const upstreamSampledSampler = new RouteFilterSampler(
    new AlwaysOnSampler(),
  );

  const sdk = new NodeSDK({
    // 服務資源名稱 ( GCP > Cloud Trace > Trace探索工具 )
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

    // 設定與 GCP 連結，讓它能接住 GCP Load Balancer 傳來的
    // X-Cloud-Trace-Context。
    textMapPropagator: new CompositePropagator({
      propagators: [
        new CloudPropagator(),           // GCP
        new W3CTraceContextPropagator(), // 標準 W3C
        new W3CBaggagePropagator(),      // 標準附帶資訊
      ],
    }),

    /**
     * Trace 採樣策略：
     * - root: 沒有上游 parent 時，由本服務依 TRACE_SAMPLE_RATE 抽樣。
     * - remoteParentNotSampled: 上游未採樣時，本服務仍保留額外抽樣機會。
     * - remoteParentSampled: 上游或 GCP LB 已標記 sampled 時，本服務跟著記錄。
     *
     * 上述三種情況都會先經過 RouteFilterSampler，因此 health check、
     * metrics 與 Next.js 靜態資源仍會被排除。
     */
    sampler: new ParentBasedSampler({
      root: baseRateSampler,
      remoteParentNotSampled: baseRateSampler,
      remoteParentSampled: upstreamSampledSampler,
    }),

    // 自動掛載常用的 Node.js 追蹤 (如 HTTP 請求、資料庫查詢等)
    instrumentations: [
      getNodeAutoInstrumentations(),
    ],
  });

  sdk.start();
}
