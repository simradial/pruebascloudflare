import React, { useState, useEffect } from "react";
import {
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
    //console.log("timeseries_data ", timeseries_data);
    if (timeseries_data !== undefined) {
      setSensorData(timeseries_data);
    }
  }, [timeseries_data]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setOptionObj({
      useUTC: useUTC,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
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
            return echarts.time.format(
              tick,
              "{yyyy}-{MM}-{dd} {HH}:{mm}",
              useUTC
            );
          },
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Temp °C",
          nameLocation: "middle",
          nameGap: 45,
          min: 0,
          max: 100,
          position: "left",
          axisLabel: {
            formatter: "{value} °C",
          },
        },
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
      ],
      dataset: {
        source: sensorData,
        dimensions: ["_time", "temperature", "humidity"],
      },
      series: [
        {
          name: "Temp °C",
          type: "line",
          smooth: false,
          symbol: "none",
          encode: {
            x: "_time",
            y: "temperature",
          },
        },
        {
          name: "% Humidity",
          type: "line",
          smooth: false,
          symbol: "none",
          yAxisIndex: 1,
          encode: {
            x: "_time",
            y: "humidity",
          },
        },
      ],
    });
  }, [sensorData]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Center py={6}>
      <Box
        w={"full"}
        minWidth={480}
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
            <Text fontSize={"3xl"}>Temp</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              {!sensor_data ? "-" : convertToF(sensor_data.temp).toFixed(2)}
            </Text>
            <Text color={"gray.500"}>°F</Text>
          </Stack>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"1xl"}>Humidity</Text>
            <Text fontSize={"3xl"} fontWeight={800}>
              {!sensor_data ? "-" : sensor_data.hum.toFixed(2)}
            </Text>
            <Text color={"gray.500"}>%</Text>
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
        <Box bg={useColorModeValue("gray.50", "gray.900")}>
          <ReactECharts
            theme={theme}
            option={optionObj}
            style={{ width: "140%", height: "100%" }}
          />
        </Box>
      </Box>
    </Center>
  );
}
