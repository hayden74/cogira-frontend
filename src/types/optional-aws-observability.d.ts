// Minimal ambient module declarations for optional observability deps.
// These packages are loaded dynamically at runtime and may not be installed
// in local/test environments. Declaring them here silences TS resolution errors.

declare module 'winston-cloudwatch' {
  const CloudWatch: any;
  export default CloudWatch;
}

declare module 'aws-embedded-metrics' {
  const mod: any;
  export default mod;
}

declare module 'aws-xray-sdk-core' {
  const mod: any;
  export default mod;
}
