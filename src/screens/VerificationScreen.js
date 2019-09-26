import React, { Component } from "react";
import {
  AppRegistry,
  StatusBar,
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  BackHandler
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import firebase from "react-native-firebase";
import md5 from "md5";
import TimerMixin from "react-timer-mixin";

//get the width and height of the screen for UI.
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const themecolor = "#557DFF";
let _this;

type Props = {};

export default class VerificationScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.firestoreRef is a Firebase Cloud Firestore collection "services" Javascript reference.
    this.ref = firebase.firestore().collection("users");
    this.state = {
      //all the user's account information.
      email: "",
      firstname: "",
      lastname: "",
      password: "",
      position: "",
      username: "",
      verifyPressed: false
    };
  }

  //When the class is running
  componentDidMount() {
    _this = this;
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      //When the back button is clicked, use handleBackPress method.
      this.handleBackPress
    );
    this.props.navigation.addListener("didFocus", payload => {
      this.setState({
        verifyPressed: false
      });
    });
    //get user's information from SignupScreen and save them to corresponding variables.
    this.setState({
      verifyPressed: false,
      email: this.props.navigation.getParam("email"),
      firstname: this.props.navigation.getParam("firstname"),
      lastname: this.props.navigation.getParam("lastname"),
      password: this.props.navigation.getParam("password"),
      position: this.props.navigation.getParam("position"),
      username: this.props.navigation.getParam("username")
    });
  }

  handleBackPress = () => {
    /*
     * If the current class is VerificationScreen class, the app will navigate back.
     * The class will also delete the authentication account created in SignupScreen.
     * */
    if (this.props.navigation.state.routeName === "Verification") {
      //The delete account method (delete()) is provided by Firebase Authentication and React Native Firebase.
      //delete the user's Firebase Authentication account.
      if (firebase.auth().currentUser != null) {
        firebase.auth().currentUser.delete();
      }
      this.props.navigation.goBack();
      //return false;
    } else if (this.props.navigation.state.routeName === "Signup") {
      return true;
    }
  };

  /*
   * _onVerifyPressed is called when "Verified" button is pressed.
   * Check if the user's email is verified.
   * If the email is verified, create the account in Firebase Cloud Firestore.
   * */

  _onVerifyPressed = () => {
    if (this.state.verifyPressed == false) {
      this.setState({
        verifyPressed: true
      });
      //The reload method (reload()) is provided by Firebase Authentication and React Native Firebase.
      //reload the account status in Firebase Authentication (accounts must be reload to verify)
      firebase
        .auth()
        .currentUser.reload()
        .then(function() {
          //if the email is verified,
          if (firebase.auth().currentUser.emailVerified) {
            //notify the user
            ToastAndroid.show("Email verified", ToastAndroid.SHORT);
            //create a new document in the database and add the user's inputs into the new document
            //used md5 encryption from npm MD5 to encrypt the password
            _this.ref.add({
              email: _this.state.email.toLowerCase(),
              firstname: _this.state.firstname,
              lastname: _this.state.lastname,
              password: md5(_this.state.password),
              position: _this.state.position,
              username: _this.state.username.toLowerCase()
            });
            //set local variable "signedIn" to true
            var jsonStr = JSON.stringify("true");
            AsyncStorage.setItem("signedIn", jsonStr, function(error) {});
            //navigate to the HomeScreen class
            _this.props.navigation.navigate("Home");
            /*_this.setState({
              verifyPressed: false
            });*/
            //if the account is not verified,
          } else {
            //notify that the verification failed.
            ToastAndroid.show(
              "Need to verify your email first",
              ToastAndroid.SHORT
            );
            _this.setState({
              verifyPressed: false
            });
          }
        });
      //if verification is processing,
    } else {
      //notify the user that the account is verifying.
      ToastAndroid.show(
        "Checking the verification, please be patient",
        ToastAndroid.SHORT
      );
    }
  };

  //UI starts here
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <StatusBar backgroundColor="#f7f7f7" barStyle="dark-content" />
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: themecolor
            }}
          >
            Verify your email
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              width: width - 50,
              marginTop: 25,
              lineHeight: 30
            }}
          >
            There is a verification email sent to the email address you
            provided, please click the link in the email in order to activate
            your account.
          </Text>
          <View
            style={{
              width: width - 50,
              height: 55,
              backgroundColor: "#000000",
              borderRadius: 100,
              marginTop: 25
            }}
          >
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={this._onVerifyPressed}
              activeOpacity={0.9}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "white",
                  paddingBottom: 3
                }}
              >
                Verified
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  verificationButton: {
    width: width - 50,
    height: 55,
    backgroundColor: themecolor,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center"
  }
});
