
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
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeEventEmitter,
  TouchableOpacity,
  Image,
  FlatList,
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

export default AddBle = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [devices, setDevices] = useState([]);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [bluetoothAllowed, setBluetoothAllowed] = useState(false);
  const [QRvalue, setQRvalue] = useState(null);

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

  const connectDevice = async (item) => {
    try {
      _BleManager.stopDeviceScan();
      console.log("Connecting to device:", item?.name);
      route.params.setConnectedDeviceList([...route.params.connectedDeviceList, item])
      navigation.navigate('Things');
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    RNBleManager.start({showAlert: false});

    new NativeEventEmitter().addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    new NativeEventEmitter().addListener('BleManagerStopScan', handleStopScan );

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

  useEffect(() => {
    console.log("QR:", QRvalue)
    if(QRvalue)
      connectDevice({
        id: QRvalue?.split("/")[0], 
        name: QRvalue?.split("/")[1]
      })
  }, [QRvalue])

  const renderItem = (item) => {
    return (
      <TouchableHighlight onPress={() => connectDevice(item) } style={{ borderWidth: 1, borderBlockColor: "#000000", marginBottom: 10 }}>
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
        <Text style={{ fontSize: 20, paddingLeft: 10 }}>{t('common:addabledevice')}</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 10, right: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  {
            navigation.navigate('Things')
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
        >
          <View style={styles.body}>
            <View style={{margin: 10}}>
            {
              <View>
                <TouchableOpacity
                  style={{ minWidth: 240, minHeight: 35, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#0088ff", borderRadius: 10 }}
                  // title={'디바이스 찾기 ' + (isScanning ? '(찾는 중...)' : "")}
                  onPress={() => startScan() }
                >
                  <Text>{t('common:scanble') + ' ' + (isScanning ? '(' + t('common:scanning') + '...)' : "")}</Text>
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
              </View>
            }
            </View>

            {(devices.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>{t('common:scantoshowble')}</Text>
              </View>
            }
          
          </View>              
        </ScrollView>
        <FlatList
          style={{ flex: 2 }}
          data={devices}
          renderItem={({ item }) => renderItem(item) }
          keyExtractor={item => item.id}
        />
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
