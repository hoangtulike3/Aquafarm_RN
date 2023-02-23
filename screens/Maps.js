// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Image, Dimensions, View, TouchableOpacity, Alert } from 'react-native';
// import WifiManager from 'react-native-wifi';
import MapView, { Marker, Circle } from 'react-native-maps';

export default Maps = ({ navigation, route }) => {
  const myLocation = { latitude: 37.78825, longitude: -122.4324 }
  const markers =[
    { latitude: 37.78925, longitude: -122.4399 },
    { latitude: 37.78525, longitude: -122.4224 },
    { latitude: 37.78625, longitude: -122.4124 },
    { latitude: 37.78125, longitude: -122.4424 },
  ]

  // function createTwoButtonAlert() {
  //   Alert.alert(
  //     "Alert Title",
  //     "My Alert Msg",
  //     [
  //       {
  //         text: "Cancel",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel"
  //       },
  //       { text: "OK", onPress: () => console.log("OK Pressed") }
  //     ]
  //   );
  // }
  
  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion= {{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider= "google"
        // loadingEnabled= {true}
        // showsUserLocation = { true }
        // followUserLocation = { true }
        // onRegionChangeComplete = { this.onRegionChangeComplete.bind(this) }
      >
        <Marker
          coordinate={myLocation}
          anchor={{ x: 0.4, y: 0.4 }}
          // image={require('../images/map/red-point.png')} 
          // centerOffset={{ x: 0, y: 0 }}
        >
          <Image source={require('../images/map/red-point.png')} style={{height: 25, width: 25, backgroundColor: "#ffffff", borderRadius: 100 }} />
        </Marker>
        <Circle
          center={myLocation}
          radius={2000}
          strokeWidth={2}
          strokeColor={'rgba(21,50,74,0.45)'}
          fillColor={'rgba(21,50,74,0.2)'}
        />

        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker}
            // image={{uri: 'custom_pin'}}
            onPress={() => 
              navigation.navigate('ConnectWifi')
            }
          >
            <Image source={require('../images/map/location.png')} style={{height: 35, width:35 }} />
          </Marker>
        ))}
        
      </MapView>
      <View style={{ position: "absolute", zIndex: 2, left: 15, top: 25, width: 40, height: 40, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 100 }}>
        <TouchableOpacity
          style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
					onPress={() =>
						navigation.navigate('Home')
					}
				>
          <Text style={{ fontSize: 20 }}>{"<"}</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={{ position: "absolute", zIndex: 2, right: 0, top: 20, width: 30, height: 30, alignItems: "center", backgroundColor: "#ffffff", borderRadius: 100 }}>
        <TouchableOpacity 
					onPress={() =>
						navigation.navigate('ConnectWifi')
					}
				>
          <Text style={{ fontSize: 20 }}>{"..."}</Text>
        </TouchableOpacity>
      </View> */}
    </View>
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
