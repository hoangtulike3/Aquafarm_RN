import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Button, Dimensions, View, useWindowDimensions, Image, TouchableOpacity, Switch } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyPage from './MyPage';
import More from './More';
import Connect from './Connect';

export default Home = ({ navigation, route, props }) => {
  // const { email, username } = route.params;
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen name="MyPage" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{ width: 25, height: 25  }}
              source={require("../images/home.png")}
            />
          ),
        }}
      >
        {() => <MyPage navigation={navigation} infor={route.params.infor} />}
      </Tab.Screen>

      {/* <Tab.Screen name="Home" component={ConnectWifi} /> */}
      <Tab.Screen name="Connect"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{ width: 25, height: 25  }}
              source={require("../images/connect.png")}
            />
          ),
        }}
      >
        {() => <Connect navigation={navigation} infor={route.params.infor} />}
      </Tab.Screen>
      <Tab.Screen name="More"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              style={{ width: 25, height: 25  }}
              source={require("../images/more.png")}
            />
          ),
        }}
      >
        {() => <More navigation={navigation} infor={route.params.infor} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    zIndex: 1,
  },
});
