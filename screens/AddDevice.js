import AsyncStorage from '@react-native-async-storage/async-storage';
// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default AddDevice = ({ navigation, route }) => {
  const { email } = route.params;
  // const [token, setToken] = useState(null);
  const [name, onChangeName] = useState(null);
  const [devEUI, onChangeDevEUI] = useState(null);

  const postDevicesOfUsers = async () => {
    if(devEUI != null)
    {
      const TokenValue = await AsyncStorage.getItem("token");
      fetch('http://35.79.124.43:3000/device', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TokenValue
        },
        body: JSON.stringify({
          "email": email,
          "dev_eui": devEUI
        })
      })
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          Alert.alert(
            "Add device",
            (json ? "SUCCESS" : "FALSE"),
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "OK", onPress: () => console.log("OK Pressed") }
            ]
          );
          navigation.navigate('MyPage');
        })
        .catch((error) => {
          console.error(error);
        });
    }
    else
    {
      Alert.alert(
        "Warning",
        "Please type DevEUI of device",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
    }
  }

  return (
    <ScrollView>
      <View style={{ paddingTop: 20 }}>
      {/* <View style={{ flex: 1, backgroundColor: '#673ab7' }} > */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>Thêm thiết bị</Text>
          <TouchableOpacity style={{ width: 60, height: 30, alignSelf: "center", alignItems: "center", borderRadius: 5, justifyContent: "center", position: "absolute", right: 10, backgroundColor: "#ffffff" }} 
          onPress={() => postDevicesOfUsers()}
          >
            <Text>Lưu</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: "#efefef", marginVertical: 10}}>
          <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginLeft: 20, marginRight: 10, flex: 1 }}>Tên thiết bị</Text>
              <TextInput
                style={{ flex: 2, borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
                onChangeText={onChangeName}
                value={name}
                placeholder="Name"
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginLeft: 20, marginRight: 10, flex: 1 }}>DevEUI*</Text>
              <TextInput
                style={{ flex: 2, borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
                onChangeText={onChangeDevEUI}
                value={devEUI}
                placeholder="Dev EUI"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
