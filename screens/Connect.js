
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
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Platform,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import RNBluetoothClassic, {
  BluetoothEventType,
  BluetoothDevice,
} from "react-native-bluetooth-classic";
import { Dropdown } from 'react-native-element-dropdown';
import { BleManager } from 'react-native-ble-plx';
// import { LineChart } from "react-native-chart-kit";

export const manager = new BleManager();

export default Connect = ({ navigation, route, infor }) => {
  const [list, setList] = useState([]);
  const [deviceConnected, setDeviceConnected] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [showData, setShowData] = useState([]);
  const [newestData, setNewestData] = useState([0, 0, 0, 0, 0]);
  const [isgetData, setGetData] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const connectBluetooth = async () => {
    try {
      // const list = await RNBluetoothClassic.list();
      // console.log("list:", list)
      const available = await RNBluetoothClassic.isBluetoothAvailable();
      console.log("Available:", available);
      var paired = await RNBluetoothClassic.getBondedDevices();
      setList(paired);
      console.log("Paired:", paired);
      // setState({ available });
    } catch (err) {
      // Handle accordingly
      console.log(err);
        const btState = await manager.state()
        // test is bluetooth is supported
        if (btState==="Unsupported") {
          Alert("Bluetooth is not supported");
          // return (false);
        }
        // enable if it is not powered on
        if (btState!=="PoweredOn") {
          await manager.enable();
        } else {
          await manager.disable();
        }
        // return (true);
    }
  }

  const connectDevice = async (item) => {
    try {
      setShowData([]);
      console.log("Connecting to device:", item._nativeDevice.name);
      const device = await RNBluetoothClassic.connectToDevice(item._nativeDevice.address);
      console.log("ConnectedToDevice:", device);
      const connected = await RNBluetoothClassic.getConnectedDevices();
      setDeviceConnected(item);
      setConnected(true);
      console.log("getConnectedDevices:", connected);
      var writedata = await RNBluetoothClassic.writeToDevice(item._nativeDevice.address,"Da ket noi")
      console.log("writedata:", writedata);
      // do {
      //   var data = await RNBluetoothClassic.readFromDevice(item._nativeDevice.address);
      //   if (data != null)
      //   {
      //     console.log("data:", data);
      //     setShowData([...showData, data]);
      //   }
      // } while (await RNBluetoothClassic.getConnectedDevice(item._nativeDevice.address))
    } catch (err) {
      console.log(err);
      setConnected(false);
    }
  }
  const sendPress = async (device, text) => {
    try {
      var writedata = await RNBluetoothClassic.writeToDevice(device._nativeDevice.address, text);
      console.log("writedata: '" + text + "' -", writedata);
    } catch (err) {
      console.log(err);
    }
  }

  const getListOfDevice = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/device/'+ infor.email, {
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
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  }
  const postDataOfDevice = async (rtd, d_o, ph, nh4, ec) => {
    if(items != null)
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
          "dev_eui" : value,
          "device_name" : value,
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
              "Thông tin",
              "Đã gửi dữ liệu thành công.",
              [
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ]
            );
          }
          else
          {
            Alert.alert(
              "Thông tin",
              "Gửi dữ liệu không thành công.",
              [
                { text: "OK", onPress: () => console.log("OK Pressed") }
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
        "Warning",
        "Vui lòng chọn Item để gửi.",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );
    }
  }

  useEffect(() => {
    // console.log("Get new data ----");
    async function getData() {
      try
      {
        var data = await RNBluetoothClassic.readFromDevice(deviceConnected._nativeDevice.address);
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
                "Warning",
                "Pin yếu. Vui lòng sạc thiết bị để sử dụng.",
                [
                  { text: "OK", onPress: () => console.log("OK Pressed") }
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
    };
    
    getData();
  },[isgetData, deviceConnected])

  useEffect(() => {
    // console.log("Reset UI");
    console.log(showData);
    console.log("items", items);
  }, [isConnected, deviceConnected, showData])
  useEffect(() => {
    getListOfDevice();
  }, [isConnected])

  const renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => connectDevice(item) }>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item._nativeDevice.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item._nativeDevice.rssi}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item._nativeDevice.address}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            
            <View style={{margin: 10}}>
            {
              isConnected ? (
                <Button 
                  title={'Disconnect Device'}
                  onPress={() => {
                    RNBluetoothClassic.disconnectFromDevice(deviceConnected._nativeDevice.address);
                    setDeviceConnected(null);
                    setConnected(false);
                  } } 
                /> 
              ) : (
                <Button 
                  title={'Scan Bluetooth '}
                  onPress={() => connectBluetooth() } 
                />  
              )
            }
            </View>

            {/* <View style={{margin: 10}}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected() } />
            </View> */}

            {(list.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>Please scan to list device</Text>
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
                  placeholder={!isFocus ? 'Select item' : '...'}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>
              <View style={{ width: "100%", height: "100%", position: "absolute", top: 50 }}>
                <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
                  <View style={{ backgroundColor: "#8CCCFB", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>Nhiệt độ</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[0]}</Text>
                  </View>
                  <View style={{ backgroundColor: "#BEC477", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>Oxy hoà tan</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[1]}</Text>
                  </View>
                </View>
                <View style={{ flexDirection:'row', width: "100%", height: "20%" }}>
                  <View style={{ backgroundColor: "#E87AE1", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>Độ pH</Text>
                    <Text style={{ textAlign: "center", color: "#FFFFFF", fontSize: 40 }}>{newestData[2]}</Text>
                  </View>
                  <View style={{ backgroundColor: "#8CCC00", width: "50%", borderColor: "#FFFFFF", borderWidth: 1 }}>
                    <Text style={{ textAlign: "center" }}>Nh4+ trong nước</Text>
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
                onPress={() => sendPress(deviceConnected, "GET\r\n")}>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>GET DATA FROM DEVICE</Text>
                </TouchableHighlight>
              </View>
              <View style={{ position: "absolute", flexDirection: "row", bottom: 0, left: 0, backgroundColor: "#ffffff", 
              width: "100%", height: 50, paddingLeft: 10, paddingRight: 10 }}>
                {/* Gửi dữ liệu qua bluetooth <TextInput
                  style={{ flex:1 }}
                  onChangeText={onTypedText}
                  value={typedText}
                  placeholder="Type text here"
                  // keyboardType="numeric"
                />
                <Button style={{ flex:2, width: 50 }} title="Send" onPress={ () => sendPress(deviceConnected, typedText)}/> */}

                {/* <TextInput
                  editable={!isSet}
                  style={{ flex: 1 }}
                  onChangeText={onTypedText}
                  value={typedText}
                  placeholder="Type dev_eui here"
                  // keyboardType="numeric"
                  
                />
                {
                  isSet ?
                  <Button style={{ flex: 2, width: 50 }} title="  UNSET  " onPress={() => setSet(false)}/>
                  :
                  <Button style={{ flex: 2, width: 50 }} title="  SET  " onPress={() => setSet(true)}/>
                } */}
                
                <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
                justifyContent: "center", borderRadius: 10 }} 
                onPress={() => postDataOfDevice(newestData[0], newestData[1], newestData[2], newestData[3], newestData[4])}>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>SEND DATA TO CLOUD</Text>
                </TouchableHighlight>
              </View>
            </View>
          ) : (
            <FlatList
              style={{ flex: 2 }}
              data={list}
              renderItem={({ item }) => renderItem(item) }
              keyExtractor={item => item.id}
            />   
          )
        }
      </SafeAreaView>
    </View>
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
    backgroundColor: Colors.white,
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
});