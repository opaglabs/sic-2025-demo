export const getJwtSecret = () => {
  const config = useRuntimeConfig();

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return config.jwtSecret;
}