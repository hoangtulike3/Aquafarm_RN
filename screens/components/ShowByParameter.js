// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, TouchableOpacity } from 'react-native';
import { Buffer } from "buffer";

export default ShowByParameter = (props) => {
  const { t } = useTranslation();
  const [values, setValues] = useState([]);
  const navigation = props.navigation;
  const parameter = props.parameter;
  const [itemAll, setItemAll] = useState([
  {
    label: t('common:notsetlocation'),
    value: "None"
  }]);
  const [itemDefaultAll, setItemDefaultAll] = useState([
    {
      label: t('common:notsetlocation'),
      value: "None"
    }]);

  const bufferToData = (value) => {
    let data = Buffer(value.data).toString("utf8");
    // console.log(data);
    const _4data = data.split("/");
    if(_4data.length == 5 )
    {
      return _4data
    }
    else
    {
      if(_4data.length == 4)
      {
        return [_4data[0], _4data[1], _4data[2], _4data[3]]
      }
      else
      {
        return ["t0", "d0", "p0", "n0"]
      }
    }
  }

  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/data/email/'+ props.infor.email, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setValues(json);
        console.log(json);
        // let data = Buffer(json[0].data).toString("utf8");
        // console.log(data);
        // setValues(data.split("/"));
        // console.log(values);
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  };
  const GetListFarmName = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/farm/' + props.selectedPlace.place_name, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        json.forEach(element => {
          setItemAll([...itemDefaultAll, {
            label: element.farm_name,
            value: element.farm_name
          }]);
        });
        console.log(json);
        // let data = Buffer(json[0].data).toString("utf8");
        // console.log(data);
        // setValues(data.split("/"));
        // console.log(values);
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  };

  const deleteDevice = async (device_name, devEui) => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/device', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
      body: JSON.stringify({
        "dev_eui": devEui,
        "email": props.infor.email,
        "device_name": device_name
      })
    }).then((response) => response.json())
      .then((json) => {
        console.log("Delete device: ", devEui, props.infor.email, device_name, json);
        // let data = Buffer(json[0].data).toString("utf8");
        // console.log(data);
        // setValues(data.split("/"));
        // console.log(values);
        props.setRefreshing(true);
        props.onRefresh();
        setTimeout(() => { 
          props.setRefreshing(false);
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    console.log("Refresh ShowByParameter");
    onRefresh();
  },[props])
  useEffect(() => {
    onRefresh();
    GetListFarmName();
  },[props.selectedPlace])

  const renderByParameter = (param, data) => {
    switch (param) {
      case "RTD":
        return (
          <Text>{bufferToData(data)[0].slice(1)} &deg;C</Text>
        );
      case "DO":
        return (
          <Text>{bufferToData(data)[1].slice(1)} mg/l</Text>
        );
      case "pH":
        return (
          <Text>{bufferToData(data)[2].slice(1)}</Text>
        );
      case "NH4":
        return (
          <Text>{bufferToData(data)[3].slice(1)} kmol/l</Text>
        );
    }
  }

  return (
    <View>
      {itemAll?.map( (valueZone, indexZone) =>
        valueZone != null ?
        valueZone.value != "None" ?
        <View style={{ backgroundColor: "#ffffff" }} key={indexZone}>
          <Text style={{ fontSize: 20 }}>{valueZone.label}</Text>
          <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            {values?.map( (value, index) =>
              value != null ?
                value.deviceInfor.farm_name == valueZone.value && value.deviceInfor.place_name == props.selectedPlace.place_name ? 
                <TouchableOpacity style={{ width: 80, height: 80, backgroundColor: "#dedede", margin: 5, alignItems: "center" }} key={index}
                  onPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    console.log(devEui);
                    navigation.navigate('DeviceController', {
                      devName_chart: value.deviceInfor.device_name,
                      devEUI_chart: value.deviceInfor.dev_eui
                    });
                  }}
                  onLongPress={() => {
                    // let devEui = Buffer(value.dev_eui).toString("hex");
                    // console.log(devEui);
                    Alert.alert(
                      t('common:deletewarning'),
                      value.deviceInfor.device_name + t('common:deletemessage'),
                      [
                        {
                          text: t('common:no'),
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: t('common:yes'), onPress: () => deleteDevice(value.deviceInfor.device_name, value.deviceInfor.dev_eui) }
                      ]
                    );
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{value.deviceInfor.device_name}</Text>
                  <Text>    </Text>
                  {renderByParameter(parameter, value)}
                  <Text>{new Date(value.received_at).toLocaleString().split(",")[1].slice(0, 6)}</Text>
                </TouchableOpacity>
              : null
              
              : null
            )}
          </View>
        </View>
        :
        <View style={{ backgroundColor: "#ffffff" }} key={indexZone}>
          <Text style={{ fontSize: 20 }}>{valueZone.label}</Text>
          <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            {values?.map( (value, index) =>
              value != null ?
                value.deviceInfor.farm_name == null || value.deviceInfor.farm_name == "null" && value.deviceInfor.place_name == props.selectedPlace.place_name ? 
                <TouchableOpacity style={{ width: 80, height: 80, backgroundColor: "#dedede", margin: 5, alignItems: "center" }} key={index}
                  onPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    console.log(devEui);
                    navigation.navigate('DeviceController', {
                      devName_chart: value.deviceInfor.device_name,
                      devEUI_chart: value.deviceInfor.dev_eui
                    });
                  }}
                  onLongPress={() => {
                    // let devEui = Buffer(value.dev_eui).toString("hex");
                    // console.log(devEui);
                    Alert.alert(
                      t('common:deletewarning'),
                      value.deviceInfor.device_name + t('common:deletemessage'),
                      [
                        {
                          text: t('common:no'),
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: t('common:yes'), onPress: () => deleteDevice(value.deviceInfor.device_name, value.deviceInfor.dev_eui) }
                      ]
                    );
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>{value.deviceInfor.device_name}</Text>
                  <Text>    </Text>
                  {renderByParameter(parameter, value)}
                  <Text>{new Date(value.received_at).toLocaleString().split(",")[1].slice(0, 6)}</Text>
                </TouchableOpacity>
              : null
              
              : null
            )}
          </View>
        </View>
        : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    height: 45,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});
