import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import { useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert } from 'react-native';

// import BackgroundService from 'react-native-background-actions';

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).
// const veryIntensiveTask = async (taskDataArguments) => {
//     // Example of an infinite loop task
//     console.log("RUN BEHIND");
// };

// const options = {
//     taskName: 'Get Data',
//     taskTitle: 'Get Data',
//     taskDesc: 'Check values of sensor with Min/Max',
//     taskIcon: {
//         name: 'ic_launcher',
//         type: 'mipmap',
//     },
//     color: '#ff00ff',
//     // linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
//     // parameters: {
//     //     delay: 1000,
//     // },
// };

// const backgroundtask = async () => {
//   await BackgroundService.start(veryIntensiveTask(10000), options);
//   // await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
//   // iOS will also run everything here in the background until .stop() is called
//   // await BackgroundService.stop();
// }

export default More = ({ navigation, route, infor }) => {
  const { t } = useTranslation();
  const getData = async () => {
    try {
      // const value = await AsyncStorage.multiGet(["email", "token"])
      if(infor.email !== null) {
        console.log(infor.email);
      // value previously stored
      }
    } catch(e) {
      console.log(e);
    }
  }

  const logout = async () => { // You were passing a props variable here that was undefined..
    await AsyncStorage.removeItem('token').then(() => {
      navigation.replace('Login');
    });
  };

  useEffect(() => {
    getData();
  },[])
  
  return (
    <View style={styles.container}>
      <View>
        <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold", paddingLeft: 10 }}>    </Text>
      </View>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ alignItems: "center", backgroundColor: "#dedede", width: 75, height: 75, borderRadius: 100 }}>
            <Image source={require('../images/person-avatar.png')} style={{ width: 75, height: 75, borderRadius: 100}} />
            <View style={{ backgroundColor: "#00d015", width: 10, height: 10, borderRadius: 100, position: "absolute", right: 5, bottom: 5 }} />
          </View>
        </TouchableOpacity>
        <View style={{ flex: 2, paddingRight: 20}}>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>{infor.username}</Text>
            {/* <TouchableOpacity style={{ borderRadius: 10, marginLeft: 20, paddingLeft: 10, paddingRight: 10, flexDirection: "row", backgroundColor: "#dedede", alignItems: "center" }} >
              <Image source={require('../images/Wallet.png')} style={{ width: 20, height: 20 }}/>
              <Text style={{ fontSize: 16, fontWeight: "bold", paddingLeft: 5 }}>Wallet</Text>
            </TouchableOpacity> */}
          </View>
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <TouchableOpacity style={{ borderRadius: 5, borderWidth: 1, borderColor: "#dedede", padding: 10, width: "100%", flexDirection: "row", alignItems: "center" }} 
            onPress={() => {
              Alert.alert(
                t('common:appinfor'),
                "MANGROVESYSTEM CO., LTD\n Email: Support@mangrovesystem.com\n Hotline: 0123456789\n\n 버전: 1.0.0.",
                [
                  {
                    text: t('common:cancel'),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: t('common:ok'), onPress: () => {
                    console.log("OK Pressed")
                    // backgroundtask();
                    } 
                  }
                ]
              );
            }}
            >
              <Image source={require('../images/my-info.png')} style={{ width: 20, height: 20, marginRight: 10 }}/>
              <Text>{t('common:appinfor')}</Text>
              <View style={{ position: "absolute", right: 0, marginRight: 10 }}>
                <Image source={require('../images/info.png')} style={{ width: 15, height: 15 }}/>
              </View>
            </TouchableOpacity>
          </View>
          {/* <Text style={{ marginBottom: 10, color: "#bababa" }}>Thay đổi trạng thái hoặt động</Text> */}
        </View>
      </View>
      <Button title={t('common:logout')} onPress={() => logout()}/>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
		width: "100%",
		height: "100%"
  },
});
