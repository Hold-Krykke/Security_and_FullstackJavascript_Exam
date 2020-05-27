import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";

const MakeAlert = ({ error, setError }) => {
  /**
   * Errorhandling Alert.
   * Tapping any button will fire the respective onPress callback and dismiss the alert.
   * @param {string} error Text describing the error that occurred.
   * @param {string} title The Title for the Error Alert. Default "An Error Occurred"
   * @param {string} buttonText The text on the button. Default "OK"
   */
  const MyAlert = (error, title = "An Error Occurred", buttonText = "OK") =>
    // static alert(title, message?, buttons?, options?)
    Alert.alert(
      title,
      error,
      [
        {
          text: buttonText,
          onPress: () => {
            console.log(JSON.stringify({ error }, null, 4));
            setError({ message: "", title: "An Error Occurred" });
            console.log(`${buttonText} pressed on Error Alert.`);
          },
        },
      ],
      { cancelable: false } // If false, you can only dismiss via the onPress. If True, you can dismiss by pressing outside the alert.
    );

  if (error.message) {
    return <View>{MyAlert(error.message, error.title)}</View>;
  } else {
    return null;
  }
};

export default MakeAlert;
