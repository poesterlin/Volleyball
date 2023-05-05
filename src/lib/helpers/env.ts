
const env = import.meta.env;

export const VAPID_PUBLIC = env.VITE_VAPID_PUBLIC;
export const server = env.VITE_SERVER ?? `https://m0mc1vh5jj.execute-api.eu-central-1.amazonaws.com/production`;