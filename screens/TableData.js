import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Dimensions, View, ScrollView, RefreshControl, Image, TouchableOpacity, Switch, Linking } from 'react-native';
import { Buffer } from "buffer";
import { LineChart } from "react-native-chart-kit";

export default TableData = ({ navigation, route }) => {
  const { devName_chart, devEUI_chart, sensorType_chart } = route.params;
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
    fetch('http://35.79.124.43:3000/data/' + devEUI_chart + '/50', {
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
  }, [refreshing])

  const renderSwitch = (param) => {
    switch(param) {
      case "Temperature":
        return (
          sensor1.map((value, index) => 
            <View style={{ flexDirection: "row", width: "100%"}} key={index}>
              <View style={{ padding: 10, backgroundColor: "#d0d0d0", width: "40%", borderColor: "#ffffff", borderWidth: 1 }}>
                <Text>{times[index]}</Text>
              </View>
              <View style={{ padding: 10, backgroundColor: "#dedede", width: "60%", borderColor: "#ffffff", borderWidth: 1  }}>
                <Text>{value}</Text>
              </View>
            </View>
          )
        );
      case "Dessolved Oxygen":
        return (
          sensor2.map((value, index) => 
            <View style={{ flexDirection: "row", width: "100%"}} key={index}>
              <View style={{ padding: 10, backgroundColor: "#d0d0d0", width: "40%", borderColor: "#ffffff", borderWidth: 1 }}>
                <Text>{times[index]}</Text>
              </View>
              <View style={{ padding: 10, backgroundColor: "#dedede", width: "60%", borderColor: "#ffffff", borderWidth: 1  }}>
                <Text>{value}</Text>
              </View>
            </View>
          )
        );
        case "Pondus Hydrogenii":
          return (
            sensor3.map((value, index) => 
              <View style={{ flexDirection: "row", width: "100%"}} key={index}>
                <View style={{ padding: 10, backgroundColor: "#d0d0d0", width: "40%", borderColor: "#ffffff", borderWidth: 1 }}>
                  <Text>{times[index]}</Text>
                </View>
                <View style={{ padding: 10, backgroundColor: "#dedede", width: "60%", borderColor: "#ffffff", borderWidth: 1  }}>
                  <Text>{value}</Text>
                </View>
              </View>
            )
          );
        case "Amonia":
          return (
            sensor4.map((value, index) => 
              <View style={{ flexDirection: "row", width: "100%"}} key={index}>
                <View style={{ padding: 10, backgroundColor: "#d0d0d0", width: "40%", borderColor: "#ffffff", borderWidth: 1 }}>
                  <Text>{times[index]}</Text>
                </View>
                <View style={{ padding: 10, backgroundColor: "#dedede", width: "60%", borderColor: "#ffffff", borderWidth: 1  }}>
                  <Text>{value}</Text>
                </View>
              </View>
            )
          );
    }
  }

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
              <Text>Chart of sensor {sensorType_chart}</Text>
              <ScrollView>
                <View style={{ flexDirection: "row", width: "100%", borderColor: "#ffffff", borderWidth: 1 }}>
                  <View style={{ padding: 10, backgroundColor: "#dedede", width: "40%" }}>
                    <Text>Time</Text>
                  </View>
                  <View style={{ padding: 10, backgroundColor: "#d0d0d0", width: "60%" }}>
                    <Text>Value</Text>
                  </View>
                </View>

                {renderSwitch(sensorType_chart)}
                
              </ScrollView>
            </View>
          ) : (null)
        }
      </ScrollView>
    </View>
  )
}