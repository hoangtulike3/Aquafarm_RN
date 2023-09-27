import AsyncStorage from '@react-native-async-storage/async-storage';
// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert, PermissionsAndroid } from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

export default Login = ({ navigation, route }) => {
  const [falseLogin, setFalseLogin] = useState(false);
  const [email, onChangeEmail] = useState(null);
  const [password, onChangePassword] = useState(null);
  const [finishRequestPermission, setFinishRequestPermission] = useState(false);
  const [isLanguageShow, setLanguageShow] = useState("en");

  const { t, i18n } = useTranslation();

  const setLanguage = code => {
    return i18n.changeLanguage(code);
  };

  const requestPermission = async () => {
    try {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission ACCESS_FINE_LOCATION is OK");
          setFinishRequestPermission(!finishRequestPermission);
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept ACCESS_FINE_LOCATION");
              setFinishRequestPermission(!finishRequestPermission);
            } else {
              console.log("User refuse ACCESS_FINE_LOCATION");
              setFinishRequestPermission(!finishRequestPermission);
            }
          });
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const requestPermission2 = async () => {
    try {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT).then((result) => {
        if (result) {
          console.log("Permission BLUETOOTH_CONNECT is OK");
        } else {
          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT).then((result) => {
            if (result) {
              console.log("User accept BLUETOOTH_CONNECT");
            } else {
              console.log("User refuse BLUETOOTH_CONNECT");
            }
          });
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const getToken = () => {
    fetch('http://35.79.124.43:3000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email != null ? email.replace(/ /g, '') : email,
        "password": password
      })
    })
      .then((response) => response.json())
      .then( async (json) => {
        console.log(json);
        // setToken(json.token);
        try {
          await AsyncStorage.removeItem('token');
          // await AsyncStorage.removeItem('email');
          // await AsyncStorage.removeItem('username');
        } catch (e) {
          console.log(e);
        }
        try {
          await AsyncStorage.setItem('token', json.token);
          // await AsyncStorage.setItem('email', email.replace(/ /g, ''));
          // await AsyncStorage.setItem('username', json.name);
          setFalseLogin(false);
          navigation.navigate('Home', {
            infor: {
              email: email.replace(/ /g, ''),
              username: json.name
            }
          });
          onChangeEmail(null);
          onChangePassword(null);
        } catch (e) {
          console.log(e);
          setFalseLogin(true);
        }
        
      })
      .catch((error) => {
        console.error(error);
        Alert.alert(
          "연결 오류",
          "인터넷 연결을 활성화하십시오.",
          [
            { text: "동의하다", onPress: () => console.log("OK Pressed") }
          ]
        );
        // setFalseLogin(true);
      });
  }

  const returnImgLanguage = (lang) => {
    switch (lang) {
      case "en":
        return <Image source={require('../images/englishLanguage.png')} style={{ height: 30, width: 30 }}/>
      case "kr":
        return <Image source={require('../images/koreaLanguage.png')} style={{ height: 30, width: 30 }}/>
      case "vi":
        return <Image source={require('../images/vietnamLanguage.png')} style={{ height: 30, width: 30 }}/>
    }
  }

  useEffect(() => {
    requestPermission();
  },[])
  useEffect(() => {
    AsyncStorage.getItem('user-language', (err, language) => {
      // if error fetching stored data or no language was stored
      // display errors when in DEV mode as console statements
      if (err || !language) {
        if (err) {
          console.log('Error fetching Languages from asyncstorage ', err);
        } else {
          console.log('No language is set, choosing English as fallback');
        }
      }
      console.log("Language: ", language)
      setLanguageShow(language);
    });
  },[])
  useEffect(() => {
    setTimeout(() => { 
      requestPermission2();
    }, 3000);
  },[finishRequestPermission])

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity style={{ width: 40, height: 40, alignSelf: "center", alignItems: "center", justifyContent: "center", position: "absolute", top: 10, right: 10 }} >
            <Menu>
              <MenuTrigger>
                {returnImgLanguage(isLanguageShow)}
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={{ width:120 }}>
                <MenuOption onSelect={() => {
                  setLanguage("en");
                  setLanguageShow("en");
                }}>
                  <View style={{ flexDirection: "row" }}>
                    <Image source={require('../images/englishLanguage.png')} style={{ height: 30, width: 30, alignSelf: "center" }} />
                    <Text style={{ alignSelf: "center" }}>English</Text>
                  </View>
                </MenuOption>
                {/* <MenuOption onSelect={() => setLanguage("en")} text='English' /> */}
                <MenuOption onSelect={() => {
                  setLanguage("kr")
                  setLanguageShow("kr");
                }}>
                  <View style={{ flexDirection: "row" }}>
                  <Image source={require('../images/koreaLanguage.png')} style={{ height: 30, width: 30, alignSelf: "center" }} />
                    <Text style={{ alignSelf: "center" }}>Korean</Text>
                  </View>
                </MenuOption>
                {/* <MenuOption onSelect={() => setLanguage("kr")} text='Korean' /> */}
                <MenuOption onSelect={() => {
                  setLanguage("vi")
                  setLanguageShow("vi");
                }}>
                  <View style={{ flexDirection: "row" }}>
                  <Image source={require('../images/vietnamLanguage.png')} style={{ height: 30, width: 30, alignSelf: "center" }} />
                    <Text style={{ alignSelf: "center" }}>Vietnamese</Text>
                  </View>
                </MenuOption>
                {/* <MenuOption onSelect={() => setLanguage("vi")} text='Vietnamese' /> */}
              </MenuOptions>
            </Menu>
          </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold", alignSelf: "center", marginBottom:50 }}>Aquafarm</Text>
      </View>
      <View style={{ flex: 3 }}>
        <Image source={require('../images/shrimp.png')} style={{ height: 100, width: 150, alignSelf: "center" }} />
        <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>{t('common:login')}</Text>
        <TextInput
          style={{ borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
          onChangeText={onChangeEmail}
          value={email}
          placeholder={t('common:email')}
        />
        <TextInput
          style={{ borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
          onChangeText={onChangePassword}
          value={password}
          placeholder={t('common:password')}
          secureTextEntry={true}
        />
        <TouchableOpacity
        style={{ padding: 10, backgroundColor: "#dddddd", alignItems: "center", margin: 10 }}
        onPress = {() => getToken()}
        >
          <Text>{t('common:login')}</Text>
        </TouchableOpacity>
        {falseLogin && <Text style={{ color: "#FF000B", alignSelf: "center" }}>{t('common:loginfail')}</Text>}
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
});
