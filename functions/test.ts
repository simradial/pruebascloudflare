// export async function onRequest(context:any) {
//   // Contents of context object
//   const {
//     request, // same as existing Worker API
//     env, // same as existing Worker API
//     params, // if filename includes [id] or [[path]]
//     waitUntil, // same as ctx.waitUntil in existing Worker API
//     next, // used for middleware or to fetch assets
//     data, // arbitrary space for passing data between middlewares
//   } = context;

//   return new Response("Hello, world!");
// }


export async function onRequestGet({ params }) {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${params.id}`);
  const data = await res.json();
  const info = JSON.stringify(data, null, 2);
  return new Response(info);
}