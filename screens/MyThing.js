// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, RefreshControl, Platform, TouchableOpacity, PermissionsAndroid, Image, Button} from 'react-native';
import { Buffer } from "buffer";

export default MyThing = ({ navigation, route, infor }) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [values, setValues] = useState([]);
  const [connectedDeviceList, setConnectedDeviceList] = useState([]);

  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/data/email/'+ infor.email, {
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

  useEffect(() => {
    onRefresh();
  },[])

  return (
    <View style={{ flex: 1, paddingTop: 0 }}>
      <View style={{ flexDirection: "row", height: 70, paddingTop: 20, backgroundColor: "#ffffff" }}>
        <Text style={{ fontSize: 25, paddingLeft: 10 }}>{t('common:mythings')}</Text>
        <TouchableOpacity style={{ width: 80, height: 40, position: "absolute", top: 10, right: 10, borderWidth: 1, borderColor: "#000000", borderRadius: 5, 
        alignItems: "center", justifyContent: "center" }}
          onPress={() =>  navigation.navigate('AddThing', { infor: infor, connectedDeviceList: connectedDeviceList, setConnectedDeviceList: setConnectedDeviceList })}
        >
          <Text>+ {t('common:thing')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              onRefresh();
              setTimeout(() => { 
                setRefreshing(false);
              }, 1000); 
            }}
          />
        }
      >
        <View>
          <Text style={{ paddingLeft: 10, paddingTop: 20 }}>{t('common:aquasensor')}</Text>
          <Text style={{ paddingLeft: 10 }}>{t('common:aquaculture')}</Text>
          {
            connectedDeviceList.map((value, index) => 
              value != null &&
              <TouchableOpacity style={{ flexDirection: "row", height: 40, backgroundColor: "#ffffff", alignItems: "center", borderBottomWidth: 1, 
              borderBottomColor: "#000000" }} key={index}
                onPress={() =>  navigation.navigate('Connect', {infor: infor, value: value})}
              >
                <Text style={{ paddingLeft: 10 }}>#{index}</Text>
                <Text style={{ paddingLeft: 5 }}>{value.name}</Text>
                {/* <Text style={{ position: "absolute", right: 80 }}>{t('common:connected')}</Text> */}
                <Image source={require("../images/nextIcon.png")} style={{ width: 15, height: 10, position: "absolute", right: 20 }}/>
              </TouchableOpacity>
            )
          }
        </View>
        <View>
          <Text style={{ paddingLeft: 10, paddingTop: 20 }}>{t('common:aquacontroller')}</Text>
          <Text style={{ paddingLeft: 10 }}>{t('common:aquaculture')}</Text>
          {
            values.map((value, index) => 
              value != null &&
              <TouchableOpacity style={{ flexDirection: "row", height: 40, backgroundColor: "#ffffff", alignItems: "center", 
              borderBottomWidth: 1, borderBottomColor: "#000000" }} key={index}
              onPress={() => {
                let devEui = Buffer(value.dev_eui).toString("hex");
                console.log(devEui);
                navigation.navigate('DeviceController', {
                  devName_chart: value.deviceInfor.device_name,
                  devEUI_chart: value.deviceInfor.dev_eui
                });
              }}
              >
                <Text style={{ paddingLeft: 10 }}>#{index}</Text>
                <Text style={{ paddingLeft: 5 }}>{value.device_name}</Text>
                <Text style={{ position: "absolute", right: 80 }}>{t('common:online')}</Text>
                <Image source={require("../images/nextIcon.png")} style={{ width: 15, height: 10, position: "absolute", right: 20 }}/>
              </TouchableOpacity>
            )
          }
          
        </View>
      </ScrollView>
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
