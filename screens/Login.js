import AsyncStorage from '@react-native-async-storage/async-storage';
// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, Dimensions, View, ScrollView, TextInput, Image, TouchableOpacity, Switch, Linking } from 'react-native';

export default Login = ({ navigation, route }) => {
  // const [token, setToken] = useState(null);
  const [falseLogin, setFalseLogin] = useState(false);
  const [email, onChangeEmail] = useState(null);
  const [password, onChangePassword] = useState(null);

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
        setFalseLogin(true);
      });
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold", alignSelf: "center", marginBottom:50 }}>Aquafarm</Text>
      </View>
      <View style={{ flex: 3 }}>
        <Image source={require('../images/shrimp.png')} style={{ height: 100, width: 150, alignSelf: "center" }} />
        <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: "bold", alignSelf: "center" }}>Login</Text>
        <TextInput
          style={{ borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
          onChangeText={onChangeEmail}
          value={email}
          placeholder="Email"
        />
        <TextInput
          style={{ borderColor: "#000000", borderWidth: 1, margin: 5, padding: 10, borderRadius: 5 }}
          onChangeText={onChangePassword}
          value={password}
          placeholder="Type your password"
          secureTextEntry={true}
        />
        <TouchableOpacity
        style={{ padding: 10, backgroundColor: "#dddddd", alignItems: "center", margin: 10 }}
        onPress = {() => getToken()}
        >
          <Text>Login</Text>
        </TouchableOpacity>
        {falseLogin && <Text style={{ color: "#FF000B", alignSelf: "center" }}> Email or password wrong! </Text>}
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
