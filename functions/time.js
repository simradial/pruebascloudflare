// ./functions/time.js

export const onRequest = () => {
  return new Response(new Date().toISOString());
};
