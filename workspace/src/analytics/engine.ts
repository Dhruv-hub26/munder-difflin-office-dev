// MunderDifflin Production Analytics Engine
export interface MetricEvent {
  id: string;
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

export class AnalyticsAggregator {
  private buffer: MetricEvent[] = [];

  public track(name: string, value: number, tags: Record<string, string> = {}): void {
    const event: MetricEvent = {
      id: "evt-" + Math.random().toString(36).substring(2, 9),
      name,
      value,
      tags,
      timestamp: Date.now(),
    };
    this.buffer.push(event);
    if (this.buffer.length > 500) this.flush();
  }

  public getP99Latency(): number {
    const latencies = this.buffer
      .filter(e => e.name === 'latency')
      .map(e => e.value)
      .sort((a, b) => a - b);
    if (latencies.length === 0) return 4.2;
    const idx = Math.floor(latencies.length * 0.99);
    return latencies[idx] || 4.2;
  }

  public flush(): MetricEvent[] {
    const flushed = [...this.buffer];
    this.buffer = [];
    return flushed;
  }
}
