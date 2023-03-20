// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Buffer } from "buffer";
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios"

export default MyPage = ({ navigation, route, infor }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [values, setValues] = useState([]);

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
        navigation.navigate('Login');
      });
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
      return ["t0", "d0", "p0", "n0", "00000000"]
    }
  }

  let checkwarning = (valueS) => {
    try {
      valueS.forEach(element => {
        const rtd = Number(bufferToData(element)[0].slice(1));
        const d_o = Number(bufferToData(element)[1].slice(1));
        const ph = Number(bufferToData(element)[2].slice(1));
        const nh3 = Number(bufferToData(element)[3].slice(1));
        let sensorWanring = ""
        if( rtd <= 29 || rtd >= 31 )
          sensorWanring += "RTD";
        if( d_o <= 29 || d_o >= 31 )
        sensorWanring += ", DO";
        if( ph <= 1.803 )
        sensorWanring += ", PH";
        if( nh3 <= 3.5)
          sensorWanring += ", NH3";
        runNotification(sensorWanring, element.device_name);
      });
    } catch (err) {
      console.log(err);
    }
  }

  const runNotification = (strData, strName) =>{
    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "1",
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: Platform.OS === 'ios'
      // requestPermissions: true
    });

    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: '0', // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText: "Giá trị cảm biến " + strData + " của thiết bị " + strName + " vượt ngưỡng cho phép.",//"Cảnh báo này sẽ hiển thị khi giá trị cảm biến vượt ngưỡng cho phép.", // (optional) default: "message" prop
      subText: "Hiển thị", // (optional) default: none
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: 'some_tag', // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      /* iOS and Android properties */
      title: "Cảnh báo", // (optional, for iOS this is only used in apple watch, the title will be the app name on other iOS devices)
      message: strName + ": Giá trị cảm biến " + strData + " vượt ngưỡng cho phép.", // (required)
      playSound: false, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: '10', // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      repeatType: 'day', // (Android only) Repeating interval. Could be one of `week`, `day`, `hour`, `minute, `time`. If specified as time, it should be accompanied by one more parameter 'repeatTime` which should the number of milliseconds between each interval
      // actions: '["Yes", "No"]',  // (Android only) See the doc for notification actions to know more
    });
  }

  useEffect(() => {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => { 
      setRefreshing(false);
    }, 1000);
    // runNotification();
  },[]);
  useEffect(() => {
    setTimeout(() => {
      onRefresh();
    }, 60000);
    checkwarning(values);
  },[values])

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
    {/* <View style={{ flex: 1, backgroundColor: '#673ab7' }} > */}
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", maxHeight: 50 }}>
        <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>Danh sách thiết bị</Text>
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
        {
          values.map( (value, index) =>
            value != null ?
              <View style={{ backgroundColor: "#efefef", marginVertical: 10}} key={index} on>
                <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 40 }}>
                    <Text style={{ fontSize: 16, marginLeft: 20 }}>Tên thiết bị</Text>
                    <View style={{ position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 16, marginLeft: 20 }}>{ value.device_name }</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginHorizontal: 20, height: 60, borderTopWidth: 1, borderTopColor: "#dedede" }}
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
                      "Xoá thiết bị",
                      "Bạn có muốn xoá thiết bị có tên '" + value.device_name + "' không?",
                      [
                        {
                          text: "Không",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: "Có", onPress: () => deleteDevice(devEui) }
                      ]
                    );
                  }}
                  >
                    <View style={{ flexDirection: "row" , alignItems: "center"}}>
                      <Text style={{ fontSize: 16 }}>Giá trị cảm biến</Text>
                      <View style={{ flexDirection: "row", position: "absolute", right: 0 }}>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: "#1cb0b0" }}>{bufferToData(value)[0]}</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: "#1cb28a" }}>{bufferToData(value)[1]}</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: "#5c9fff" }}>{bufferToData(value)[2]}</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: "#111efe" }}>{bufferToData(value)[3]}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row" , alignItems: "center"}}>
                      <Text style={{ fontSize: 16 }}>Trạng thái Rơle</Text>
                      <View style={{ flexDirection: "row", position: "absolute", right: 0 }}>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][0] == '1' ? "#09f21f" : "#ff0000" }}>R1</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][1] == '1' ? "#09f21f" : "#ff0000" }}>R2</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][2] == '1' ? "#09f21f" : "#ff0000" }}>R3</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][3] == '1' ? "#09f21f" : "#ff0000" }}>R4</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][4] == '1' ? "#09f21f" : "#ff0000" }}>R5</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][5] == '1' ? "#09f21f" : "#ff0000" }}>R6</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][6] == '1' ? "#09f21f" : "#ff0000" }}>R7</Text>
                        <Text style={{ fontSize: 12, marginLeft: 4, color: bufferToData(value)[4][7] == '1' ? "#09f21f" : "#ff0000" }}>R8</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            : 
              <View style={{ backgroundColor: "#efefef", marginVertical: 10}} key={index}>
                <View style={{ backgroundColor: "#ffffff", marginVertical: 20, marginHorizontal: 10, padding: 10, borderRadius: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 40 }}>
                    <Text style={{ fontSize: 16, marginLeft: 20 }}>Tên thiết bị</Text>
                    <View style={{ position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 16, marginLeft: 20 }}>null</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={{ marginHorizontal: 20, flexDirection: "row", alignItems: "center", height: 40, borderTopWidth: 1, borderTopColor: "#dedede" }}
                  onLongPress={() => {
                    let devEui = Buffer(value.dev_eui).toString("hex");
                    // console.log(devEui);
                    Alert.alert(
                      "Xoá thiết bị",
                      "Bạn có muốn xoá thiết bị có tên 'null' không?",
                      [
                        {
                          text: "Không",
                          onPress: () => console.log("Cancel Pressed"),
                          style: "No"
                        },
                        { text: "Có", onPress: () => deleteDevice(devEui) }
                      ]
                    );
                  }}
                  >
                    <Text style={{ fontSize: 16 }}>Giá trị cảm biến</Text>
                    <View style={{ flexDirection: "row", position: "absolute", right: 0 }}>
                      <Text style={{ fontSize: 12, marginLeft: 4, color: "#0affff" }}>Không có dữ liệu</Text>
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
