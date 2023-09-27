
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import { Buffer } from "buffer";
import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { 
  BleManager,
} from 'react-native-ble-plx';
import RNBleManager from 'react-native-ble-manager';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

export const _BleManager = new BleManager();

export default Connect = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [bluetoothAllowed, setBluetoothAllowed] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [showData, setShowData] = useState([]);
  const [newestData, setNewestData] = useState([0, 0, 0, 0, 0]);
  const [newestTime, setNewestTime] = useState(new Date().toLocaleString());
  const [isgetData, setGetData] = useState(false);

  useEffect(() => {
    RNBleManager.start({showAlert: false});

    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
      if (result) {
        console.log("Permission ACCESS_FINE_LOCATION is OK");
        setLocationAllowed(true);
      } else {
        console.log("Permission ACCESS_FINE_LOCATION is FAIL");
        setLocationAllowed(false);
      }
    });

    // console.log("Platform.Version: ", Platform.Version)
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then((result) => {
        if (result) {
          console.log("Permission BLUETOOTH_SCAN is OK");
          setBluetoothAllowed(true);
        } else {
          console.log("Permission BLUETOOTH_SCAN is FAIL");
          setBluetoothAllowed(false);
        }
      });
    } else
    {
      setBluetoothAllowed(true);
    }

    return (() => {
      console.log('unmount');
    })
  }, []);

  useEffect(() => {
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
      interval: 10000,
      fastInterval: 5000,
    })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  },[])

  const connectDevice = async () => {
    try {
      setShowData([]);
      _BleManager.stopDeviceScan();
      console.log("Connecting to device:", route.params.value.id);
      const NewConnectedDevice = await _BleManager.connectToDevice(route.params.value.id)
      setConnectedDevice(NewConnectedDevice);
      console.log("NewConnectedDevice:", NewConnectedDevice)
      setConnected(true);

      await NewConnectedDevice.discoverAllServicesAndCharacteristics();

      await NewConnectedDevice.requestMTU(50);

      // const services = await NewConnectedDevice.services()
      // console.log(services);
      // const characteristics = await services[2].characteristics();
      // console.log(characteristics);
      // characteristics.forEach(element => {
      //   if(element.isWritableWithResponse == true)
      //   {
      //     setCharacteristicMonitor(element.uuid);
      //   }
      //   if(element.isNotifiable == true)
      //   {
      //     setCharacteristicWrite(element.uuid);
      //   }
      // });

      NewConnectedDevice.monitorCharacteristicForService(
        "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", // service ID
        "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", // characteristic ID
        (error, characteristic) => {
          if(characteristic)
          {
            console.log(
              Buffer.from(characteristic.value, "base64").toString("utf8")
            );
            getData(Buffer.from(characteristic.value, "base64").toString("utf8"));
          }
        }
      );

    } catch (err) {
      console.log(err);
      setConnected(false);
    }
  }
  
  const encodeStringToBase64 = (value) => {
    console.log(Buffer.from(value).toString("base64"));
    return Buffer.from(value).toString("base64");
  };

  const writeCharacteristic = async (data) => {
      try {
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
          "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
          encodeStringToBase64(data)
        );
      } catch (error) {
        throw new Error(error);
      }
    };

  // const getListOfDevice = async () => {
  //   console.log(QRvalue)
  //   const TokenValue = await AsyncStorage.getItem("token");
  //   fetch('http://35.79.124.43:3000/device/'+ route.params.infor.email, {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization': 'Bearer ' + TokenValue
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((json) => {
  //       console.log("getListOfDevice", json);
  //       var ListDevice = [];
  //       json.forEach(element => {
  //         ListDevice.push({
  //           label: element.device_name,
  //           value: element.dev_eui
  //         })
  //       });
  //       setItems(ListDevice);
  //       setRefreshing(false);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       setRefreshing(false);
  //       // navigation.navigate('Login');
  //     });
  // }
  // const postDataOfDevice = async (rtd, d_o, ph, nh4, ec) => {
  //   if(value != null)
  //   {
  //     const TokenValue = await AsyncStorage.getItem("token");
  //     // console.log("Buffer:", Buffer.from("t" + rtd + "/" + "d" + d_o + "/" + "p" + ph + "/" + "n" + nh4).toString("utf8"))
  //     fetch('http://35.79.124.43:3000/id/data', {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer ' + TokenValue
  //       },
  //       body: JSON.stringify({
  //         "dev_eui" : value.value,
  //         "device_name" : value.label,
  //         "application_id" : null,
  //         "application_name" : null,
  //         "data": JSON.stringify(Buffer.from("t" + rtd + "/" + "d" + d_o + "/" + "p" + ph + "/" + "n" + nh4)),
  //         "node_id": null,
  //         "device_id": null,
  //         "d_o": d_o,
  //         "ec" : ec,
  //         "ph": ph,
  //         "rtd": rtd,
  //         "nh4": nh4
  //       })
  //     })
  //       .then((response) => response.json())
  //       .then((json) => {
  //         console.log(json);
  //         if(json)
  //         {
  //           Alert.alert(
  //             "정보",
  //             "데이터가 성공적으로 전송되었습니다.",
  //             [
  //               { text: "좋아요", onPress: () => console.log("OK Pressed") }
  //             ]
  //           );
  //         }
  //         else
  //         {
  //           Alert.alert(
  //             "정보",
  //             "데이터 전송에 실패했습니다.",
  //             [
  //               { text: "좋아요", onPress: () => console.log("OK Pressed") }
  //             ]
  //           );
  //         }
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //         // navigation.navigate('Login');
  //     });
  //   }
  //   else
  //   {
  //     Alert.alert(
  //       "경고",
  //       "보낼 항목을 선택하세요.",
  //       [
  //         { text: "좋아요", onPress: () => console.log("OK Pressed") }
  //       ]
  //     );
  //   }
  // }

  function getData(data) {
    try
    {
      if (data != null)
      {
        console.log("data:", data);
        setShowData([...showData, data]);
        var dataArr = data.split('/');
        var rtd = 0;
        var d_o = 0;
        var ph = 0;
        var nh4 = 0;
        var ec = 0;
        dataArr.forEach(element => {
          if(element[0] == 't')
            rtd = element.slice(1);
          if(element[0] == 'd')
            d_o = element.slice(1);
          if(element[0] == 'p')
            ph = element.slice(1);
          if(element[0] == 'n')
            nh4 = element.slice(1);
          if(element[0] == 'e')
            ec = element.slice(1);
          if(element[0] == 'b' && element[1] == "1")
          {
            Alert.alert(
              "경고",
              "배터리 부족. 기기를 충전하여 사용하세요.",
              [
                { text: "좋아요", onPress: () => console.log("OK Pressed") }
              ]
            );
          }
        });
        setNewestData([rtd, d_o, ph, nh4, ec]);
        setNewestTime(new Date().toLocaleString());
        // if(typedText != null && isSet == true)
        // {
        //   postDataOfDevice(rtd, d_o, ph, nh4, ec);
        // }
      }
      setGetData(!isgetData);
    }
    catch (e)
    {
      console.log(e);
    }
  }

  useEffect(() => {
    console.log("Reset UI");
    console.log(showData);
  }, [isConnected, connectedDevice, showData])
  useEffect(() => {
    setNewestData([0,0,0,0,0])
  }, [isConnected])
  useEffect(() => {
    connectDevice();
  }, [])

  return (
    ( locationAllowed && bluetoothAllowed ? 
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", height: 50, paddingTop: 10, backgroundColor: "#ffffff" }}>
        <TouchableOpacity style={{ width: 30, height: 30, marginLeft: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  {
            connectedDevice && _BleManager.cancelDeviceConnection(connectedDevice.id)
            console.log("Disconnected device.")
            setConnected(false);
            navigation.navigate('Things')
          }}
        >
          <Image source={require("../images/backIcon.png")} style={{ width: 40, height: 40 }}/>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, paddingLeft: 10 }}>{route.params.value.name}</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 10, right: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  {
            connectedDevice && _BleManager.cancelDeviceConnection(connectedDevice.id)
            console.log("Disconnected device.")
            setConnected(false);
            navigation.navigate('Things')
          }}
        >
          <Image source={require("../images/closeIcon.png")} style={{ width: 30, height: 30 }}/>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF", width: "100%", height: "100%" }}>
          <View style={{ flexDirection: "row", backgroundColor: "#ffffff", 
            width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
            <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
            justifyContent: "center", borderRadius: 10 }} 
            onPress={() => writeCharacteristic("GET\r\n")}>
              <Text style={{ color: "#ffffff", fontSize: 20 }}>{t('common:readaquasensor')}</Text>
            </TouchableHighlight>
          </View>
          <Text style={{ fontSize: 15, alignSelf: "center", marginVertical: 10 }}>{newestTime}</Text>
          {/* <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={items}
              labelField="label"
              valueField="value"
              value={value}
              placeholder={!isFocus ? '수조 선택' : '...'}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item);
                setIsFocus(false);
              }}
            />
          </View> */}
          <View style={{ width: "100%", height: "100%" }}>
            <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
              <View style={{ backgroundColor: "#8CCCFB", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                <Text style={{ textAlign: "center" }}>{t('common:rtdText')}</Text>
                <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[0]}</Text>
              </View>
              <View style={{ backgroundColor: "#BEC477", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                <Text style={{ textAlign: "center" }}>{t('common:doText')}</Text>
                <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[1]}</Text>
              </View>
            </View>
            <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
              <View style={{ backgroundColor: "#E87AE1", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                <Text style={{ textAlign: "center" }}>{t('common:phText')}</Text>
                <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[2]}</Text>
              </View>
              <View style={{ backgroundColor: "#8CCC00", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                <Text style={{ textAlign: "center" }}>{t('common:nh4Text')}</Text>
                <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[3]}</Text>
              </View>
            </View>
            {/* <ScrollView style={{ marginBottom: 50 }}>
              {showData && showData.map((item, key) => (
                <Text style={{textAlign: 'left'}} key ={key}>{item}</Text>
              ))}
            </ScrollView> */}
          </View>
          
          
          <View style={{ position: "absolute", flexDirection: "row", bottom: 20, left: 0, backgroundColor: "#ffffff", 
          width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
            <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
            justifyContent: "center", borderRadius: 10 }} 
            onPress={() => navigation.navigate('UploadDataToServer', {infor: route.params.infor, newestData: newestData})}>
              <Text style={{ color: "#ffffff", fontSize: 20 }}>{t('common:next')}</Text>
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    </View>
    : 
    <View style={{ padding: 20 }}>
      <Text>{t('common:permissionerr')}</Text>
    </View>
    )
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
    maxHeight: 50,
    flex: 1,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: "#fff",
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
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
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});
