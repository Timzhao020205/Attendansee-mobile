import React, { Component } from "react";
import {
  AppRegistry,
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  ViewPagerAndroid,
  Dimensions,
  ToastAndroid,
  Button,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  Easing,
  Switch,
  Alert,
  BackHandler
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import SwitchToggle from "react-native-switch-toggle";
import AsyncStorage from "@react-native-community/async-storage";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const backColor = "rgba(0, 0, 0, 0.4)";
const effectColor = "rgba(255, 255, 255, 1)";
const effectColorBack = "rgba(255, 255, 255, 0.3)";
const themecolor = "#557DFF";

type Props = {};

/**
 * Class description
 * SettingScreen is a class that allows users to change the settings of the application.
 * Many settings will be stored as local variables and can be accessed in the future.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class SettingScreen extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      //backUrl is a url that links to the back arrow icon
      backUrl: require("../assets/images/backblack.png"),
      //switchOnDistanceCheck is a boolean that is links to the switch where admins can turn on or off the distance check.
      switchOnDistanceCheck: true
    };
  }

  //When the class is running
  componentDidMount() {
    //Set a back handler to detect when the back button is clicked (Only Android)
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
    //get the local variable "distanceCheck" and set it to the global variable.
    AsyncStorage.getItem("distanceCheck").then(value => {
      const jsonValue = JSON.parse(value);
      if (jsonValue === "true") {
        this.setState({ switchOnDistanceCheck: true });
      } else if (jsonValue === "false") {
        this.setState({ switchOnDistanceCheck: false });
      }
    });
  }

  //Remove the back handler with the class finishes running.
  componentWillUnmount() {
    this.backHandler.remove();
  }

  //Used in the back handler, called when the back is pressed.
  handleBackPress = () => {
    /*
     * If the current class is SettingScreen class, the back button is disabled.
     * */
    if (this.props.navigation.state.routeName === "Settings") {
      this.props.navigation.goBack();
    }
    //alert(this.props.navigation.state.routeName)
  };

  /*
   * onPressSignOut is called when the user presses the Sign out button.
   * It will change the local variable "signedIn" to false
   * If "signedIn" is false, the app will auto navigate users to SigninScreen
   * */

  onPressSignOut = async () => {
    //set the signedIn to false, so the user is not signed in.
    var jsonStr = JSON.stringify("false");
    var jsonfirstname = JSON.stringify("");
    var jsonlastname = JSON.stringify("");
    //set the local variable.
    AsyncStorage.setItem("signedIn", jsonStr, function(error) {});
    /*AsyncStorage.setItem("firstname", jsonfirstname, function(error) {});
    AsyncStorage.setItem("lastname", jsonlastname, function(error) {});*/
    //navigate to SigninScreen.
    this.props.navigation.navigate("Signin");
  };

  //when the back button is pressed, navigate to the previous screen.
  onPressBack = () => {
    this.props.navigation.goBack();
  };

  //confirm to disable the distance check.
  onPressOK = () => {
    //set the local variable "distanceCheck" to "false"
    var jsonStr = JSON.stringify("false");
    AsyncStorage.setItem("distanceCheck", jsonStr, function(error) {});
    //ToastAndroid.show('false', ToastAndroid.SHORT);
  };

  //onPressDistanceCheck is called when the switch is clicked.
  onPressDistanceCheck = () => {
    //set the switchOnDistanceCheck to its opposite value.
    this.setState({ switchOnDistanceCheck: !this.state.switchOnDistanceCheck });
    //if the distance check is already enabled, disable it
    if (this.state.switchOnDistanceCheck) {
      Alert.alert(
        "Disable Distance check?",
        "The attendance process will become faster and more efficient, however, students don't have to be next to the device to have their attendances taken",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "OK", onPress: this.onPressOK }
        ],
        { cancelable: false }
      );
      //if the distance check is disabled, enable it.
    } else if (!this.state.switchOnDistanceCheck) {
      var jsonStr = JSON.stringify("true");
      AsyncStorage.setItem("distanceCheck", jsonStr, function(error) {});
      //ToastAndroid.show('true', ToastAndroid.SHORT);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f7f7f7" barStyle="dark-content" />
        <View
          style={{ flexDirection: "row", alignItems: "center", paddingTop: 40 }}
        >
          <TouchableOpacity style={styles.button} onPress={this.onPressBack}>
            <Image style={styles.imageButton} source={this.state.backUrl} />
          </TouchableOpacity>
          <Text
            style={{
              paddingLeft: 15,
              color: "black",
              fontSize: 24,
              fontWeight: "bold"
            }}
          >
            Settings
          </Text>
        </View>
        <View
          style={{
            width: width - 50,
            height: 100,
            marginLeft: 25,
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row"
          }}
        >
          <Text
            style={{
              color: "black",
              fontSize: 20,
              fontWeight: "bold"
            }}
          >
            Distance check
          </Text>
          <SwitchToggle
            containerStyle={{
              width: 39,
              height: 22,
              borderRadius: 100,
              backgroundColor: "rgb(225,225,225)",
              padding: 2
            }}
            circleStyle={{
              width: 18,
              height: 18,
              borderRadius: 100,
              backgroundColor: "white" // rgb(102,134,205)
            }}
            switchOn={this.state.switchOnDistanceCheck}
            onPress={this.onPressDistanceCheck}
            circleColorOff="white"
            circleColorOn="white"
            backgroundColorOn="#557DFF"
            backgroundColorOff="rgb(225,225,225)"
            duration={250}
          />
        </View>

        <View style={styles.touchBackground}>
          <TouchableOpacity
            style={styles.signoutButton}
            onPress={this.onPressSignOut}
            activeOpacity={0.9}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                color: "#FF0048",
                paddingBottom: 3
              }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7"
  },
  imageButton: {
    width: 26,
    height: 26,
    marginLeft: 10,
    resizeMode: "contain"
  },
  signoutButton: {
    width: width - 50,
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  touchBackground: {
    width: width - 50,
    height: 55,
    //marginTop: 25,
    left: 25,
    backgroundColor: "#bdbdbd",
    borderRadius: 100
  }
};
