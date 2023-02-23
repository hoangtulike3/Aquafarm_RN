import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home'
// import ConnectWifi from './screens/ConnectWifi'
import AddDevice from './screens/AddDevice'
import Chart from './screens/Chart'
import TableData from './screens/TableData'
import Login from './screens/Login'
// import Maps from './screens/Maps'

const Stack = createNativeStackNavigator();

const App = () => {
return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="Home"
          component={Home}
          // options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="AddDevice" component={AddDevice} />
        <Stack.Screen name="Chart" component={Chart} />
        <Stack.Screen name="TableData" component={TableData} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;