const Test = async (request:any) => {
  const body = '667';
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  };
  return new Response(body, { headers });
};

export default Test;