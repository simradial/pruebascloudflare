export interface SensorReading {
  ts?: number; // Timestamp
  temp: number; // Celsius
  hum: number; // Humidity
  txt?: string; // Display Title
}
// Needs device auth
// const AUTH_HEADER_KEY = "X-Auth";
// function checkAuth(request: Request, authKey: string): boolean {
//     const suppliedKey = request.headers.get(AUTH_HEADER_KEY)
//     return suppliedKey == authKey
// }

export async function onRequestGet({ params, env }) {
  // if (!checkAuth(request, SENSORS_READ)) {
  //     return new Response("Invalid Key", { status: 403 })
  // }
  const value = await env.SENSORS_KV.get("1"); // hardcode sensor 1
  //let sample: SensorReading = JSON.parse(value!)

  //const sample = await env.SENSORS_KV.get("1") // hardcode sensor 1
  return new Response(value);
}

export async function onRequestPost({ params, request, env }) {
  // if (!checkAuth(request, SENSORS_WRITE)) {
  //     return new Response("Invalid Key", { status: 403 })
  // }

  try {
    const body: any = await request.clone().text();
    let sample: SensorReading = JSON.parse(body);
    if (sample.ts === undefined) {
      sample.ts = Date.now();
    }

    // store sample in KV
    await env.SENSORS_KV.put("1", JSON.stringify(sample));

    // POST sample to InfluxDB
    const influxURL = `${env.INFLUX_BASE_URL}/api/v2/write?org=${env.INFLUX_ORG}&bucket=${env.INFLUX_BUCKET}&precision=ns`;
    const influxPost = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Accept: "application/json",
        Authorization: `Token ${env.INFLUX_API_TOKEN}`,
      },
      body: `airSensors,sensor_id=WMS01 timestamp=${
        sample.ts / 1000.0
      },temperature=${sample.temp.toFixed(2)},humidity=${sample.hum.toFixed(
        2
      )}`,
    };
    const influxResponse = await fetch(influxURL, influxPost);
    if (!influxResponse.ok) {
      // Forward bad response
      return influxResponse;
    }

    return new Response(
      JSON.stringify({
        Status: 200,
        headers: { "Content-Type": "application/json" },
        Message: JSON.stringify(sample),
      })
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        Status: 400,
        Message: e.message,
        ShortUrl: null,
      }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(`request method: ${request.method}`);
}
