// import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, ScrollView, RefreshControl, Platform, TouchableOpacity, PermissionsAndroid, Image} from 'react-native';
import { Buffer } from "buffer";
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { Dropdown } from 'react-native-element-dropdown';
import ShowAllZone from './components/ShowAllZone';
import ShowNoZone from './components/ShowNoZone';
import ShowViaZone from './components/ShowViaZone';
import ShowByParameter from './components/ShowByParameter';

export default MyPage = ({ navigation, route, infor }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [values, setValues] = useState([]);
  const [isDeleteDevice, setDeleteDevice] = useState(false);
  const [isViewAll, setViewAll] = useState(true);
  const [isFocus, setIsFocus] = useState(false);
  const [valueItemAll, setValueItemAll] = useState({
    label: t('common:all'),
    value: "All"
  });
  const [valueItemPer, setValueItemPer] = useState({
    label: "Temperature",
    value: "RTD"
  });
  const [itemAll, setItemAll] = useState([{
    label: t('common:all'),
    value: "All"
  },
  {
    label: t('common:notsetlocation'),
    value: "None"
  }]);
  const [itemDefaultAll, setDefaultItemAll] = useState([{
    label: t('common:all'),
    value: "All"
  },
  {
    label: t('common:notsetlocation'),
    value: "None"
  }]);
  const [itemPer, setItemPer] = useState([{
    label: t('common:rtdText'),
    value: "RTD"
  },
  {
    label: t('common:doText'),
    value: "DO"
  },
  {
    label: t('common:phText'),
    value: "pH"
  },
  {
    label: t('common:nh4Text'),
    value: "NH4"
  }]);

  const GetListPlace = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/place/'+ infor.email, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setPlaces(json);
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
  const GetListFarmName = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/farm/' + selectedPlace.place_name, {
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
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then((result) => {
      if (result) {
        console.log("Permission BLUETOOTH_SCAN is OK");
      } else {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then((result) => {
          if (result) {
            console.log("User accept BLUETOOTH_SCAN");
          } else {
            console.log("User refuse BLUETOOTH_SCAN");
          }
        });
      }
    });
    GetListPlace();
    // setSelectedPlace(places[0]);
    // GetListFarmName();
    // setRefreshing(true);
    // onRefresh();
    // setTimeout(() => { 
    //   setRefreshing(false);
    // }, 1000);
    // runNotification();
  },[]);
  
  // useEffect(() => {
  //   setTimeout(() => {
  //     onRefresh();
  //   }, 60000);
  //   checkwarning(values);
  // },[values])

  useEffect(() => {
    setSelectedPlace(places[0]);
  },[places])

  useEffect(() => {
    setMenuOpen(false);
    GetListFarmName();
    setRefreshing(true);
    onRefresh();
    setTimeout(() => { 
      setRefreshing(false);
    }, 1000);
  },[selectedPlace])

  const renderByZone = (param) => {
    switch(param) {
      case "All":
        return (
          <ShowAllZone value={values} navigation={navigation} infor={infor} isDeleteDevice={isDeleteDevice} setDeleteDevice={setDeleteDevice} 
          onRefresh={onRefresh} setRefreshing={setRefreshing} selectedPlace={selectedPlace} />
        );
      case "None":
        return (
          <ShowNoZone value={values} navigation={navigation} infor={infor} isDeleteDevice={isDeleteDevice} setDeleteDevice={setDeleteDevice} 
          onRefresh={onRefresh} setRefreshing={setRefreshing} selectedPlace={selectedPlace} />
        );
      case param:
        return (
          <ShowViaZone value={values} navigation={navigation} zone={param} infor={infor} isDeleteDevice={isDeleteDevice} setDeleteDevice={setDeleteDevice} 
          onRefresh={onRefresh} setRefreshing={setRefreshing} selectedPlace={selectedPlace} />
        );
    }
  }

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isMenuOpen &&
      <View style={{ width: 150 }}>
        {
          places.map((value, index) => 
            <TouchableOpacity style={{ height: 40, backgroundColor: (value?.place_name == selectedPlace?.place_name ? "#ffffff" : null), borderBottomWidth: 1, borderColor: "#000000", justifyContent: "center", paddingHorizontal: 10 }}
              onPress={() => setSelectedPlace(value)}
            >
              <Text key={index} style={{ fontSize: 20, color: (value?.place_name == selectedPlace?.place_name ? "#ff0000" : "#000000") }}>{value.place_name}</Text>
            </TouchableOpacity>
          )
        }
      </View>}
      <View style={{ flex: 1, paddingTop: 20 }}>
      {/* <View style={{ flex: 1, backgroundColor: '#673ab7' }} > */}
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", maxHeight: 50 }} onTouchStart={() => setDeleteDevice(false)}>
          <TouchableOpacity style={{ width: 30, height: 30, alignSelf: "center", alignItems: "center", justifyContent: "center", position: "absolute", left: 10 }} 
            onPress={() =>  setMenuOpen(!isMenuOpen)}
            >
              <Image source={require('../images/menu.png')} style={{ height: 30, width: 30 }}/>
          </TouchableOpacity>
          <Text style={{ fontSize: 30, marginBottom: 5, fontWeight: "bold", alignSelf: "center" }}>{selectedPlace?.place_name} Aquafarm</Text>
          <TouchableOpacity style={{ width: 30, height: 30, alignSelf: "center", alignItems: "center", justifyContent: "center", position: "absolute", right: 10 }} >
            <Menu>
              <MenuTrigger>
                <Image source={require('../images/more3dot.png')} style={{ height: 30, width: 30 }}/>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => setViewAll(true)} text={t('common:viewallparameter')} />
                <MenuOption onSelect={() => setViewAll(false)} text={t('common:viewperparameter')} />
              </MenuOptions>
            </Menu>
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={{ width: 30, height: 30, alignSelf: "center", alignItems: "center", justifyContent: "center", borderRadius: 100, position: "absolute", right: 10, backgroundColor: "#ffffff" }} 
          onPress={() =>  navigation.navigate('AddDevice', {
            email: infor.email
          })}
          >
            <Text>+</Text>
          </TouchableOpacity> */}
        </View>
        <View style={{ width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }} onTouchStart={() => setDeleteDevice(false)}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={isViewAll ? itemAll : itemPer}
            labelField="label"
            valueField="value"
            value={isViewAll ? valueItemAll : valueItemPer}
            placeholder={!isFocus ? t('common:chooseitem') : '...'}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              isViewAll ? setValueItemAll(item) : setValueItemPer(item);
              setIsFocus(false);
            }}
          />
        </View>
        <View style={{ padding: 10 }} onTouchStart={() => setDeleteDevice(false)}>
          <Text style={{ fontSize: 20 }}>{t('common:zones')}</Text>
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
          {isViewAll ? renderByZone(valueItemAll.value) : <ShowByParameter value={values} navigation={navigation} parameter={valueItemPer.value} onRefresh={onRefresh}
           setRefreshing={setRefreshing} zones = {itemAll} infor={infor} selectedPlace={selectedPlace} />}
        </ScrollView>
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
