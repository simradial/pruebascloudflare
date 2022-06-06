const Time = async (request:any) => {
  const body = new Date().toISOString();
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  };
  return new Response(body, { headers });
};

export default Time;