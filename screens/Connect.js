
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
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import RNBluetoothClassic, {
  BluetoothEventType,
  BluetoothDevice,
} from "react-native-bluetooth-classic";

const Connect = () => {
  const [list, setList] = useState([]);
  const [deviceConnected, setDeviceConnected] = useState([]);
  const [isConnected, setConnected] = useState(false);
  const [typedText, onTypedText] = useState(null);
  const [data, setdata] = useState("No data");

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
    }
  }

  const connectDevice = async (item) => {
    try {
      console.log("Connecting to device:", item._nativeDevice.name);
      const device = await RNBluetoothClassic.connectToDevice(item._nativeDevice.address);
      console.log("ConnectedToDevice:", device);
      const connected = await RNBluetoothClassic.getConnectedDevices();
      setDeviceConnected(item);
      setConnected(true);
      console.log("getConnectedDevices:", connected);
      var writedata = await RNBluetoothClassic.writeToDevice(item._nativeDevice.address,"Da ket noi")
      console.log("writedata:", writedata);
      do {
        var data = await RNBluetoothClassic.readFromDevice(item._nativeDevice.address);
        if (data != null)
        {
          console.log("data:", data);
          setdata(data);
        }
      } while (await RNBluetoothClassic.getConnectedDevice(item._nativeDevice.address))
    } catch (err) {
      console.log(err);
      setConnected(false);
    }
  }
  const sendPress = async (device, text) => {
    try {
      var writedata = await RNBluetoothClassic.writeToDevice(device._nativeDevice.address, text)
      onTypedText(null);
      console.log("writedata:", writedata);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    console.log("Reset UI");
  }, [isConnected, deviceConnected])

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
            <View style={{ flex: 2, backgroundColor: "#ffdada", width: "100%", height: "100%" }}>
              <Text style={{textAlign: 'left'}}>{data}</Text>
              <View style={{ position: "absolute", flexDirection:'row', bottom: 0, left: 0, backgroundColor: "#ffffff", width: "100%", height: 50 }}>
                <TextInput
                  style={{ flex:1 }}
                  onChangeText={onTypedText}
                  value={typedText}
                  placeholder="Type text here"
                  // keyboardType="numeric"
                />
                <Button style={{ flex:2, width: 50 }} title="Send" onPress={ () => sendPress(deviceConnected, typedText)}/>
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
});

export default Connect;