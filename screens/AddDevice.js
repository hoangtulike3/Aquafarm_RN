import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, TextInput, TouchableOpacity, Button } from 'react-native';
import { Buffer } from "buffer";

export default AddDevice = ({ navigation, route }) => {
  const { email, username } = route.params;
  const { t } = useTranslation();
  // const [token, setToken] = useState(null);
  const [name, onChangeName] = useState(null);
  const [devEUI, onChangeDevEUI] = useState(null);
  const [type, setType] = useState(false);

  const postDevicesOfUsers = async () => {
    if(type)
    {
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
            "username": username,
            "dev_eui": devEUI,
            "device_name": name
          })
        })
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            if (json)
            {
              postDataOfDevice(0, 0, 0, 0, 0)
            }
            Alert.alert(
              t('common:adddevice'),
              (json ? t('common:success') : t('common:fail')),
              [
                {
                  text: t('common:cancel'),
                  onPress: () => {
                    console.log("Cancel Pressed")
                    navigation.goBack();
                  },
                  style: "cancel"
                },
                { text: t('common:ok'), onPress: () => {
                    console.log("OK Pressed")
                    navigation.goBack();
                  } 
                }
              ]
            );
          })
          .catch((error) => {
            console.error(error);
          });
      }
      else
      {
        Alert.alert(
          t('common:warning'),
          t('common:warningmessdeveui'),
          [
            { text: t('common:ok'), onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    }
    else
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
          "dev_eui": name,
          "device_name": name
        })
      })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        if (json)
        {
          postDataOfDevice(0, 0, 0, 0, 0)
        }
        Alert.alert(
          t('common:addtank'),
          (json ? t('common:success') : t('common:fail')),
          [
            { text: t('common:ok'), onPress: () => {
                console.log("OK Pressed")
                navigation.goBack();
              } 
            }
          ]
        );
      })
      .catch((error) => {
        console.error(error);
      });
    }
    
  }

  const postDataOfDevice = async (rtd, d_o, ph, nh4, ec) => {
    const TokenValue = await AsyncStorage.getItem("token");
    // console.log("Buffer:", Buffer.from("t" + rtd + "/" + "d" + d_o + "/" + "p" + ph + "/" + "n" + nh4).toString("utf8"))
    fetch('http://35.79.124.43:3000/id/data', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
      body: JSON.stringify({
        "dev_eui" : type ? devEUI : name,
        "device_name" : name,
        "application_id" : null,
        "application_name" : null,
        "data": JSON.stringify(Buffer.from("t" + rtd + "/" + "d" + d_o + "/" + "p" + ph + "/" + "n" + nh4)),
        "node_id": null,
        "device_id": null,
        "d_o": d_o,
        "ec" : ec,
        "ph": ph,
        "rtd": rtd,
        "nh4": nh4
      })
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("Them du lieu 00", json);
      })
      .catch((error) => {
        console.error(error);
    });
  }

  return (
    <ScrollView>
      <View style={{ paddingTop: 20 }}>
      {/* <View style={{ flex: 1, backgroundColor: '#673ab7' }} > */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity style={{ width: 60, height: 30, alignSelf: "center", alignItems: "center", borderRadius: 5, justifyContent: "center", position: "absolute", left: 10, backgroundColor: "#ffffff" }} 
          onPress={() => navigation.goBack()}
          >
            <Text>{t('common:cancel')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>{t('common:addtank')}</Text>
          <TouchableOpacity style={{ width: 60, height: 30, alignSelf: "center", alignItems: "center", borderRadius: 5, justifyContent: "center", position: "absolute", right: 10, backgroundColor: "#ffffff" }} 
          onPress={() => postDevicesOfUsers()}
          >
            <Text>{t('common:ok')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: "#efefef", marginVertical: 10}}>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <Button
              title={t('common:handdevice')}
              color={type ? "#e5e5e5" : "#575858"}
              onPress={() => setType(false)}
            />
            <Button
              title={t('common:localdevice')}
              color={type ? "#575858" : "#e5e5e5"}
              onPress={() => setType(true)}
            />
          </View>
          <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginLeft: 20, marginRight: 10, flex: 1 }}>{t('common:tankname')}</Text>
              <TextInput
                style={{ flex: 2, borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
                onChangeText={onChangeName}
                value={name}
                placeholder={t('common:name')}
              />
            </View>
            {type && <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginLeft: 20, marginRight: 10, flex: 1 }}>DevEUI*</Text>
              <TextInput
                style={{ flex: 2, borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
                onChangeText={onChangeDevEUI}
                value={devEUI}
                placeholder="Dev EUI"
              />
            </View>}
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
