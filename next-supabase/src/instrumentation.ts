export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    import("@sentry/nextjs").then(({ default: Sentry }) => {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.1,
      });
    });
  }
}
