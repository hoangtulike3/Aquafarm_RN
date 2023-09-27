
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import { Buffer } from "buffer";
import React, {
  useState,
  useEffect,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  TouchableHighlight,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { Dropdown } from 'react-native-element-dropdown';

export default UploadDataToServer = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [isFocusPlace, setIsFocusPlace] = useState(false);
  const [valuePlace, setValuePlace] = useState(null);
  const [itemsPlace, setItemsPlace] = useState([]);

  const [isFocusFarm, setIsFocusFarm] = useState(false);
  const [valueFarm, setValueFarm] = useState(null);
  const [itemsFarm, setItemsFarm] = useState([]);

  const [isFocusTank, setIsFocusTank] = useState(false);
  const [valueTank, setValueTank] = useState(null);
  const [itemsTank, setItemsTank] = useState([]);

  const getListOfPlace = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/place/'+ route.params.infor.email, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("getListOfPlace", json);
        var ListPlace = [];
        json.forEach(element => {
          ListPlace.push({
            label: element.place_name,
            value: element.place_name
          })
        });
        ListPlace.push({
          label: "Not set location",
          value: "None"
        })
        setItemsPlace(ListPlace);
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  }

  const getListOfFarm = async () => {
    const TokenValue = await AsyncStorage.getItem("token");
    fetch('http://35.79.124.43:3000/farm/'+ valuePlace.label, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + TokenValue
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("getListOfFarm", json);
        var ListFarm = [];
        json.forEach(element => {
          ListFarm.push({
            label: element.farm_name,
            value: element.farm_name
          })
        });
        ListFarm.push({
          label: "Not set location",
          value: "None"
        })
        setItemsFarm(ListFarm);
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  }

  const getListOfTank = async () => {
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
        console.log("getListOfTank", json);
        var ListTank = [];
        json.forEach(element => {
          // if(element.place_name == valuePlace.value && element.farm_name == valueFarm.value)
          // {
          //   ListTank.push({
          //     label: element.device_name,
          //     value: element.dev_eui
          //   })
          // }
          if(valuePlace?.value == "None")
          {
            if(valueFarm?.value =="None")
            {
              if(element.place_name == null && (element.farm_name == null || element.farm_name == "null"))
              {
                ListTank.push({
                  label: element.device_name,
                  value: element.dev_eui
                })
              }
            } else {
              if(element.place_name == null && element.farm_name == valueFarm?.value)
              {
                ListTank.push({
                  label: element.device_name,
                  value: element.dev_eui
                })
              }
            }
          }
          else
          {
            if(valueFarm?.value == "None")
            {
              if(element.place_name == valuePlace?.value && (element.farm_name == null || element.farm_name == "null"))
              {
                ListTank.push({
                  label: element.device_name,
                  value: element.dev_eui
                })
              }
            } else {
              if(element.place_name == valuePlace?.value && element.farm_name == valueFarm?.value)
              {
                ListTank.push({
                  label: element.device_name,
                  value: element.dev_eui
                })
              }
            }
          }

        });
        setItemsTank(ListTank);
      })
      .catch((error) => {
        console.error(error);
        // navigation.navigate('Login');
      });
  }

  const postDataOfDevice = async (rtd, d_o, ph, nh4, ec) => {
    if(valueTank != null)
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
          "dev_eui" : valueTank.value,
          "device_name" : valueTank.label,
          "application_id" : null,
          "application_name" : null,
          "received_by" : route.params.infor.username,
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
              t('common:infor'),
              t('common:messagesuccess'),
              [
                { text: t('common:ok'), onPress: () => console.log("OK Pressed") }
              ]
            );
          }
          else
          {
            Alert.alert(
              t('common:infor'),
              t('common:messagefail'),
              [
                { text: t('common:ok'), onPress: () => console.log("OK Pressed") }
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
        t('common:warning'),
        t('common:messagewarn'),
        [
          { text: t('common:ok'), onPress: () => console.log("OK Pressed") }
        ]
      );
    }
  }

  useEffect(() => {
    getListOfPlace();
  }, [])
  useEffect(() => {
    getListOfFarm();
  }, [valuePlace])
  useEffect(() => {
    getListOfTank();
  }, [valueFarm])

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", height: 50, paddingTop: 10, backgroundColor: "#ffffff" }}>
        <Text style={{ fontSize: 20, paddingLeft: 10 }}>{t('common:chooseaplace')}</Text>
        <TouchableOpacity style={{ width: 30, height: 30, position: "absolute", top: 10, right: 10, alignItems: "center", justifyContent: "center" }}
          onPress={() =>  {
            navigation.goBack();
          }}
        >
          <Image source={require("../images/closeIcon.png")} style={{ width: 20, height: 20 }}/>
        </TouchableOpacity>
      </View>
      <View style={{ width: "100%", height: 50, paddingHorizontal: 10, marginTop: 10 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={itemsPlace}
          labelField="label"
          valueField="value"
          value={valuePlace}
          placeholder={!isFocusPlace ? t('common:place') : '...'}
          onFocus={() => setIsFocusPlace(true)}
          onBlur={() => setIsFocusPlace(false)}
          onChange={item => {
            setValuePlace(item);
            setIsFocusPlace(false);
          }}
        />
      </View>
      <View style={{ width: "100%", height: 50, paddingHorizontal: 10 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={itemsFarm}
          labelField="label"
          valueField="value"
          value={valueFarm}
          placeholder={!isFocusFarm ? t('common:farm') : '...'}
          onFocus={() => setIsFocusFarm(true)}
          onBlur={() => setIsFocusFarm(false)}
          onChange={item => {
            setValueFarm(item);
            setIsFocusFarm(false);
          }}
        />
      </View>
      <View style={{ width: "100%", height: 50, paddingHorizontal: 10 }}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={itemsTank}
          labelField="label"
          valueField="value"
          value={valueTank}
          placeholder={!isFocusTank ? t('common:tank') : '...'}
          onFocus={() => setIsFocusTank(true)}
          onBlur={() => setIsFocusTank(false)}
          onChange={item => {
            setValueTank(item);
            setIsFocusTank(false);
          }}
        />
      </View>
      
        
      <View style={{ flexDirection: "row", backgroundColor: "#ffffff", width: "100%", height: 50, padding: 20 }}>
        <TouchableHighlight style={{ backgroundColor: "#0088ff", width: "100%", height: 50, alignItems: "center", 
        justifyContent: "center", borderRadius: 10 }} 
        onPress={() => postDataOfDevice(route.params.newestData[0],route.params.newestData[1],route.params.newestData[2],route.params.newestData[3],route.params.newestData[4])}>
          <Text style={{ color: "#ffffff", fontSize: 20 }}>{t('common:upload')}</Text>
        </TouchableHighlight>
      </View>
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
