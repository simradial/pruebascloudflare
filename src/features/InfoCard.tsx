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

const fetcher = async (
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
    [useUTC, setUseUTC] = useState<boolean>(false),
    [sensorData, setSensorData] = useState<object>({});

  const { data, error } = useSWR("/api/sensorpush", fetcher);

  useEffect(() => {
    setOptionObj({
      useUTC: useUTC,
      title: {
        text: "Last 24 Hours",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      toolbox: {
        show: true,
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
          rotate: 10,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Temp °F",
          nameLocation: "middle",
          nameGap: 40,
          min: 0,
          max: 100,
          position: "left",
          // axisLine : {
          //     lineStyle : {}
          // },
          axisLabel: {
            formatter: "{value} °F",
          },
        },
        {
          type: "value",
          name: "Humidity %",
          nameLocation: "middle",
          nameGap: 40,
          position: "right",
          min: 0,
          max: 100,
          // axisLine : {
          //     lineStyle : {}
          // },
          axisLabel: {
            formatter: "{value} %",
          },
        },
      ],
      //   dataset: {
      //     source: sensorData,
      //     dimensions: ["timestamp", "temp", "hum"],
      //   },
      series: [
        {
          name: "Temp °F",
          type: "line",
          smooth: false,
          symbol: "none",
          encode: {
            x: "timestamp",
            y: "temp",
          },
        },
        {
          name: "% Humidity",
          type: "line",
          smooth: false,
          symbol: "none",
          yAxisIndex: 1,
          encode: {
            x: "timestamp",
            y: "hum",
          },
        },
      ],
    });
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <Center py={6}>
      <Box
        maxW={"530px"}
        w={"full"}
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
            {error
              ? "Error loading API"
              : !data
              ? "-"
              : data.txt
              ? data.txt
              : "TEMPCHECK"}
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>Temp</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              {!data ? "-" : convertToF(data.temp).toFixed(2)}
            </Text>
            <Text color={"gray.500"}>°F</Text>
          </Stack>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"1xl"}>Humidity</Text>
            <Text fontSize={"3xl"} fontWeight={800}>
              {!data ? "-" : data.hum.toFixed(2)}
            </Text>
            <Text color={"gray.500"}>%</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue("gray.50", "gray.900")} px={6} py={10}>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={TimeIcon} color="yellow.400" />
              {!data
                ? "-"
                : DateTime.fromMillis(data.ts).toFormat(
                    "hh:mm:ss MMMM dd, yyyy"
                  )}
            </ListItem>
          </List>
        </Box>

        <Box bg={useColorModeValue("gray.50", "gray.900")} px={6} py={10}>
          <ReactECharts
            theme={theme}
            option={optionObj}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </Box>
    </Center>
  );
}
