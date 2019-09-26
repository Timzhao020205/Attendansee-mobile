import React, { Component } from "react";
import {
  AppRegistry,
  StatusBar,
  Image,
  Platform,
  StyleSheet,
  Dimensions,
  TextInput,
  Text,
  View,
  ViewPagerAndroid,
  TouchableOpacity,
  Button,
  ToastAndroid,
  BackHandler
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import firebase from "react-native-firebase";
import md5 from "md5";

import SignupScreen from "./SignupScreen";

//get the width and height of the screen for UI.
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
//The theme color of the application
const themecolor = "#557DFF";

type Props = {};

/**
 * Class description
 * SigninScreen is a class that allows users to use their usernames, emails, and passwords to sign in to the application.
 * SigninScreen is directly connected to the "users" collection in the Cloud Firestore
 * Users require their emails/usernames and passwords to sign into the application.
 * After the user is signed in, the local variable "signedIn" will become "true", therefore, users don't need to sign in again.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class SigninScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.ref is a Firebase Cloud Firestore collection "users" Javascript reference.
    this.ref = firebase.firestore().collection("users");
    //this.queryRef is a Javascript reference used to store the query result from the Cloud Firestore.
    this.queryRef;
    this.state = {
      bigTitle: "Get Started",
      smallTitle: "Sign in to your account",
      //type is a String, type of user identity, "username" or "email"
      type: "username",
      //username is a String, username field input value, also can be email
      username: null,
      //password is a String, password field input value
      password: null,
      guideToSignup: "Don't have an account yet?",
      signUp: "Sign up now",
      //hide is a boolean, password hidden
      hide: true,
      //url is the image resource of hide icon
      url: require("../assets/images/hide.png")
    };
  }

  //OnPressHide is a method that change the display of the password in the password field.
  onPressHide = () => {
    //if the password is already hidden
    if (this.state.hide) {
      this.setState({
        //set password unhidden
        hide: false,
        //switch the hide button image resources to "show.png".
        url: require("../assets/images/show.png")
      });
    } else {
      //else (if the password is not hidden)
      this.setState({
        //set password hidden, hide the password.
        hide: true,
        //switch the hide button image resources to "hide.png".
        url: require("../assets/images/hide.png")
      });
    }
  };

  //When the class is running
  componentDidMount() {
    //Set a back handler to detect when the back button is clicked (Only Android)
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      //When the back button is clicked, use handleBackPress method.
      this.handleBackPress
    );
  }

  //Remove the back handler with the class finishes running.
  componentWillUnmount() {
    this.backHandler.remove();
  }

  //Used in the back handler, called when the back is pressed.
  handleBackPress = () => {
    /*
     * If the current class is SigninScreen class, the back button is disabled.
     * To prevent users from navigating before they signed in.
     * */
    if (this.props.navigation.state.routeName === "Signin") {
      return true;
    }
  };

  //When the Sign in button is pressed
  onPressSignIn = async () => {
    //call the method "check"
    this.check();
  };

  /*
   * The check method is the method that does the entire sign in process.
   * 1. Check if both text input fields contain contain
   * 2. Check the type of the identity (user name or email)
   * 3. Find the corresponding password of the username/email using Cloud Firestore
   * 4. Check if the password inputted matches with the password queried
   * 5. If the password matches, sign the user in
   * */
  check() {
    //if values inside username input field and password input field are not null, check the type
    if (this.state.username !== null && this.state.password !== null) {
      //if the identity input contains ".com", it is a email, set the type to email.
      if (this.state.username.includes(".com")) {
        this.setState({
          //set the type to email
          type: "email"
        });
      } else if (!this.state.username.includes(".com")) {
        //if the identity does not contain ".com", it is not a email, set the typ username.
        this.setState({
          //Set the type to username
          type: "username"
        });
      }
      //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
      //The queryRef becomes the query result of Cloud Firestore.
      this.queryRef = this.ref.where(
        //The this.state.type is the account type already set in the previous statement.
        this.state.type,
        "==",
        this.state.username.toLowerCase()
      );
      //The fetch method (get()) is provided by Firebase Cloud Firestore and React Native Firebase.
      //Get all data queried from the database.
      this.queryRef.get().then(querySnapshot => {
        if (querySnapshot.size == 0) {
          ToastAndroid.show(
            "The account doesn't exist, make sure you entered a correct username or email. If you don't have an account," +
              ' please create an account by click "Sign up now".',
            ToastAndroid.SHORT
          );
        } else if (querySnapshot.size == 1) {
          //Read each document queried from the database
          querySnapshot.forEach(doc => {
            //Get each value from a document data
            const {
              email,
              firstname,
              lastname,
              password,
              position,
              username
            } = doc.data();
            //if the username/email equals to the input username and the password equals the input password, set values to the local variables.
            if (
              this.state.username.toLowerCase() === email ||
              this.state.username.toLowerCase() === username
            ) {
              if (md5(this.state.password) === password) {
                var jsonStr = JSON.stringify("true");
                var jsonUsername = JSON.stringify(username.toLowerCase());
                var jsonFirstname = JSON.stringify(firstname);
                var jsonLastname = JSON.stringify(lastname);
                var jsonPosition = JSON.stringify(position);
                //Set the value for local variable grade, will be displayed in the ProfileScreen class
                AsyncStorage.setItem("grade", jsonPosition, function(error) {});
                //Set the value for local variable signedIn, users do not need to sign in in the future
                AsyncStorage.setItem("signedIn", jsonStr, function(error) {});
                //Set the value for local variable username, for enroll services.
                AsyncStorage.setItem("username", jsonUsername, function(
                  error
                ) {});
                //Set the value for local variable firstname, will be displayed in the ProfileScreen.
                AsyncStorage.setItem("firstname", jsonFirstname, function(
                  error
                ) {});
                //Set the value for local variable lastname, will be displayed in the ProfileScreen.
                AsyncStorage.setItem("lastname", jsonLastname, function(
                  error
                ) {});
                //navigate to Home class.
                this.props.navigation.navigate("Home");
              } else {
                //If the inputted password does not match with the password from the database
                //Show text "incorrect password"
                ToastAndroid.show("incorrect password", ToastAndroid.SHORT);
              }
            } else {
              //If the username is not found
              //Show text "incorrect username"
              ToastAndroid.show("incorrect username", ToastAndroid.SHORT);
            }
          });
        }
      });
    } else {
      //else (if user did not input in either text input field)
      //Show text "cannot be blank"
      ToastAndroid.show("cannot be blank", ToastAndroid.SHORT);
    }
  }

  //StoreData method store the class data locally to the device, not used in the class.
  _storeData = async () => {
    try {
      //This is a bug, AsyncStorage only stores JSON strings
      await AsyncStorage.setItem("signedIn", "true");
      //navigate to HomeScreen class
      this.props.navigation.navigate("Home");
    } catch (error) {
      ToastAndroid.show("Error saving data", ToastAndroid.SHORT);
    }
  };

  //When users pressed the sign up button
  onPressSignUp = () => {
    //Navigate the user to the SignupScreen class to sign up a new account
    this.props.navigation.navigate("Signup");
  };

  //UI starts here
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#f7f7f7" barStyle="dark-content" />
        <Text style={styles.titleText1}>{this.state.bigTitle}</Text>
        <Text style={styles.titleText2}>{this.state.smallTitle}</Text>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={styles.usernameinput}>
            <TextInput
              style={styles.inputstyle}
              placeholder="Username or Email"
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
            />
          </View>
          <View style={styles.passwordinput}>
            <TextInput
              style={styles.passwordinputstyle}
              secureTextEntry={this.state.hide}
              placeholder="Password"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <TouchableOpacity
              style={{ width: 25, height: 25, marginTop: 15, left: width - 90 }}
              onPress={this.onPressHide}
            >
              <Image
                style={{
                  width: 25,
                  height: 20,
                  marginTop: 2.5,
                  resizeMode: "center"
                }}
                source={this.state.url}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.touchBackground}>
            <TouchableOpacity
              style={styles.signinButton}
              onPress={this.onPressSignIn}
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
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center"
            }}
          >
            <View style={styles.signupButton}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#8C8C8C",
                  paddingTop: 1.5
                }}
              >
                {this.state.guideToSignup}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: themecolor,
                  marginLeft: 5
                }}
                onPress={this.onPressSignUp}
              >
                {this.state.signUp}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const SignUpNavigator = createStackNavigator({
  SignUp: {
    screen: SignupScreen,
    navigationOptions: {
      header: null
    }
  }
});

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7"
  },
  titleText1: {
    fontSize: 36,
    color: themecolor,
    fontWeight: "bold",
    paddingTop: (64 / 755) * height,
    left: 25
  },
  titleText2: {
    fontSize: 24,
    color: themecolor,
    fontWeight: "bold",
    marginTop: (8 / 755) * height,
    left: 25
  },
  usernameinput: {
    width: width - 50,
    height: 55,
    marginTop: (64 / 755) * height,
    backgroundColor: "white",
    borderRadius: 100
  },
  passwordinput: {
    width: width - 50,
    height: 55,
    marginTop: (25 / 755) * height,
    backgroundColor: "white",
    borderRadius: 100,
    flexDirection: "row"
  },
  inputstyle: {
    position: "absolute",
    width: width - 70,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#646464",
    paddingLeft: ((20 * 100) / 360).toString() + "%"
  },
  passwordinputstyle: {
    position: "absolute",
    width: width - 105,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#646464",
    paddingLeft: ((20 * 100) / 360).toString() + "%"
  },
  signinButton: {
    width: width - 50,
    height: 55,
    backgroundColor: themecolor,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center"
  },
  touchBackground: {
    width: width - 50,
    height: 55,
    marginTop: 25,
    backgroundColor: "#000000",
    borderRadius: 100
  },
  signupButton: {
    position: "absolute",
    flexDirection: "row",
    height: 40,
    width: width,
    bottom: "12.5%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7"
  }
};
