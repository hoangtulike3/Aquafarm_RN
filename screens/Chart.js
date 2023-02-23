import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Dimensions, View, ScrollView, RefreshControl, Image, TouchableOpacity, Switch, Linking } from 'react-native';
import { Buffer } from "buffer";
import { LineChart } from "react-native-chart-kit";

export default Chart = ({ navigation, route }) => {
  const { devName_chart, devEUI_chart } = route.params;
  // const [values, setValues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [times, setTimes] = useState([]);
  const [sensor1, setSensor1] = useState([]);
  const [sensor2, setSensor2] = useState([]);
  const [sensor3, setSensor3] = useState([]);
  const [sensor4, setSensor4] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);
  
  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    setRefreshing(true);
    fetch('http://35.79.124.43:3000/data/' + devEUI_chart + '/5', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        // setValues(json);
        // jsonToArrayData(json)
        jsonToArrayData(json);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error(error);
        setRefreshing(false);
      });
    // setTimeout(() => { 
    //   // getEdgeServerInfo();
    //   setRefreshing(false);
    // }, 5000);
  };

  // const bufferToData = (value) => {
  //   let data = Buffer(value.data).toString("utf8");
  //   // console.log(data);
  //   const _4data = data.split("/");
  //   if(_4data.length == 4 )
  //   {
  //     return _4data
  //   }
  //   else
  //   {
  //     return [0, 0, 0, 0]
  //   }
  // }

  const jsonToArrayData = (json) => {
    try
    {
      setDataLoaded(false);
      setTimes([]);
      setSensor1([]);
      setSensor2([]);
      setSensor3([]);
      setSensor4([]);
      for(let i = json.length - 1; i >= 0; i-- )
      {
        setTimes(times => [...times, json[i].received_at.substring(11,16)])
        let data = Buffer(json[i].data).toString("utf8");
        // console.log(data);
        const _4data = data.split("/");
        if(_4data.length == 5 )
        {
          setSensor1(sensor1 => [...sensor1, Number(_4data[0].slice(1))]);
          setSensor2(sensor2 => [...sensor2, Number(_4data[1].slice(1))]);
          setSensor3(sensor3 => [...sensor3, Number(_4data[2].slice(1))]);
          setSensor4(sensor4 => [...sensor4, Number(_4data[3].slice(1))]);
        }
        else
        {
          setSensor1(sensor1 => [...sensor1, 0]);
          setSensor2(sensor2 => [...sensor2, 0]);
          setSensor3(sensor3 => [...sensor3, 0]);
          setSensor4(sensor4 => [...sensor4, 0]);
        }
      }
      // console.log(sensor1);
      setDataLoaded(true);
    } catch (err) {
      setDataLoaded(false);
      console.log(err);
    }
  }

  useEffect(() => {
    onRefresh();
  }, [])
  useEffect(() => {
    console.log("data CHANGED");
    // console.log(times);
    // console.log(sensor1);
    // console.log(sensor2);
    // console.log(sensor3);
    // console.log(sensor4);
  }, [refreshing])

  return(
    <View style={{ flex: 1 }}>
      <Text style={{ flex: 1, fontSize: 30, alignSelf: "center", margin: 10, maxHeight: 40 }}>{devName_chart}</Text>
      <ScrollView style={{ flex: 2 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {
          dataLoaded ? (
            <View>
              <Text>Chart of sensor Temperature</Text>
              {/* Chart of sensor 1 nhiet do, do, ph, nh3 */} 
              <TouchableOpacity 
              onPress={() => {
                navigation.navigate('TableData', {
                  devName_chart: devName_chart,
                  devEUI_chart: devEUI_chart,
                  sensorType_chart: "Temperature"
                });
              }}
              >
                <LineChart
                  data={{
                    labels: times,
                    datasets: [
                      {
                        data: sensor1
                      }
                    ]
                  }}
                  width={Dimensions.get("window").width} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  xAxisLabel="+0"
                  yAxisSuffix="&deg;C"
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#217098",
                    backgroundGradientTo: "#264A5d",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#fb8c00"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </TouchableOpacity>

              <Text>Chart of sensor Dessolved Oxygen</Text>
              {/* Chart of sensor 2*/}
              <TouchableOpacity
              onPress={() => {
                navigation.navigate('TableData', {
                  devName_chart: devName_chart,
                  devEUI_chart: devEUI_chart,
                  sensorType_chart: "Dessolved Oxygen"
                });
              }}
              >
                <LineChart
                  data={{
                    labels: times,
                    datasets: [
                      {
                        data: sensor2
                      }
                    ]
                  }}
                  width={Dimensions.get("window").width} // from react-native
                  height={220}
                  // yAxisLabel=""
                  xAxisLabel="+0"
                  yAxisSuffix="mg/l"
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#217098",
                    backgroundGradientTo: "#264A5d",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </TouchableOpacity>

              <Text>Chart of sensor Pondus Hydrogenii</Text>
              {/* Chart of sensor 3*/}
              <TouchableOpacity
              onPress={() => {
                navigation.navigate('TableData', {
                  devName_chart: devName_chart,
                  devEUI_chart: devEUI_chart,
                  sensorType_chart: "Pondus Hydrogenii"
                });
              }}
              >
                <LineChart
                  data={{
                    labels: times,
                    datasets: [
                      {
                        data: sensor3
                      }
                    ]
                  }}
                  width={Dimensions.get("window").width} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  xAxisLabel="+0"
                  yAxisSuffix="pH"
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#217098",
                    backgroundGradientTo: "#264A5d",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </TouchableOpacity>

              <Text>Chart of sensor Amonia</Text>
              {/* Chart of sensor 4*/}
              <TouchableOpacity
              onPress={() => {
                navigation.navigate('TableData', {
                  devName_chart: devName_chart,
                  devEUI_chart: devEUI_chart,
                  sensorType_chart: "Amonia"
                });
              }}
              >
                <LineChart
                  data={{
                    labels: times,
                    datasets: [
                      {
                        data: sensor4
                      }
                    ]
                  }}
                  width={Dimensions.get("window").width} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  xAxisLabel="+0"
                  yAxisSuffix="kmol/L"
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    backgroundColor: "#e26a00",
                    backgroundGradientFrom: "#217098",
                    backgroundGradientTo: "#264A5d",
                    decimalPlaces: 2, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#ffa726"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </TouchableOpacity>
            </View>
          ) : (null)
        }
      </ScrollView>
    </View>
  )
}