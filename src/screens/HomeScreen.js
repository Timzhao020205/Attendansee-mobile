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
  Dimensions,
  BackHandler
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
//import ViewPager from "@react-native-community/viewpager";
import firebase from "react-native-firebase";
import { ViewPager, IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";

//use these classes in the ViewPager
import ScannerScreen from "./ScannerScreen";
import ProfileScreen from "./ProfileScreen";

//get the width and height of the screen for UI.
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

type Props = {};

/**
 * Class description
 * HomeScreen class is a class that contains both ScannerScreen class and ProfileScreen class and runs them on the same time.
 * Users can navigate between ScannerScreen and ProfileScreen by sliding.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class HomeScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.ref is a Firebase Cloud Firestore collection "users" Javascript reference.
    this.firestoreRef = firebase.firestore().collection("users");
    this.state = {
      welcome: "Hello World!",
      //statusBarColor is a String, that manipulates the status bar's color when the class is running (Android only)
      statusBarColor: "black",
      //statusBarContent is a String, that manipulates the status bar's style (dark or light font) when the class is running (Android only)
      statusBarContent: "light-content",
      username: "",
      propValue: false
    };
  }

  //When the class is running
  componentDidMount() {
    //Set a back handler to detect when the back button is clicked (Only Android)
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
    //When this screen is displayed,
    this.props.navigation.addListener("didFocus", payload => {
      //Call refresh() to refresh ScannerScreen and ProfileScreen.
      this.refresh();
    });
    /*
     * This part is going to check if the username exist,
     * if the username doesn't, Sign out from HomeScreen and navigate to SigninScreen.
     */
    //Get the local variable "username"
    AsyncStorage.getItem("username").then(value => {
      const jsonValueUsername = JSON.parse(value);
      if (jsonValueUsername !== null) {
        this.setState({
          username: jsonValueUsername
        });
        //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
        //The userRef becomes the query of Cloud Firestore for the username.
        var userRef = this.firestoreRef.where(
          "username",
          "==",
          this.state.username
        );
        //The fetch method (get()) is provided by Firebase Cloud Firestore and React Native Firebase.
        //Get the Query Snapshot (the query result).
        userRef.get().then(querySnapshot => {
          //If the query result's size is 0 (user does not exist)
          if (querySnapshot.size == 0) {
            ToastAndroid.show("The account does not exist", ToastAndroid.SHORT);
            var jsonStr = JSON.stringify("false");
            var jsonUsername = JSON.stringify("");
            var jsonFirstname = JSON.stringify("");
            var jsonLastname = JSON.stringify("");
            var jsonPosition = JSON.stringify("");
            //Set local variables to null.
            AsyncStorage.setItem("grade", jsonPosition, function(error) {});
            //Sign out from the account
            AsyncStorage.setItem("signedIn", jsonStr, function(error) {});
            AsyncStorage.setItem("username", jsonUsername, function(error) {});
            AsyncStorage.setItem("firstname", jsonFirstname, function(
              error
            ) {});
            AsyncStorage.setItem("lastname", jsonLastname, function(error) {});
            //Navigate to SigninScreen
            this.props.navigation.navigate("Signin");
          }
        });
      }
    });
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
    //Don't know why this is here, but it should be already checked to navigate to this class
    AsyncStorage.getItem("signedIn").then(value => {
      const jsonValue = JSON.parse(value);
      if (jsonValue !== "true") {
        this.props.navigation.navigate("Signin");
      }
    });
  }

  //Remove the back handler with the class finishes running.
  componentWillUnmount() {
    this.backHandler.remove();
  }

  //Refresh ScannerScreen and ProfileScreen when there is an account information change.
  refresh() {
    //Call refresh() in class ScannerScreen.
    this.refs.scanner.refresh();
    //Call refreshInfo() in class ProfileScreen.
    this.refs.profile.refreshInfo();
  }

  //Used in the back handler, called when the back is pressed.
  handleBackPress = () => {
    /*
     * If the current class is HomeScreen class, the back button is disabled.
     * To prevent users from navigating to StartScreen class.
     * */
    if (this.props.navigation.state.routeName === "Home") {
      return true;
    }
  };

  //If the setting button is clicked, navigate to SettingScreen class
  onPressGoSetting = () => {
    this.props.navigation.navigate("Settings");
  };

  //UI starts here
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          //Status bar will vary due to different background
          backgroundColor={this.state.statusBarColor}
          barStyle={this.state.statusBarContent}
        />
        <ViewPager
          //Viewpager is a Android component that can navigate between screens using slides
          style={styles.container}
          onPageScroll={event => {
            //if the current page is ScannerScreen,
            if (event.position == 0) {
              //set the status bar to light content.
              this.setState({
                statusBarColor: "black",
                statusBarContent: "light-content"
              });
              //if the current page is ProfileScreen,
            } else if (event.position == 1) {
              //set the status bar to dark content.
              this.setState({
                statusBarColor: "#f7f7f7",
                statusBarContent: "dark-content"
              });
            }
          }}
        >
          <View style={styles.container}>
            <ScannerScreen ref="scanner" />
          </View>
          <View style={styles.container}>
            <ProfileScreen ref="profile" />
            <View
              style={{
                paddingTop: (55.75 / 755) * height,
                paddingLeft: (320 / 360) * width,
                width: 24,
                height: 10,
                position: "absolute",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onPress={this.onPressGoSetting}
              >
                <Image
                  style={{ width: 24, height: 10, resizeMode: "contain" }}
                  source={require("../assets/images/settingicon.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ViewPager>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
