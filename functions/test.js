export async function onRequest({ env }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
  };
  return new Response(env.TEST_VAR, { headers });
}
