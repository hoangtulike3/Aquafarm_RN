import React, { useState, useEffect } from 'react';
import './IMLocalize';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home'
import { MenuProvider } from 'react-native-popup-menu';
import AddThing from './screens/AddThing'
import AddBle from './screens/AddBle'
import AddDevice from './screens/AddDevice'
import Connect from './screens/Connect'
import UploadDataToServer from './screens/UploadDataToServer'
// import Chart_Screen from './screens/Chart_Screen'
import DeviceController from './screens/DeviceController'
import TableData from './screens/TableData'
import Login from './screens/Login'
import ScanQR from './screens/ScanQR'

const Stack = createNativeStackNavigator();

const App = () => {
return (
    <MenuProvider>
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
          <Stack.Screen name="AddThing" component={AddThing} />
          <Stack.Screen name="AddBle" component={AddBle} />
          <Stack.Screen name="AddDevice" component={AddDevice} />
          <Stack.Screen name="Connect" component={Connect} />
          <Stack.Screen name="UploadDataToServer" component={UploadDataToServer} />
          <Stack.Screen name="DeviceController" component={DeviceController} />
          {/* <Stack.Screen name="Chart_Screen" component={Chart_Screen} /> */}
          <Stack.Screen name="TableData" component={TableData} />
          <Stack.Screen name="ScanQR" component={ScanQR} />
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
};

export default App;