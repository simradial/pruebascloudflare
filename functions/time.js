// ./functions/time.js

export const onRequest = () => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
  };
  return new Response(new Date().toISOString(), { headers });
};
