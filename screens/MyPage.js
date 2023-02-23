// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Buffer } from "buffer";
import {AppRegistry} from 'react-native';
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios"

// AppRegistry.registerHeadlessTask('CheckSensorValue', () =>
//   require('../task/CheckSensorValue'),
// );

export default MyPage = ({ navigation, route, infor }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [values, setValues] = useState([]);

  const onRefresh = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    setRefreshing(true);
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
      });
    setTimeout(() => { 
      // getEdgeServerInfo();
      setRefreshing(false);
     }, 1000);
     
    // wait(1000).then(() => {
    //   getEdgeServerInfo();
    //   setRefreshing(false);
    // });
  };

  const deleteDevice = async (devEui) => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/device', {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
      body: JSON.stringify({
        "dev_eui": devEui
      })
    }).then((response) => response.json())
      .then((json) => {
        console.log(json);
        // let data = Buffer(json[0].data).toString("utf8");
        // console.log(data);
        // setValues(data.split("/"));
        // console.log(values);
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
      return [0, 0, 0, 0]
    }
  }

  // const notification = () =>{
  //   // Must be outside of any component LifeCycle (such as `componentDidMount`).
  //   PushNotification.configure({
  //     // (optional) Called when Token is generated (iOS and Android)
  //     onRegister: function (token) {
  //       console.log("TOKEN:", token);
  //     },

  //     // (required) Called when a remote is received or opened, or local notification is opened
  //     onNotification: function (notification) {
  //       console.log("NOTIFICATION:", notification);

  //       // process the notification

  //       // (required) Called when a remote is received or opened, or local notification is opened
  //       notification.finish(PushNotificationIOS.FetchResult.NoData);
  //     },

  //     // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  //     onAction: function (notification) {
  //       console.log("ACTION:", notification.action);
  //       console.log("NOTIFICATION:", notification);

  //       // process the action
  //     },

  //     // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  //     onRegistrationError: function(err) {
  //       console.error(err.message, err);
  //     },

  //     // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
  //     senderID: "1",
  //     // IOS ONLY (optional): default: all - Permissions to register.
  //     permissions: {
  //       alert: true,
  //       badge: true,
  //       sound: true,
  //     },

  //     // Should the initial notification be popped automatically
  //     // default: true
  //     popInitialNotification: true,

  //     /**
  //      * (optional) default: true
  //      * - Specified if permissions (ios) and token (android and ios) will requested or not,
  //      * - if not, you must call PushNotificationsHandler.requestPermissions() later
  //      * - if you are not using remote notification or do not have Firebase installed, use this:
  //      *     requestPermissions: Platform.OS === 'ios'
  //      */
  //     requestPermissions: true,
  //   });
  //   PushNotification.localNotification({
  //     /* Android Only Properties */
  //     id: '0', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
  //     ticker: "My Notification Ticker", // (optional)
  //     autoCancel: true, // (optional) default: true
  //     largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
  //     smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
  //     bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
  //     subText: "This is a subText", // (optional) default: none
  //     color: "red", // (optional) default: system default
  //     vibrate: true, // (optional) default: true
  //     vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
  //     tag: 'some_tag', // (optional) add tag to message
  //     group: "group", // (optional) add group to message
  //     ongoing: false, // (optional) set whether this is an "ongoing" notification
  //     /* iOS and Android properties */
  //     title: "My Notification Title", // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
  //     message: "My Notification Message", // (required)
  //     playSound: false, // (optional) default: true
  //     soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
  //     number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
  //     repeatType: 'day', // (Android only) Repeating interval. Could be one of `week`, `day`, `hour`, `minute, `time`. If specified as time, it should be accompanied by one more parameter 'repeatTime` which should the number of milliseconds between each interval
  //     actions: '["Yes", "No"]',  // (Android only) See the doc for notification actions to know more
  // });
  // }

  useEffect(() => {
    onRefresh();
    // notification()
  },[]);

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
    {/* <View style={{ flex: 1, backgroundColor: '#673ab7' }} > */}
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", maxHeight: 50 }}>
        <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>Sensors</Text>
        <TouchableOpacity style={{ width: 30, height: 30, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 100, position: "absolute", right: 10, backgroundColor: "#ffffff" }} 
        onPress={() =>  navigation.navigate('AddDevice', {
          email: infor.email
        })}
        >
          <Text>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 2, backgroundColor: "#ffffff" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {
          values.map( (value, index) =>
            value != null ?
              <View style={{ backgroundColor: "#efefef", marginVertical: 10}} key={index} on>
                <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 40 }}>
                    <Text style={{ fontSize: 16, marginLeft: 20 }}>Device name</Text>
                    <View style={{ position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 16, marginLeft: 20 }}>{ value.device_name }</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", height: 40, borderTopWidth: 1, borderTopColor: "#dedede" }}
                  onPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    console.log(devEui);
                    navigation.navigate('Chart', {
                      devName_chart: value.device_name,
                      devEUI_chart: devEui
                    });
                  }}
                  onLongPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    // console.log(devEui);
                    Alert.alert(
                      "Delete device",
                      "Do you want to delete device '" + value.device_name + "'",
                      [
                        {
                          text: "No",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: "Yes", onPress: () => deleteDevice(devEui) }
                      ]
                    );
                  }}
                  >
                    <Text style={{ fontSize: 16 }}>Value of Sensor</Text>
                    <View style={{ flexDirection: "row", position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#0affff" }}>{bufferToData(value)[0]}</Text>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#09f21f" }}>{bufferToData(value)[1]}</Text>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#0c9fff" }}>{bufferToData(value)[2]}</Text>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#111efe" }}>{bufferToData(value)[3]}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            : 
              <View style={{ backgroundColor: "#efefef", marginVertical: 10}} key={index}>
                <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 40 }}>
                    <Text style={{ fontSize: 16, marginLeft: 20 }}>Device name</Text>
                    <View style={{ position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 16, marginLeft: 20 }}>null</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", height: 40, borderTopWidth: 1, borderTopColor: "#dedede" }}
                  onLongPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    // console.log(devEui);
                    Alert.alert(
                      "Delete device",
                      "Do you want to delete device 'null'",
                      [
                        {
                          text: "No",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: "Yes", onPress: () => deleteDevice(devEui) }
                      ]
                    );
                  }}
                  >
                    <Text style={{ fontSize: 16 }}>Value of Sensor</Text>
                    <View style={{ flexDirection: "row", position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#0affff" }}>No data</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
          )
        }
      </ScrollView>

        {/* <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={{ alignItems: "center", backgroundColor: "#dedede", width: 75, height: 75, borderRadius: 100 }}>
              <Image source={require('../images/person-avatar.png')} style={{ width: 75, height: 75, borderRadius: 100}} />
              <View style={{ backgroundColor: "#00d015", width: 10, height: 10, borderRadius: 100, position: "absolute", right: 5, bottom: 5 }} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 2, paddingRight: 20}}>
            
        </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // map: {
  //   width: Dimensions.get('window').width,
  //   height: Dimensions.get('window').height,
  //   zIndex: 1,
  // },
});
