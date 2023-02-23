import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

module.exports = async taskData => {
  Alert.alert(
    "Warning",
    "Data over limit!!!",
    [
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
        style: "No"
      },
      { text: "Yes", onPress: () => console.log("Yes Pressed") }
    ]
  );
};