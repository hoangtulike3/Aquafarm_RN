// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, Dimensions, RefreshControl, TouchableOpacity, PermissionsAndroid, Image, TouchableHighlight} from 'react-native';
import { Buffer } from "buffer";

export default ShowAllZone = (props) => {
  const { t } = useTranslation();
  const values = props.value;
  const navigation = props.navigation;

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
      if(_4data.length == 4 )
      {
        return [_4data[0], _4data[1], _4data[2], _4data[3]]
      }
      else
      {
        return ["t0", "d0", "p0", "n0"]
      }
    }
  }
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


  return (
    values?.map( (value, index) =>
      value != null && value.deviceInfor.place_name == props.selectedPlace.place_name ?
        <View style={{ flexDirection: "row", backgroundColor: "#efefef", marginVertical: 0}} key={index} >
          <TouchableOpacity style={{ width: ( props.isDeleteDevice ? Dimensions.get("window").width -80 : Dimensions.get("window").width -20), 
          backgroundColor: "#ffffff", marginVertical: 5, marginHorizontal: 10, paddingHorizontal: 10, paddingBottom: 20, 
          borderRadius: 10, borderWidth: 2, borderColor: "#000000" }}
          onPress={() => {
            let devEui = Buffer(value.dev_eui).toString("hex");
            console.log(devEui);
            navigation.navigate('DeviceController', {
              devName_chart: value.deviceInfor.device_name,
              devEUI_chart: value.deviceInfor.dev_eui
            });
          }}
          onLongPress={() => props.setDeleteDevice(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", height: 60 }}>
              <Text style={{ fontSize: 16 }}>{ value.deviceInfor.device_name }</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, paddingLeft: 80 }}><Text>Temp</Text></View>
              <View style={{ flex: 1 }}><Text>{bufferToData(value)[0].slice(1)} &deg;C</Text></View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, paddingLeft: 80 }}><Text>DO</Text></View>
              <View style={{ flex: 1 }}><Text>{bufferToData(value)[1].slice(1)} mg/l</Text></View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, paddingLeft: 80 }}><Text>pH</Text></View>
              <View style={{ flex: 1 }}><Text>{bufferToData(value)[2].slice(1)}</Text></View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, paddingLeft: 80 }}><Text>NH4</Text></View>
              <View style={{ flex: 1 }}><Text>{bufferToData(value)[3].slice(1)} kmol/L</Text></View>
            </View>
            <View style={{ alignItems: "center" }}>
              {value.received_by && <Text> {new Date(value.received_at).toLocaleString()} by {value.received_by} </Text>}
            </View>
          </TouchableOpacity>
          
          {
            props.isDeleteDevice &&
            <TouchableOpacity style={{ backgroundColor: "#ff0000", width: 40, height: 40, borderRadius: 100, alignSelf: "center", alignItems: "center", 
            justifyContent: "center", marginVertical: 10 }}
            onPress={() => {
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
              <Image source={require('../../images/trashIcon.png')} style={{ width: 20, height: 20 }}/>
            </TouchableOpacity>
          }
        </View>
      : 
      null
    )
        
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
