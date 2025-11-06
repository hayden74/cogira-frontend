type EmitArgs = {
  namespace?: string;
  service?: string;
  functionName?: string;
  environment?: string;
  route?: string;
  method?: string;
  statusCode: number;
  durationMs: number;
};

const defaultNamespace = process.env.METRICS_NAMESPACE || 'Cogira/Api';

export async function emitRequestMetricsEMF(args: EmitArgs) {
  const ns = args.namespace || defaultNamespace;
  const svc = args.service || 'cogira-backend';
  const fn =
    args.functionName || process.env.AWS_LAMBDA_FUNCTION_NAME || 'local';
  const env = args.environment || process.env.NODE_ENV || 'dev';
  const route = args.route || 'unknown';
  const method = args.method || 'UNKNOWN';
  const code = args.statusCode;
  const dur = args.durationMs;
  const err = code >= 500 ? 1 : 0;

  const enabled = (process.env.EMF_ENABLED ?? 'true') !== 'false';
  if (!enabled) return;

  try {
    const mod: any = await import('aws-embedded-metrics');
    const lib = mod?.default ?? mod;
    const metrics = lib.createMetricsLogger();
    metrics.setNamespace(ns);
    metrics.putDimensions({
      Service: svc,
      FunctionName: fn,
      Environment: env,
      Route: route,
      Method: method,
      StatusCode: String(code),
    });
    metrics.putMetric('RequestCount', 1, lib.Unit.Count);
    metrics.putMetric('DurationMs', dur, lib.Unit.Milliseconds);
    if (err) metrics.putMetric('ErrorCount', 1, lib.Unit.Count);
    await metrics.flush();
    return;
  } catch {
    // Fallback to raw EMF JSON to stdout
    const emf = {
      _aws: {
        Timestamp: Date.now(),
        CloudWatchMetrics: [
          {
            Namespace: ns,
            Dimensions: [
              [
                'Service',
                'FunctionName',
                'Environment',
                'Route',
                'Method',
                'StatusCode',
              ],
            ],
            Metrics: [
              { Name: 'RequestCount', Unit: 'Count' },
              { Name: 'DurationMs', Unit: 'Milliseconds' },
              { Name: 'ErrorCount', Unit: 'Count' },
            ],
          },
        ],
      },
      Service: svc,
      FunctionName: fn,
      Environment: env,
      Route: route,
      Method: method,
      StatusCode: String(code),
      RequestCount: 1,
      DurationMs: dur,
      ErrorCount: err,
    };

    console.log(JSON.stringify(emf));
  }
}
