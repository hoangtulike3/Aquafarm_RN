import * as React from 'react';

import { StyleSheet, Text, PermissionsAndroid, Alert } from 'react-native';
import { CameraScreen } from 'react-native-camera-kit';

export default ScanQR = ({navigation, route}) => {
  const [hasPermission, setHasPermission] = React.useState(false);

  React.useEffect(() => {
    try {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then((result) => {
					if (result) {
						console.log("Permission CAMERA is OK");
						setHasPermission(true);
					} else {
						PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then((result) => {
							if (result) {
								console.log("User accept CAMERA");
								setHasPermission(true);
							} else {
								console.log("User refuse CAMERA");
								setHasPermission(false);
							}
						});
					}
        });
        } catch (err) {
        console.warn(err);
        }
  }, []);

  return (
    hasPermission && (
      <>
        <CameraScreen
          actions={{ rightButtonText: 'Done', leftButtonText: 'Cancel' }}
          onBottomButtonPressed={(event) => navigation.navigate('Things')}
          // flashImages={{
          //   // optional, images for flash state
          //   on: require('../images/connect.png'),
          //   off: require('../images/connect.png'),
          //   auto: require('../images/connect.png'),
          // }}
          // cameraFlipImage={require('../images/connect.png')} // optional, image for flipping camera button
          // captureButtonImage={require('../images/connect.png')} // optional, image capture button
          // torchOnImage={require('../images/connect.png')} // optional, image for toggling on flash light
          // torchOffImage={require('../images/connect.png')} // optional, image for toggling off flash light
          hideControls={false} // (default false) optional, hides camera controls
          showCapturedImageCount={false} // (default false) optional, show count for photos taken during that capture session
          scanBarcode={true}
          onReadCode={(event) => {
            // Alert.alert('QR code found', event.nativeEvent.codeStringValue)
            // console.log(event.nativeEvent.codeStringValue)
						route.params.setQRvalue(event.nativeEvent.codeStringValue)
            navigation.goBack();
          }} // optional
          showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
          laserColor='red' // (default red) optional, color of laser in scanner frame
          frameColor='white' // (default white) optional, color of border of scanner frame
        />
      </>
    )
  );
}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});