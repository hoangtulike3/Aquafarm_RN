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

  const [relayStt, setRelayStt] = useState(["0","0","0","0","0","0","0","0"]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );
  
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
        // navigation.navigate('Login');
      });
    // setTimeout(() => { 
    //   // getEdgeServerInfo();
    //   setRefreshing(false);
    // }, 5000);
  };

  const controlRelay = async (devEui, message ) => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/data/'+ devEui, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
      body: JSON.stringify({
        "data" : message
      })
    }).then((response) => response.json())
      .then( async (json) => {
        console.log(json);
        await delay(3000);
        onRefresh();
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
        setTimes(times => [...times, (Number(json[i].received_at.substring(11,13))+7)+json[i].received_at.substring(13,16)])

        // console.log(json[i].received_at.substring(11,13)-(-7)+json[i].received_at.substring(13,16)); Thay mui gio +7
        let data = Buffer(json[i].data).toString("utf8");
        // console.log(data);
        const _5data = data.split("/");
        if(_5data.length == 5 )
        {
          setSensor1(sensor1 => [...sensor1, Number(_5data[0].slice(1))]);
          setSensor2(sensor2 => [...sensor2, Number(_5data[1].slice(1))]);
          setSensor3(sensor3 => [...sensor3, Number(_5data[2].slice(1))]);
          setSensor4(sensor4 => [...sensor4, Number(_5data[3].slice(1))]);
          setRelayStt([_5data[4][0],_5data[4][1],_5data[4][2],_5data[4][3],_5data[4][4],_5data[4][5],_5data[4][6],_5data[4][7]]);
        }
        else if(_5data.length == 4)
        {
          setSensor1(sensor1 => [...sensor1, Number(_5data[0].slice(1))]);
          setSensor2(sensor2 => [...sensor2, Number(_5data[1].slice(1))]);
          setSensor3(sensor3 => [...sensor3, Number(_5data[2].slice(1))]);
          setSensor4(sensor4 => [...sensor4, Number(_5data[3].slice(1))]);
          setRelayStt(["0","0","0","0","0","0","0","0"])
        }
        else
        {
          setSensor1(sensor1 => [...sensor1, 0]);
          setSensor2(sensor2 => [...sensor2, 0]);
          setSensor3(sensor3 => [...sensor3, 0]);
          setSensor4(sensor4 => [...sensor4, 0]);
          setRelayStt(["0","0","0","0","0","0","0","0"])
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
  }, []);
  useEffect(() => {
    console.log("data CHANGED - Reload UI");
  }, [refreshing]);
  useEffect(() => {
    console.log("relay CHANGED - Reload UI");
  }, [relayStt]);

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
            <View pointerEvents={ refreshing ? "none" : "auto"}>
              <ScrollView style={{ paddingBottom: 10 }} horizontal={true}>
                <View style={{ flexDirection: "row" }}>
                  {
                    relayStt && relayStt.map((val, index) =>
                      val != null ?
                        <View key={index}>
                          <Text style={{ marginLeft: 18 }}>R{index+1}</Text>
                          <Switch
                            trackColor={{false: '#767577', true: '#09f21f'}}
                            thumbColor={'#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                                relayStt[index] = (val == "1" ? 0 : 1)
                                setRefreshing(true);
                                controlRelay(devEUI_chart, "R" + (index+1) + (val == "1" ? 0 : 1))
                                console.log("OnRelayChange: ", "R" + (index+1) + (val == "1" ? 0 : 1));
                              }
                            }
                            value={val == "1" ? true : false}
                          />
                        </View>
                      :
                      null
                    )
                  }
                </View>
              </ScrollView>
              
              
              <Text>Biểu đồ đo nhiệt độ</Text>
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
                  xAxisLabel=""
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

              <Text>Biểu đồ đo lượng Oxy hoà tan</Text>
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
                  xAxisLabel=""
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

              <Text>Biểu đồ đo giá trị pH</Text>
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
                  xAxisLabel=""
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

              <Text>Biểu đồ đo hàm lượng Amonia trong nước</Text>
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
                  xAxisLabel=""
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