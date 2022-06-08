
// const AUTH_HEADER_KEY = "X-Auth";

// function checkAuth(request: Request, authKey: string): boolean {
//     const suppliedKey = request.headers.get(AUTH_HEADER_KEY)
//     return suppliedKey == authKey
// }


import { SensorReading } from '../../../global/types'

// export async function onRequestPost(request:any) {
//       // const body = await request.clone().text()
//       // let sample: SensorReading = JSON.parse(body)
//       // if (sample.ts === undefined) {
//       //     sample.ts = Date.now()
//       // }

//   return new Response(`Hello world`);
// }
// let TEMPCHECK:any

export async function onRequestPost({ params, request, env }) {

  // if (!checkAuth(request, SENSORS_WRITE)) {
  //     return new Response("Invalid Key", { status: 403 })
  // } 

  try {
      const body:any = await request.clone().text()
      let sample: SensorReading = JSON.parse(body)
      if (sample.ts === undefined) {
          sample.ts = Date.now()
      }

      // store sample in KV
      await env.SENSORS_KV.put("1", JSON.stringify(sample))

      const envtest = env.TEST_VAR

      // POST sample to InfluxDB
      const influxURL = `${env.INFLUX_BASE_URL}/api/v2/write?org=${env.INFLUX_ORG}&bucket=${env.INFLUX_BUCKET}&precision=ns`
      const influxPost = {
          method: "POST",
          headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Accept": "application/json",
              "Authorization": `Token ${env.INFLUX_API_TOKEN}`
          },
          body: `airSensors,sensor_id=WMS01 timestamp=${(sample.ts)/1000.0},temperature=${sample.temp.toFixed(2)},humidity=${sample.hum.toFixed(2)}`
      }
      const influxResponse = await fetch(influxURL, influxPost)
      if (!influxResponse.ok) {
          // Forward bad response
          return influxResponse;
      }

      return new Response(JSON.stringify({
          "Status": 200,
          'headers': { "Content-Type": "application/json" },
          "Message": JSON.stringify(influxResponse)
      }))
  } catch (e: any) {
      return new Response(JSON.stringify({
          "Status": 400,
          "Message": e.message,
          "ShortUrl": null
      }), {
          'status': 400,
          'statusText': 'Bad Request',
          'headers': { "Content-Type": "application/json" }
      });
  }

  return new Response(`request method: ${request.method}`)
}

