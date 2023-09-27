import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';
import { Text, Button, View, ScrollView, RefreshControl, Image, TouchableOpacity, PermissionsAndroid, Alert, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart } from "react-native-chart-kit";
import { Buffer } from "buffer";
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';

export default TableData = ({ navigation, route }) => {
  const { devName_chart, devEUI_chart, sensorType_chart } = route.params;
  const { t } = useTranslation();
  // const [values, setValues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [times, setTimes] = useState([]);
  const [sensor1, setSensor1] = useState([]);
  const [sensor2, setSensor2] = useState([]);
  const [sensor3, setSensor3] = useState([]);
  const [sensor4, setSensor4] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const onChangeStartDate = (event, selectedDate) => {
    setShowStart(false);
    console.log("selectedDate", selectedDate);
    setStartDate(selectedDate);
  };
  const onChangeEndDate = (event, selectedDate) => {
    setShowEnd(false);
    setEndDate(selectedDate);
  };
  
  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    setRefreshing(true);
    fetch('http://35.79.124.43:3000/data/withtime/' + devEUI_chart, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
      body: JSON.stringify({
        // "start_at": startDate.toISOString().split("T")[0],
        // "end_at": endDate.toISOString().split("T")[0]
        "start_at": startDate.toISOString(),
        "end_at": endDate.toISOString()
      })
    })
      .then((response) => response.json())
      .then((json) => {
        // setValues(json);
        // jsonToArrayData(json)
        console.log(json)
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
      for(let i = 0; i < json.length; i++ )
      {
        setTimes(times => [...times, i])
        // setTimes(times => [...times, json[i].received_at.substring(0,10) + " " + (Number(json[i].received_at.substring(11,13))+7) + json[i].received_at.substring(13,19) + "(+7)"])
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
        else if(_4data.length == 4)
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

  const prepareData = () => {
    let dataList = []
    switch(sensorType_chart) {
      case "Temperature":
        {
          for( let index = 0; index < sensor1.length; index++)
          {
            dataList.push({ id: index, Time: times[index], Data: sensor1[index] })
          }
          return dataList;
        }
      case "Dessolved Oxygen":
        {
          for( let index = 0; index < sensor2.length; index++)
          {
            dataList.push({ id: index, Time: times[index], Data: sensor2[index] })
          }
          return dataList;
        }
      case "Pondus Hydrogenii":
        {
          for( let index = 0; index < sensor3.length; index++)
          {
            dataList.push({ id: index, Time: times[index], Data: sensor3[index] })
          }
          return dataList;
        }
      case "Amonia":
        {
          for( let index = 0; index < sensor4.length; index++)
          {
            dataList.push({ id: index, Time: times[index], Data: sensor4[index] })
          }
          return dataList;
        }
    }
  }

  const exportDataToExcel = () => {
    // Created Sample data
    let sample_data_to_export = [];
    sample_data_to_export = prepareData()

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(sample_data_to_export)    
    XLSX.utils.book_append_sheet(wb,ws,"Users")
    const wbout = XLSX.write(wb, {type:'binary', bookType:"xlsx"});

    let ms = Date.now();

    // Write generated excel to Storage
    // console.log(RNFS.DownloadDirectoryPath)
    RNFS.writeFile(RNFS.DownloadDirectoryPath + '/' + sensorType_chart + ms + '.xlsx', wbout, 'ascii').then((r)=>{
      console.log('Success');
      Alert.alert(
        null,
        t('common:sharemessage') + sensorType_chart + ms + ".xlsx",
        [
          { text: "좋아요", onPress: () => console.log("OK Pressed") }
        ]
      );
    }).catch((e)=>{
      console.log('Error', e);
    });
  }

  const handleClick = async () => {
    try{
      // Check for Permission (check if permission is already given or not)
      let isPermitedExternalStorage = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if(!isPermitedExternalStorage){
        // Ask for permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage permission needed",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Permission Granted (calling our exportDataToExcel function)
          exportDataToExcel();
          console.log("Permission granted");
        } else {
          // Permission denied
          console.log("Permission denied");
        }
      } else {
         // Already have Permission (calling our exportDataToExcel function)
         exportDataToExcel();
      }
    } catch(e) {
      console.log('Error while checking permission');
      console.log(e);
      return
    }
  };

  const renderTableName = (param) => {
    switch(param) {
      case "Temperature":
        return (
          <Text style={{ fontSize: 20 }}>{t('common:rtdText')}</Text>
        );
      case "Dessolved Oxygen":
        return (
          <Text style={{ fontSize: 20 }}>{t('common:doText')}</Text>
        );
      case "Pondus Hydrogenii":
        return (
          <Text style={{ fontSize: 20 }}>{t('common:phText')}</Text>
        );
      case "Amonia":
        return (
          <Text style={{ fontSize: 20 }}>{t('common:nh4Text')}</Text>
        );
    }
  }

  const renderSwitch = (param) => {
    switch(param) {
      case "Temperature":
        return (
          dataLoaded && times.length > 0 &&
          <BarChart
            data={{
              labels: times,
              datasets: [
                {
                  data: sensor1
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={300}
            // yAxisLabel="$"
            xAxisLabel=""
            yAxisSuffix="&deg;C"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(1, 87, 155, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={0}
            // showValuesOnTopOfBars={true}
            style={{
              marginVertical: 10,
              borderRadius: 0
            }}
          />
        );
      case "Dessolved Oxygen":
        return (
          dataLoaded && times.length > 0 &&
          <BarChart
            data={{
              labels: times,
              datasets: [
                {
                  data: sensor2
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={300}
            // yAxisLabel="$"
            xAxisLabel=""
            yAxisSuffix="mg/l"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(1, 87, 155, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={0}
            // showValuesOnTopOfBars={true}
            style={{
              marginVertical: 10,
              borderRadius: 0
            }}
          />
        );
      case "Pondus Hydrogenii":
        return (
          dataLoaded && times.length > 0 &&
          <BarChart
            data={{
              labels: times,
              datasets: [
                {
                  data: sensor3
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={300}
            // yAxisLabel="$"
            xAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(1, 87, 155, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={0}
            // showValuesOnTopOfBars={true}
            style={{
              marginVertical: 10,
              borderRadius: 0
            }}
          />
        );
      case "Amonia":
        return (
          dataLoaded && times.length > 0 &&
          <BarChart
            data={{
              labels: times,
              datasets: [
                {
                  data: sensor4
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={300}
            // yAxisLabel="$"
            xAxisLabel=""
            yAxisSuffix="kmol/l"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(1, 87, 155, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            verticalLabelRotation={0}
            // showValuesOnTopOfBars={true}
            style={{
              marginVertical: 10,
              borderRadius: 0
            }}
          />
        );
    }
  }

  return(
    <View style={{ flex: 1 }}>
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
      {/* <View style={{ flex: 1, maxHeight: 60 }}>
        <Text style={{ fontSize: 30, alignSelf: "center", margin: 10, maxHeight: 40 }}>{devName_chart}</Text>
        <TouchableOpacity style={{ width: 40, height: 40, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 100, position: "absolute", right: 10, top: 10, backgroundColor: "#ffffff" }} 
        onPress={() =>  handleClick()}
        >
          <Image
            style={{ width: 25, height: 25  }}
            source={require("../images/saveIco.png")}
          />
        </TouchableOpacity>
      </View> */}
      <View>
        <View style={{ padding: 10 }}>
          {renderTableName(sensorType_chart)}
        </View>
        <View style={{ alignItems: "center", alignContent: "center"}}>
          <View style={{ flexDirection: "row"}}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{startDate.toISOString().split("T")[0]}</Text>
            <TouchableOpacity style={{ width: 25, height: 25, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}
              onPress={() => setShowStart(true)}
            >
              <Image
                style={{ width: 20, height: 20  }}
                source={require("../images/calendar.png")}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}> ~ </Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{endDate.toISOString().split("T")[0]}</Text>
            <TouchableOpacity style={{ width: 25, height: 25, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}
              onPress={() => setShowEnd(true)}
            >
              <Image
                style={{ width: 20, height: 20  }}
                source={require("../images/calendar.png")}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Button title={t('common:getdata')} onPress={() => onRefresh()}/>
        {showStart && (
          <DateTimePicker
            testID="dateStartPicker"
            value={startDate}
            mode={"date"}
            onChange={onChangeStartDate}
          />
        )}
        {showEnd && (
          <DateTimePicker
            testID="dateEndPicker"
            value={endDate}
            mode={"date"}
            onChange={onChangeEndDate}
          />
        )}
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
              {renderSwitch(sensorType_chart)}
            </View>
          ) : (null)
        }
      </ScrollView>
      <View style={{ height: 60, paddingBottom: 60, position: "absolute", bottom: 0, alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity style={{ width: 300, height: 40, borderRadius: 10, backgroundColor: "#ffffff", alignSelf: "center", alignItems: "center", justifyContent: "center" }} 
          onPress={() =>  handleClick()}
        >
          <Text>{t('common:share')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}