import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Center,
  Text,
  Stack,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { DateTime } from "luxon";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import useSWR from "swr";

const fetchersensor = async (
  input: RequestInfo,
  init: RequestInit,
  ...args: any[]
) => {
  const res = await fetch(input, init);
  return res.json();
};
const fetcherseries = async (
  input: RequestInfo,
  init: RequestInit,
  ...args: any[]
) => {
  const res = await fetch(input, init);
  return res.json();
};

function convertToF(celsius: number) {
  let fahrenheit = (celsius * 9) / 5 + 32;
  return fahrenheit;
}

export default function InfoCard() {
  const theme = useColorModeValue("light", "dark"),
    [optionObj, setOptionObj] = useState<object>({}),
    [sensorData, setSensorData] = useState<any>([]),
    [isCelsius, setIsCelsius] = useState<boolean>(false),
    useUTC = false,
    { data: sensor_data, error: sensor_error } = useSWR(
      "/api/sensor/1",
      fetchersensor
    ),
    { data: timeseries_data, error: timeseries_error } = useSWR(
      "/api/timeseries",
      fetcherseries
    );

  useEffect(() => {
    if (timeseries_data !== undefined) {
      let chartData: any[] = [];
      timeseries_data.map((objs: any, index: any) =>
        chartData.push({
          time: objs._time,
          temperature: objs.temperature,
          humidity: objs.humidity,
          tempf: convertToF(objs.temperature),
        })
      );
      setSensorData(chartData);
    }
  }, [timeseries_data]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setOptionObj({
      legend: {
        y: 10,
        data: ["Humidity %", isCelsius ? "Temp °C" : "Temp °F"],
        inactiveColor: "#777",
      },
      useUTC: useUTC,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      grid: {
        y: 50,
        y2: 40,
        x: 70,
        x2: 70,
      },
      toolbox: {
        show: false,
        feature: {
          saveAsImage: {},
          dataZoom: {
            yAxisIndex: "none",
          },
          restore: {},
        },
      },
      animation: false,
      xAxis: {
        type: "time",
        axisLabel: {
          formatter: function (tick: any) {
            return echarts.time.format(tick, "{HH}:{mm}", useUTC);
          },
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Humidity %",
          nameLocation: "middle",
          nameGap: 45,
          position: "right",
          min: 0,
          max: 100,
          axisLabel: {
            formatter: "{value} %",
          },
        },
        {
          type: "value",
          name: isCelsius ? "Temp °C" : "Temp °F",
          nameLocation: "middle",
          nameGap: 45,
          min: 0,
          max: 120,
          position: "left",
          axisLabel: {
            formatter: isCelsius ? "{value} °C" : "{value} °F",
          },
        },
      ],
      dataset: {
        source: sensorData,
        dimensions: ["time", isCelsius ? "temperature" : "tempf", "humidity"],
      },
      series: [
        {
          name: "Humidity %",
          type: "line",
          smooth: false,
          symbol: "none",
          yAxisIndex: 1,
          encode: {
            x: "time",
            y: "humidity",
          },
        },
        {
          name: isCelsius ? "Temp °C" : "Temp °F",
          type: "line",
          smooth: false,
          symbol: "none",
          encode: {
            x: "time",
            y: isCelsius ? "temperature" : "tempf",
          },
        },
      ],
    });
  }, [sensorData, isCelsius]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Center py={6}>
      <Box
        w={"full"}
        minWidth={[360, 480, 640]}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"xl"}
        overflow={"hidden"}
      >
        <Stack
          textAlign={"center"}
          p={6}
          color={useColorModeValue("gray.800", "white")}
          align={"center"}
        >
          <Text
            fontSize={"sm"}
            fontWeight={500}
            bg={useColorModeValue("yellow.50", "yellow.900")}
            p={2}
            px={3}
            color={"yellow.500"}
            rounded={"full"}
          >
            {sensor_error
              ? "Error loading API"
              : !sensor_data
              ? "-"
              : sensor_data.txt
              ? sensor_data.txt
              : "TEMPCHECK"}
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"6xl"} fontWeight={800}>
              {!sensor_data
                ? "-"
                : isCelsius
                ? sensor_data.temp.toFixed(2) + "°"
                : convertToF(sensor_data.temp).toFixed(2) + "°"}
            </Text>
            <Button onClick={(e) => setIsCelsius(!isCelsius)}>
              <Text color={"gray.500"}>{isCelsius ? "C" : "F"}</Text>
            </Button>
          </Stack>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"} fontWeight={800}>
              {!sensor_data ? "-" : sensor_data.hum.toFixed(2) + "%"}
            </Text>
            <Text fontSize={"1xl"} color={"gray.500"}>
              Humidity
            </Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue("gray.50", "gray.900")} p={5}>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={TimeIcon} color="yellow.400" />
              {!sensor_data
                ? "-"
                : DateTime.fromMillis(sensor_data.ts)
                    .setZone("America/New_York")
                    .toFormat("yyyy-LL-dd HH:mm:ss ZZZZ")}
            </ListItem>
          </List>
        </Box>

        <ReactECharts
          theme={theme}
          option={optionObj}
          style={{ width: "100%", height: "260px" }}
        />
      </Box>
    </Center>
  );
}
