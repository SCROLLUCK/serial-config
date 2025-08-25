declare global {
  interface Window {
    __ENV__?: {
      [key: string]: any;
    };
  }
}

export default {
  VITE_API_URL: window.__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL,
};
