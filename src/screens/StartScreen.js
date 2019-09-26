import React, { Component } from "react";
import {
  AppRegistry,
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Button,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import ViewPager from "@react-native-community/viewpager";

import ScannerScreen from "./ScannerScreen";
import ProfileScreen from "./ProfileScreen";

//get the width and height of the screen for UI.
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

type Props = {};

/**
 * Class discription
 * StartScreen is the first screen that is displayed on the screen when the app is opened.
 * This class check if the user is signed in to the application already. If the user already signed in,
 * the class will navigate to HomeScreen class, else, the class will navigate users to SigninScreen class.
 */

export default class StartScreen extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { welcome: "Hello World!" };
  }

  //When the class is executing
  componentDidMount() {
    //Check the internet connection of the mobile
    NetInfo.addEventListener(state => {
      /*
       * if the internet is not connected,
       * a warning will be shown, to notify users that the attendance cannot be taken offline
       * */
      if (state.isConnected != true) {
        Alert.alert(
          "Internet problem",
          "If the internet is not connect, the attendance cannot be taken.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      }
    });
    //get a variable called "signedIn" locally from the device.
    AsyncStorage.getItem("signedIn").then(value => {
      //convert the JSON to string
      const jsonValue = JSON.parse(value);
      //if the converted value is not true, navigate to SigninScreen class.
      //if the converted value is true, navigate to HomeScreen class.
      if (jsonValue !== "true") {
        //navigate to SigninScreen class.
        this.props.navigation.navigate("Signin");
      } else if (jsonValue === "true") {
        //navigate to HomeScreen class.
        this.props.navigation.navigate("Home");
      }
    });
  }

  //UI starts here
  render() {
    return <View style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
