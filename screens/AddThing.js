import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Alert, View, TouchableOpacity, Image } from 'react-native';
import { Buffer } from "buffer";

export default AddThing = ({ navigation, route }) => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, paddingTop: 0 }}>
      <View style={{ flexDirection: "row", height: 50, paddingTop: 10, backgroundColor: "#ffffff" }}>
        <Text style={{ fontSize: 20, paddingLeft: 10 }}>{t('common:addathing')}</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 10, right: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  navigation.navigate('Things')}
        >
          <Image source={require("../images/closeIcon.png")} style={{ width: 20, height: 20 }}/>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={{ height: 40, marginHorizontal: 10, borderWidth: 1, borderColor: "#000000", borderRadius: 5, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  navigation.navigate('AddBle', {infor: route.params.infor, connectedDeviceList: route.params.connectedDeviceList, setConnectedDeviceList: route.params.setConnectedDeviceList})}
        >
          <Text>{t('common:bledevice')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ height: 40, margin: 10, borderWidth: 1, borderColor: "#000000", borderRadius: 5, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  navigation.navigate('AddDevice', {infor: route.params.infor})}
        >
          <Text>{t('common:wifidevice')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
