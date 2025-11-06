export async function withSubsegment<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const enabled = (process.env.XRAY_ENABLED ?? 'true') !== 'false';
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (!enabled || !isLambda) return fn();
  try {
    const mod: any = await import('aws-xray-sdk-core');
    const xray = mod?.default ?? mod;
    return await new Promise<T>((resolve, reject) => {
      xray.captureAsyncFunc(name, async (subsegment: any) => {
        try {
          if (metadata && subsegment?.addMetadata) {
            for (const [k, v] of Object.entries(metadata)) {
              subsegment.addMetadata(k, v);
            }
          }
          const res = await fn();
          subsegment?.close?.();
          resolve(res);
        } catch (err) {
          subsegment?.addError?.(err);
          subsegment?.close?.();
          reject(err);
        }
      });
    });
  } catch {
    // If xray SDK is unavailable, execute normally
    return fn();
  }
}
