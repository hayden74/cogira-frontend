import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

let cwAttached = false;
export async function initProductionLoggerSinks(): Promise<void> {
  if (cwAttached) return;
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const enabled = (process.env.LOG_TO_CLOUDWATCH ?? 'true') !== 'false';
  if (!isLambda || !enabled) return;
  try {
    const mod: any = await import('winston-cloudwatch');
    const CloudWatch = mod?.default ?? mod;
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME as string;
    const logGroupName =
      process.env.CW_LOG_GROUP || `/aws/lambda/${functionName}`;
    const logStreamName = functionName;
    logger.add(
      new CloudWatch({
        logGroupName,
        logStreamName,
        jsonMessage: true,
      })
    );
    cwAttached = true;
  } catch {
    // Dependency not installed or not available; rely on Console → CloudWatch
  }
}

export const getLogger = (correlationId?: string) => {
  return logger.child({ correlationId });
};
