export async function onRequestGet({ params }) {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${params.id}`);
  const data = await res.json();
  const info = JSON.stringify(data, null, 2);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  };
  return new Response(info, { headers });
}