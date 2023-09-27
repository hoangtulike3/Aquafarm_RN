
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from "buffer";
import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  RefreshControl,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
  TouchableHighlight,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { Dropdown } from 'react-native-element-dropdown';
import { 
  BleManager,
} from 'react-native-ble-plx';
import RNBleManager from 'react-native-ble-manager';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';

// const BleManagerModule = NativeModules.RNBleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const bleManagerEmitter = new NativeEventEmitter();

export const _BleManager = new BleManager();

export default Connect_Screen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [devices, setDevices] = useState([]);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [bluetoothAllowed, setBluetoothAllowed] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [QRvalue, setQRvalue] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [showData, setShowData] = useState([]);
  const [newestData, setNewestData] = useState([0, 0, 0, 0, 0]);
  const [isgetData, setGetData] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  // const [serviceUUID, setServiceUUID] = useState(null);
  // const [characteristicMonitor, setCharacteristicMonitor] = useState(null);
  // const [characteristicWrite, setCharacteristicWrite] = useState(null);

  const startScan = async () => {
    const btState = await _BleManager.state()
      if (btState!=="PoweredOn") {
        await _BleManager.enable();
      }
    if (!isScanning) {
      RNBleManager.scan([], 10, true).then((results) => {
        console.log('Scanning...');
        setIsScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (peripheral.name) {
      peripherals.set(peripheral.id, peripheral);
      setDevices(Array.from(peripherals.values()));
      // console.log(Buffer(peripheral.advertising.manufacturerData.bytes).toString("utf8").replace(/ /g, ' ', "�", "@"));
    }
  }

  useEffect(() => {
    RNBleManager.start({showAlert: false});

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );

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

    // return (() => {
    //   console.log('unmount');
    //   bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    //   bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan );
    // })
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

  const connectDevice = async (item) => {
    try {
      setShowData([]);
      _BleManager.stopDeviceScan();
      console.log("Connecting to device:", item?.name);
      const NewConnectedDevice = await _BleManager.connectToDevice(item.id)
      setConnectedDevice(NewConnectedDevice);
      route.params.setConnectedDeviceList([route.params.connectedDeviceList, NewConnectedDevice])
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

  // const decodeCharacteristicValueToString = (value) => {
  //   return Buffer.from(value, "base64").toString();
  // };
  
  // const decodeCharacteristicValueToDecimal = (value) => {
  //   return parseInt(Buffer.from(value, "base64").toString("hex"), 10);
  // };
  
  const encodeStringToBase64 = (value) => {
    console.log(Buffer.from(value).toString("base64"));
    return Buffer.from(value).toString("base64");
  };

  // const readCharacteristic = async () => {
  //   try {
  //     const modelNumberCharacteristic = await NewConnectedDevice.readCharacteristicForService(
  //       HEART_RATE_SERVICE_UUIDS[HEART_RATE_SERVICES.DEVICE_INFO],
  //       DEVICE_INFO_SERVICE_CHARS.MODEL_NUMBER
  //     );
  //     console.log(
  //       decodeCharacteristicValueToString(modelNumberCharacteristic.value)
  //     );
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };

  // const monitorCharacteristic = () => {
  //   try {
  //     connectedDevice.monitorCharacteristicForService(
  //       "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", // service ID
  //       "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", // characteristic ID
  //       (error, characteristic) => {
  //         console.log(
  //           Buffer.from(characteristic.value, "base64").toString("utf8")
  //         );
  //         // setHeartRateMeasurement(
  //         //   Buffer.from(characteristic.value, "base64").toString("utf8")
  //         // );
  //       }
  //     );
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // };

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

  const getListOfDevice = async () => {
    console.log(QRvalue)
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/device/'+ route.params.infor.email, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("getListOfDevice", json);
        var ListDevice = [];
        json.forEach(element => {
          ListDevice.push({
            label: element.device_name,
            value: element.dev_eui
          })
        });
        setItems(ListDevice);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error(error);
        setRefreshing(false);
        // navigation.navigate('Login');
      });
  }
  const postDataOfDevice = async (rtd, d_o, ph, nh4, ec) => {
    if(value != null)
    {
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
          "dev_eui" : value.value,
          "device_name" : value.label,
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
          console.log(json);
          if(json)
          {
            Alert.alert(
              "정보",
              "데이터가 성공적으로 전송되었습니다.",
              [
                { text: "좋아요", onPress: () => console.log("OK Pressed") }
              ]
            );
          }
          else
          {
            Alert.alert(
              "정보",
              "데이터 전송에 실패했습니다.",
              [
                { text: "좋아요", onPress: () => console.log("OK Pressed") }
              ]
            );
          }
        })
        .catch((error) => {
          console.error(error);
          // navigation.navigate('Login');
      });
    }
    else
    {
      Alert.alert(
        "경고",
        "보낼 항목을 선택하세요.",
        [
          { text: "좋아요", onPress: () => console.log("OK Pressed") }
        ]
      );
    }
  }

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
    console.log("items", items);
  }, [isConnected, connectedDevice, showData])
  useEffect(() => {
    getListOfDevice();
    setNewestData([0,0,0,0,0])
  }, [isConnected])
  useEffect(() => {
    console.log("QR:", QRvalue)
    if(QRvalue)
    connectDevice({id: QRvalue})
  }, [QRvalue])

  const renderItem = (item) => {
    return (
      <TouchableHighlight onPress={() => connectDevice(item) }>
        <View style={styles.row}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>Device: {item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>Model: {Buffer(item.advertising.manufacturerData.bytes).toString("utf8").split(item.name)[0].replace(/[�`~!@#$%^&*()_|+\-=?; \n\t@:'",.<>\{\}\[\]\\\/]/gi ,"")}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>Signal Strength: {item.rssi}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    ( locationAllowed && bluetoothAllowed ? 
      
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", height: 50, paddingTop: 10, backgroundColor: "#ffffff" }}>
        <Text style={{ fontSize: 20, paddingLeft: 10 }}>Add a BLE device</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 10, right: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  {
            connectedDevice && _BleManager.cancelDeviceConnection(connectedDevice.id)
            console.log("Disconnected device.")
            setQRvalue(null);
            setConnected(false);
            navigation.navigate('연결')
          }}
        >
          <Image source={require("../images/closeIcon.png")} style={{ width: 20, height: 20 }}/>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={getListOfDevice}
            />
          }
        >
          <View style={styles.body}>
            
            <View style={{margin: 10}}>
            {
              isConnected ? (
                <Button 
                  title={'디바이스 연결 해제'}
                  onPress={() => {
                    _BleManager.cancelDeviceConnection(connectedDevice.id)
                    console.log("Disconnected device.")
                    setQRvalue(null);
                    setConnected(false);
                  } } 
                /> 
              ) : (
                // <Button 
                //   title={'Scan Bluetooth '}
                //   onPress={() => connectBluetooth() } 
                // />  
                <View>
                  <TouchableOpacity
                    style={{ minWidth: 240, minHeight: 35, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#0088ff", borderRadius: 10 }}
                    // title={'디바이스 찾기 ' + (isScanning ? '(찾는 중...)' : "")}
                    onPress={() => startScan() }
                  >
                    <Text>{'디바이스 찾기 ' + (isScanning ? '(찾는 중...)' : "")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 25, height: 25, position: "absolute", right: 0, top: 5, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}
                    onPress={() => {
                      console.log("Scan QR");
                      navigation.navigate('ScanQR', {
                        setQRvalue: setQRvalue
                      })
                    }}
                  >
                    <Image
                      style={{ width: 20, height: 20  }}
                      source={require("../images/qrcode.png")}
                    />
                  </TouchableOpacity>
                  {/* <QRCodeScanner
                    onRead={this.onSuccess}
                    topContent={
                      <Text style={styles.centerText}>
                        Go to{' '}
                        <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
                        your computer and scan the QR code.
                      </Text>
                    }
                    bottomContent={
                      <TouchableOpacity style={styles.buttonTouchable}>
                        <Text style={styles.buttonText}>OK. Got it!</Text>
                      </TouchableOpacity>
                    }
                  />
                {useCamera()} */}
                </View>
              )
            }
            </View>

            {/* <View style={{margin: 10}}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected() } />
            </View> */}

            {(devices.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>장치 목록을 표시하려면 스캔하십시오</Text>
              </View>
            }
          
          </View>              
        </ScrollView>
        {
          isConnected ? ( 
            <View style={{ flex: 1, backgroundColor: "#FFFFFF", width: "100%", height: "100%" }}>
              <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
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
              </View>
              <View style={{ width: "100%", height: "100%", position: "absolute", top: 50 }}>
                <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
                  <View style={{ backgroundColor: "#8CCCFB", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>온도</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[0]}</Text>
                  </View>
                  <View style={{ backgroundColor: "#BEC477", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>산소</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[1]}</Text>
                  </View>
                </View>
                <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
                  <View style={{ backgroundColor: "#E87AE1", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>pH</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[2]}</Text>
                  </View>
                  <View style={{ backgroundColor: "#8CCC00", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>아모니아</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[3]}</Text>
                  </View>
                </View>
                {/* <ScrollView style={{ marginBottom: 50 }}>
                  {showData && showData.map((item, key) => (
                    <Text style={{textAlign: 'left'}} key ={key}>{item}</Text>
                  ))}
                </ScrollView> */}
              </View>

              
              <View style={{ position: "absolute", flexDirection: "row", bottom: 55, left: 0, backgroundColor: "#ffffff", 
              width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
                <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
                justifyContent: "center", borderRadius: 10 }} 
                onPress={() => writeCharacteristic("GET\r\n")}>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>센서에서 데이터 얻기</Text>
                </TouchableHighlight>
              </View>
              <View style={{ position: "absolute", flexDirection: "row", bottom: 0, left: 0, backgroundColor: "#ffffff", 
              width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
                
                <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
                justifyContent: "center", borderRadius: 10 }} 
                onPress={() => postDataOfDevice(newestData[0], newestData[1], newestData[2], newestData[3], newestData[4])}>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>클라우드로 데이터 보내기</Text>
                </TouchableHighlight>
              </View>
            </View>
          ) : (
            <FlatList
              style={{ flex: 2 }}
              data={devices}
              renderItem={({ item }) => renderItem(item) }
              keyExtractor={item => item.id}
            />
          )
        }
      </SafeAreaView>
    </View>
    : 
    <View style={{ padding: 20 }}>
      <Text>블루투스 및 위치 사용권이 필요합니다. 사용권을 제공해주시고 다시 시작해주시길 바랍니다.</Text>
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
