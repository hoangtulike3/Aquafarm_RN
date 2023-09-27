import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Dimensions, View, ScrollView, RefreshControl, Image, TouchableOpacity, Switch, Linking } from 'react-native';
import { Buffer } from "buffer";

export default DeviceController = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { devName_chart, devEUI_chart } = route.params;
  // const [values, setValues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [byUser, setByUser] = useState([]);
  const [times, setTimes] = useState([]);
  const [sensor1, setSensor1] = useState([]);
  const [sensor2, setSensor2] = useState([]);
  const [sensor3, setSensor3] = useState([]);
  const [sensor4, setSensor4] = useState([]);

  const [relayStt, setRelayStt] = useState(null);

  const [dataLoaded, setDataLoaded] = useState(false);

  // const delay = ms => new Promise(
  //   resolve => setTimeout(resolve, ms)
  // );
  
  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    setRefreshing(true);
    fetch('http://35.79.124.43:3000/data/' + devEUI_chart + '/1', {
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

  // const controlRelay = async (devEui, message ) => {
  //   const TokenValue = await AsyncStorage.getItem("token");
  //   fetch('http://35.79.124.43:3000/data/'+ devEui, {
  //     method: 'POST',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'application/json',
  //       'Authorization': 'Bearer ' + TokenValue
  //     },
  //     body: JSON.stringify({
  //       "data" : message
  //     })
  //   }).then((response) => response.json())
  //     .then( async (json) => {
  //       console.log(json);
  //       await delay(3000);
  //       onRefresh();
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };

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
        setByUser(byUser => [...byUser, json[i].received_by])
        setTimes(times => [...times, json[i].received_at])
        // setTimes(times => [...times, (Number(json[i].received_at.substring(11,13))+7)+json[i].received_at.substring(13,16)])

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
  }, []);
  useEffect(() => {
    console.log("data CHANGED - Reload UI");
  }, [refreshing]);
  useEffect(() => {
    console.log("relay CHANGED - Reload UI");
  }, [relayStt]);

  return(
    <View style={{ flex: 1, backgroundColor: "#efefef" }}>
      <View style={{ flexDirection: "row", padding: 10, maxHeight: 60, backgroundColor: "#ffffff" }}>
        <TouchableOpacity style={{ width: 40, height: 40 }}
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../images/backIcon.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 30}}>{devName_chart}</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", right: 10, top: 15 }}
          onPress={() => navigation.navigate('Places')}
        >
          <Image source={require('../images/closeIcon.png')} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>
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
              <Text style={{ fontSize: 20, margin: 10}}>{t('common:sensors')}</Text>
              <TouchableOpacity style={{ height: 50 }}
                onPress={() => {
                  navigation.navigate('TableData', {
                    devName_chart: devName_chart,
                    devEUI_chart: devEUI_chart,
                    sensorType_chart: "Temperature"
                  });
                }}
              >
                <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                  <Text style={{ flex: 2 }}>{t('common:rtdText')} (&deg;C)</Text>
                  <Text style={{ flex: 2 }}>{sensor1[0]}</Text>
                  <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ height: 50 }}
                onPress={() => {
                  navigation.navigate('TableData', {
                    devName_chart: devName_chart,
                    devEUI_chart: devEUI_chart,
                    sensorType_chart: "Dessolved Oxygen"
                  });
                }}
              >
                <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                  <Text style={{ flex: 2 }}>{t('common:do')} (mg/l)</Text>
                  <Text style={{ flex: 2 }}>{sensor2[0]}</Text>
                  <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ height: 50 }}
                onPress={() => {
                  navigation.navigate('TableData', {
                    devName_chart: devName_chart,
                    devEUI_chart: devEUI_chart,
                    sensorType_chart: "Pondus Hydrogenii"
                  });
                }}
              >
                <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                  <Text style={{ flex: 2 }}>{t('common:ph')}</Text>
                  <Text style={{ flex: 2 }}>{sensor3[0]}</Text>
                  <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ height: 50 }}
                onPress={() => {
                  navigation.navigate('TableData', {
                    devName_chart: devName_chart,
                    devEUI_chart: devEUI_chart,
                    sensorType_chart: "Amonia"
                  });
                }}
              >
                <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", alignItems: 'center' }}>
                  <Text style={{ flex: 2 }}>{t('common:nh4')} (kmol/l)</Text>
                  <Text style={{ flex: 2 }}>{sensor4[0]}</Text>
                  <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                </View>
              </TouchableOpacity>

              {
              relayStt &&
              <View>
                <Text style={{ fontSize: 20, margin: 10}}>{t('common:relays')}</Text>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 1</Text>
                    <Text style={{ flex: 2 }}>{relayStt[0] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 2</Text>
                    <Text style={{ flex: 2 }}>{relayStt[1] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 3</Text>
                    <Text style={{ flex: 2 }}>{relayStt[2] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 4</Text>
                    <Text style={{ flex: 2 }}>{relayStt[3] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 5</Text>
                    <Text style={{ flex: 2 }}>{relayStt[4] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 6</Text>
                    <Text style={{ flex: 2 }}>{relayStt[5] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", borderBottomWidth: 1, borderColor: "black", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 7</Text>
                    <Text style={{ flex: 2 }}>{relayStt[6] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ height: 50 }}>
                  <View style={{ flex: 2, flexDirection: "row", padding: 10, backgroundColor: "#ffffff", alignItems: 'center' }}>
                    <Text style={{ flex: 2 }}>{t('common:relay')} 8</Text>
                    <Text style={{ flex: 2 }}>{relayStt[7] == 1 ? t('common:on') : t('common:off')}</Text>
                    <Image source={require('../images/nextIcon.png')} style={{ width: 20, height: 20 }}/>
                  </View>
                </TouchableOpacity>
              </View>
              }
            </View>
          //   <View pointerEvents={ refreshing ? "none" : "auto"}>
          //     <ScrollView style={{ paddingBottom: 10 }} horizontal={true}>
          //       <View style={{ flexDirection: "row" }}>
          //         {
          //           relayStt && relayStt.map((val, index) =>
          //             val != null ?
          //               <View key={index}>
          //                 <Text style={{ marginLeft: 18 }}>R{index+1}</Text>
          //                 <Switch
          //                   trackColor={{false: '#767577', true: '#09f21f'}}
          //                   thumbColor={'#f4f3f4'}
          //                   ios_backgroundColor="#3e3e3e"
          //                   onValueChange={() => {
          //                       relayStt[index] = (val == "1" ? 0 : 1)
          //                       setRefreshing(true);
          //                       controlRelay(devEUI_chart, "R" + (index+1) + (val == "1" ? 0 : 1))
          //                       console.log("OnRelayChange: ", "R" + (index+1) + (val == "1" ? 0 : 1));
          //                     }
          //                   }
          //                   value={val == "1" ? true : false}
          //                 />
          //               </View>
          //             :
          //             null
          //           )
          //         }
          //       </View>
          //     </ScrollView>
              
              
          //     <Text>온도 측정 차트</Text>
          //     {/* Chart of sensor 1 nhiet do, do, ph, nh3 */} 
          //     <TouchableOpacity 
          //     onPress={() => {
          //       navigation.navigate('TableData', {
          //         devName_chart: devName_chart,
          //         devEUI_chart: devEUI_chart,
          //         sensorType_chart: "Temperature"
          //       });
          //     }}
          //     >
          //       <LineChart
          //         data={{
          //           labels: times,
          //           datasets: [
          //             {
          //               data: sensor1
          //             }
          //           ]
          //         }}
          //         width={Dimensions.get("window").width} // from react-native
          //         height={220}
          //         // yAxisLabel="$"
          //         xAxisLabel=""
          //         yAxisSuffix="&deg;C"
          //         yAxisInterval={1} // optional, defaults to 1
          //         chartConfig={{
          //           backgroundColor: "#e26a00",
          //           backgroundGradientFrom: "#217098",
          //           backgroundGradientTo: "#264A5d",
          //           decimalPlaces: 2, // optional, defaults to 2dp
          //           color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           style: {
          //             borderRadius: 16
          //           },
          //           propsForDots: {
          //             r: "6",
          //             strokeWidth: "2",
          //             stroke: "#fb8c00"
          //           }
          //         }}
          //         bezier
          //         style={{
          //           marginVertical: 8,
          //           borderRadius: 16
          //         }}
          //       />
          //     </TouchableOpacity>

          //     <Text>산소 측정 차트</Text>
          //     {/* Chart of sensor 2*/}
          //     <TouchableOpacity
          //     onPress={() => {
          //       navigation.navigate('TableData', {
          //         devName_chart: devName_chart,
          //         devEUI_chart: devEUI_chart,
          //         sensorType_chart: "Dessolved Oxygen"
          //       });
          //     }}
          //     >
          //       <LineChart
          //         data={{
          //           labels: times,
          //           datasets: [
          //             {
          //               data: sensor2
          //             }
          //           ]
          //         }}
          //         width={Dimensions.get("window").width} // from react-native
          //         height={220}
          //         // yAxisLabel=""
          //         xAxisLabel=""
          //         yAxisSuffix="mg/l"
          //         yAxisInterval={1} // optional, defaults to 1
          //         chartConfig={{
          //           backgroundColor: "#e26a00",
          //           backgroundGradientFrom: "#217098",
          //           backgroundGradientTo: "#264A5d",
          //           decimalPlaces: 2, // optional, defaults to 2dp
          //           color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           style: {
          //             borderRadius: 16
          //           },
          //           propsForDots: {
          //             r: "6",
          //             strokeWidth: "2",
          //             stroke: "#ffa726"
          //           }
          //         }}
          //         bezier
          //         style={{
          //           marginVertical: 8,
          //           borderRadius: 16
          //         }}
          //       />
          //     </TouchableOpacity>

          //     <Text>pH 측정 차트</Text>
          //     {/* Chart of sensor 3*/}
          //     <TouchableOpacity
          //     onPress={() => {
          //       navigation.navigate('TableData', {
          //         devName_chart: devName_chart,
          //         devEUI_chart: devEUI_chart,
          //         sensorType_chart: "Pondus Hydrogenii"
          //       });
          //     }}
          //     >
          //       <LineChart
          //         data={{
          //           labels: times,
          //           datasets: [
          //             {
          //               data: sensor3
          //             }
          //           ]
          //         }}
          //         width={Dimensions.get("window").width} // from react-native
          //         height={220}
          //         // yAxisLabel="$"
          //         xAxisLabel=""
          //         yAxisSuffix="pH"
          //         yAxisInterval={1} // optional, defaults to 1
          //         chartConfig={{
          //           backgroundColor: "#e26a00",
          //           backgroundGradientFrom: "#217098",
          //           backgroundGradientTo: "#264A5d",
          //           decimalPlaces: 2, // optional, defaults to 2dp
          //           color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           style: {
          //             borderRadius: 16
          //           },
          //           propsForDots: {
          //             r: "6",
          //             strokeWidth: "2",
          //             stroke: "#ffa726"
          //           }
          //         }}
          //         bezier
          //         style={{
          //           marginVertical: 8,
          //           borderRadius: 16
          //         }}
          //       />
          //     </TouchableOpacity>

          //     <Text>아모니아 측정 차트</Text>
          //     {/* Chart of sensor 4*/}
          //     <TouchableOpacity
          //     onPress={() => {
          //       navigation.navigate('TableData', {
          //         devName_chart: devName_chart,
          //         devEUI_chart: devEUI_chart,
          //         sensorType_chart: "Amonia"
          //       });
          //     }}
          //     >
          //       <LineChart
          //         data={{
          //           labels: times,
          //           datasets: [
          //             {
          //               data: sensor4
          //             }
          //           ]
          //         }}
          //         width={Dimensions.get("window").width} // from react-native
          //         height={220}
          //         // yAxisLabel="$"
          //         xAxisLabel=""
          //         yAxisSuffix="kmol/L"
          //         yAxisInterval={1} // optional, defaults to 1
          //         chartConfig={{
          //           backgroundColor: "#e26a00",
          //           backgroundGradientFrom: "#217098",
          //           backgroundGradientTo: "#264A5d",
          //           decimalPlaces: 2, // optional, defaults to 2dp
          //           color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          //           style: {
          //             borderRadius: 16
          //           },
          //           propsForDots: {
          //             r: "6",
          //             strokeWidth: "2",
          //             stroke: "#ffa726"
          //           }
          //         }}
          //         bezier
          //         style={{
          //           marginVertical: 8,
          //           borderRadius: 16
          //         }}
          //       />
          //     </TouchableOpacity>
          //   </View>
          ) : (null)
        }
      </ScrollView>
      <View style={{ height: 40, padding: 10, alignItems: "center" }}>
        {byUser[0] && <Text>{times[0]} by {byUser[0]}</Text>}
      </View>
    </View>
  )
}