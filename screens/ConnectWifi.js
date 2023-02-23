// import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from 'expo-checkbox';

export default ConnectWifi = ({ navigation, route }) => {
	const [bandwidth, setBandwidth] = useState("25");
	const [isCheck, setCheck] = useState(false);
	const [ssid, setSSID] = useState("");
	const [password, setPassword] = useState("");
	async function sendData() {
		console.log("POST", ssid, password, bandwidth)
		fetch('http://192.168.5.1:2000/configwifi', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				ssid: ssid,
				password: password,
				bandwidth: bandwidth,
			}),
		});
	}

  return (
		<View style={{ paddingVertical: 20, paddingHorizontal: 20, backgroundColor: "#ffffff", width: "100%", height: "100%" }}>
			<View style={{ flexDirection: "row", justifyContent: 'space-between', marginTop: 10, marginBottom: 20 }}>
				<TouchableOpacity style={{ alignSelf: "flex-start", height: 40 }}
					onPress={() =>
						navigation.navigate('Maps')
					}
				>
					<Text style={styles.fontSizes}>Cancel</Text>
				</TouchableOpacity>
				<View style={{ alignItems: "center", justifyContent: "center" }}>
					<Text style={{ fontWeight: "bold" }}>Select Edge Server</Text>
				</View>
				<TouchableOpacity style={{ alignSelf: "flex-end", height: 40 }} 
					onPress={ () => {
						sendData()
						navigation.navigate('Home')
						}
					}
				>
					<Text style={styles.fontSizes}>Done</Text>
				</TouchableOpacity>
			</View>
			<ScrollView>
				<View style={{ marginBottom: 50 }}>
					<Text style={{ fontSize: 16, marginBottom: 5 }}>Edge server name</Text>
					<Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>comwe edge</Text>
					<Text style={{ fontSize: 16, marginBottom: 5 }}>Wi-Fi SSID</Text>
					<TextInput style={{ height: 40, borderBottomWidth: 1, fontSize: 16, marginBottom: 15 }} 
						placeholder="Please write the Wi-Fi SSID"
						onChangeText={setSSID}
						value={ssid}
					/>
					<Text style={{ fontSize: 16, marginBottom: 5 }}>PASSWORD</Text>
					<TextInput style={{ height: 40, borderBottomWidth: 1, fontSize: 16, marginBottom: 15 }} secureTextEntry={true} 
						placeholder="Please write the PASSWORD"
						onChangeText={setPassword}
						value={password}
					/>
					<Text style={{ fontSize: 16, marginBottom: 5 }}>Bandwidth</Text>
					<View style={{ borderWidth: 1, borderRadius: 10, borderColor: "#dedede", justifyContent: "center", marginBottom: 20 }}>
						<Picker
							selectedValue={bandwidth}
							style={{ height: 40 }}
							onValueChange={(itemValue, itemIndex) => setBandwidth(itemValue)}
						>
							<Picker.Item label="10 Mbps" value="10" />
							<Picker.Item label="15 Mbps" value="15" />
							<Picker.Item label="20 Mbps" value="20" />
							<Picker.Item label="25 Mbps" value="25" />
							<Picker.Item label="30 Mbps" value="30" />
						</Picker>
					</View>
					
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<CheckBox 
							style={{ marginRight: 10 }}
							disabled={false}
							value={isCheck}
							onValueChange={(newValue) => setCheck(newValue)}
						/>
						<Text style={{ fontSize: 16 }}>I agree to share my network.</Text>
					</View>
				</View>
			</ScrollView>
		</View>    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizes: {
		fontSize: 16,
  },
});
