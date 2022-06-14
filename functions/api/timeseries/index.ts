import Papa from "papaparse";

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

  // query the sensor data, hardcode 24 hours
  const influxURL = `${env.INFLUX_BASE_URL}/api/v2/query?org=${env.INFLUX_ORG}`;
  const influxPost = {
    method: "POST",
    headers: {
      "Content-type": "application/vnd.flux",
      Accept: "application/csv",
      Authorization: `Token ${env.INFLUX_API_TOKEN}`,
    },
    body: `
        import "influxdata/influxdb/schema"
        import "json"
        from(bucket: "tempcheck")
          |> range(start: -24h)
          |> filter(fn: (r) => r["_measurement"] == "airSensors")
          |> filter(fn: (r) => r["sensor_id"] == "WMS01")
          |> schema.fieldsAsCols()
          |> keep(columns: ["_time", "humidity", "temperature", "timestamp"])`,
  };
  const influxResponse = await fetch(influxURL, influxPost);
  if (!influxResponse.ok) {
    // Forward bad response
    return influxResponse;
  }
  const csvString = await influxResponse.text();
  const results = Papa.parse(csvString, { header: true });
  const resultsData: any = results.data;
  // let sensorDataStr: string = "[";
  // results.data.forEach((d: any): void => {
  //   const ts = d["timestamp"];
  //   if (ts !== null && ts !== undefined) {
  //     if (sensorDataStr.length !== 1) {
  //       sensorDataStr += ",";
  //     }
  //     const tempF = (d["temperature"] * 9.0) / 5.0 + 32.0;
  //     sensorDataStr += `[new Date(${1000 * ts}), ${tempF.toFixed(2)}, ${
  //       d["humidity"]
  //     }]`;
  //   }
  // });
  // sensorDataStr += "]";
  let sensor: any = JSON.stringify(resultsData);
  return new Response(sensor);
}
