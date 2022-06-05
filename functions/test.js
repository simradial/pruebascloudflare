export async function onRequest({ env }) {
  return new Response(env.TEST_VAR);
}
