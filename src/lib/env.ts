export function getServerEnv() {
  const instantAppId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
  const instantAdminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  const jwtSecret = process.env.JWT_SECRET;
  const coingeckoKey = process.env.COINGECKO_API_KEY;

  return {
    instantAppId,
    instantAdminToken,
    jwtSecret,
    coingeckoKey,
    missing: [
      !instantAppId && "NEXT_PUBLIC_INSTANT_APP_ID",
      !instantAdminToken && "INSTANT_APP_ADMIN_TOKEN",
      !jwtSecret && "JWT_SECRET",
    ].filter(Boolean) as string[],
  };
}

export function assertServerEnv() {
  const env = getServerEnv();
  if (env.missing.length > 0) {
    throw new Error(`Missing env: ${env.missing.join(", ")}`);
  }
  return env;
}
