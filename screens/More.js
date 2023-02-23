import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TouchableOpacity, Image, Alert } from 'react-native';

export default More = ({ navigation, route, infor }) => {
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
        <Text style={{ fontSize: 30, marginBottom: 10, fontWeight: "bold" }}>More</Text>
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
                "About this application",
                "This application is made by MANGROVESYSTEM\n\n Version: 1.0.0",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
              );
            }}
            >
              <Image source={require('../images/my-info.png')} style={{ width: 20, height: 20, marginRight: 10 }}/>
              <Text>App info</Text>
              <View style={{ position: "absolute", right: 0, marginRight: 10 }}>
                <Image source={require('../images/info.png')} style={{ width: 15, height: 15 }}/>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={{ marginBottom: 10, color: "#bababa" }}>Change my status</Text>
        </View>
      </View>
      <Button title='Log out' onPress={() => logout()}/>
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
