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
  Picker,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  BackHandler,
  Modal
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import firebase from "react-native-firebase";

//get the width and height of the screen for UI.
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
//The theme color of the application
const themecolor = "#557DFF";
let user;
let _this;

type Props = {};

/**
 * Class description
 * SignupScreen is a class that requires users to enter their first name, last name, position, username, email address, and password,
 * in order to create an AirAttend account.
 * SignupScreen class is navigated froom SigninScreen class.
 * SignupScreen class is directly connected to the "users" collection in the Cloud Firestore.
 * After the user is signed up, the local variable "signedIn" will become "true", therefore, users don't need to sign in again.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class SignupScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.ref is a Firebase Cloud Firestore collection "users" Javascript reference.
    this.ref = firebase.firestore().collection("users");
    this.state = {
      bigTitle: "Create your account",
      //position is a String, it is the user's position in the organization.
      position: null,
      //positionInt is an int, it is the user's position but converted to int. Not applied on teachers.
      positionInt: null,
      //firstname is a String, user's first name
      firstname: null,
      //lastname is a String, user's last name
      lastname: null,
      //username is a String
      username: null,
      //email is a String, user's email, require to contain ".com"
      email: null,
      //password is a String
      password: null,
      //passwordconfirm is a String, require users to verify the password previously inputted
      passwordconfirm: null,
      //taken is boolean, any email or username duplications will set taken to true
      taken: false,
      //hide is boolean, to hide value inside the input field
      hide: true,
      hide1: true,
      //url is the image resource of hide icon
      hideUrl: require("../assets/images/hide.png"),
      hideUrl1: require("../assets/images/hide.png"),
      backUrl: require("../assets/images/back.png")
    };
  }

  //When the class is running
  componentDidMount() {
    _this = this;
    //BackHandler's and Keyboard's methods are provided by React Native.
    //Set a back handler to detect when the back button is clicked (Only Android)
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide
    );
  }

  //Remove the back handler with the class finishes running.
  componentWillUnmount() {
    this.backHandler.remove();
  }

  //Used in the back handler, called when the back is pressed.
  handleBackPress = () => {
    /*
     * If the current class is SignupScreen class, the back button is disabled.
     * To prevent users from navigating before they signed in.
     * */
    if (this.props.navigation.state.routeName === "Signup") {
      this.props.navigation.goBack();
    }
  };

  _keyboardDidShow() {
    //alert("Keyboard Shown");
  }

  _keyboardDidHide() {
    //this.refs.scrollView.scrollTo({ x: 0, y: 0, animated: true });
    //alert("Keyboard Hidden");
  }

  /*
   * This method check if all text fields are filled
   * Then check if every inputs are in the right format
   * If all inputs are good, view every account in the database to find duplications
   * If duplications are found, stop the sign up process, and notify users that there is an account duplication
   * If duplications are not found, continue the sign up process, and store the user's account into the collection "users"
   * After sign up is finished, send a verification email to the inputted email
   * Set local variable "signedIn" to "true" and navigate to HomeScreen class
   * */
  UserRegistrationFunction = () => {
    this.setState({
      //set the taken to false as default
      taken: false
    });

    //all input fields must be filled in
    if (
      this.state.position !== null &&
      this.state.firstname !== null &&
      this.state.lastname !== null &&
      this.state.username !== null &&
      this.state.email !== null &&
      this.state.password !== null &&
      this.state.passwordconfirm !== null
    ) {
      //Store the position of the user as a JSON String "grade" on the device, in order to allow ProfileScreen class to access.
      var jsonGrade = JSON.stringify(this.state.position);
      AsyncStorage.setItem("grade", jsonGrade, function(error) {});
      //make sure the user did not input email into the wrong place
      if (
        !this.state.firstname.includes(".com") &&
        !this.state.lastname.includes(".com")
      ) {
        //store the user's first name and last name on the device as a JSON String for attendance uses.
        var jsonFirstName = JSON.stringify(this.state.firstname);
        var jsonLastName = JSON.stringify(this.state.lastname);
        AsyncStorage.setItem("firstname", jsonFirstName, function(error) {});
        AsyncStorage.setItem("lastname", jsonLastName, function(error) {});
        //check if the email input contains ".com" to proceed
        if (this.state.email.includes(".com")) {
          //if (this.state.email.includes("@aisj-jhb.com")) {
          this.setState({
            //I don't know why this is here, but don't delete it yet to prevent bugs
            type: "email"
          });
          //store user's email on the device using the JSON String
          var jsonEmail = JSON.stringify(this.state.email);
          AsyncStorage.setItem("email", jsonEmail, function(error) {});
          //Make sure that the user input the email and the username in the right place
          if (!this.state.username.includes(".com")) {
            //store username on the device using the JSON String for activity enrolment
            var jsonUsername = JSON.stringify(
              this.state.username.toLowerCase()
            );
            AsyncStorage.setItem("username", jsonUsername, function(error) {});
            if (this.state.password.length >= 6) {
              //To verify the password input, if the password is confirmed correctly begin the sign up process
              if (this.state.password === this.state.passwordconfirm) {
                /*var queryRefemail = this.ref.where(
                  "email",
                  "==",
                  this.state.email
                );
                var queryRefusername = this.ref.where(
                  "username",
                  "==",
                  this.state.username
                );*/
                //The fetch method (get()) is provided by Firebase Cloud Firestore and React Native Firebase.
                //get all data from the database
                this.ref.get().then(querySnapshot => {
                  //The read each method (forEach()) is provided by Firebase Cloud Firestore and React Native Firebase
                  //read each document from the fetched data
                  querySnapshot.forEach(doc => {
                    //fetch each variable from the document, email and username will be used for duplication check.
                    const {
                      email,
                      firstname,
                      lastname,
                      password,
                      position,
                      username
                    } = doc.data();
                    //this.state.email is the inputted email, and if the inputted email equals the database email, there is a duplication
                    if (this.state.email.toLowerCase() === email) {
                      //notify the user that the email is taken already
                      ToastAndroid.show(
                        "the email is already taken",
                        ToastAndroid.SHORT
                      );
                      //set taken to true, this requires the user to try with another email
                      this.setState({
                        taken: true
                      });
                    }
                    //this.state.username is the inputted username, and if the inputted username equals the database username, there is a duplication
                    if (this.state.username.toLowerCase() === username) {
                      //notify the user that the username is taken already
                      ToastAndroid.show(
                        "the username is already taken",
                        ToastAndroid.SHORT
                      );
                      //set taken to true, this requires the user to try with another username
                      this.setState({
                        taken: true
                      });
                    }
                  });
                  //after the entire duplication check, if duplication is not found (taken will be false because it is set in the beginning of the function)
                  if (this.state.taken == false) {
                    //The create user method (createUserWithEmailAndPassword()) is provided by Firebase Authentication and React Native Firebase.
                    //store the email and password to Firebase authentication for email verification. (All users' password will be "123456", because users information are stored in the database not in the authentication)
                    firebase
                      .auth()
                      .createUserWithEmailAndPassword(
                        this.state.email,
                        "123456"
                      )
                      .then(function() {
                        //get the current user from Firebase authentication
                        user = firebase.auth().currentUser;
                        //The email verification method (sendEmailVerification()) is provided by Firebase Authentication and React Native Firebase.
                        //send a verification email to the user
                        user
                          .sendEmailVerification()
                          .then(function() {
                            //navigate to VerificationScreen and remove the back handler
                            _this.backHandler.remove();
                            //send the user information to VerificationScreen
                            _this.props.navigation.navigate("Verification", {
                              email: _this.state.email.toLowerCase(),
                              firstname: _this.state.firstname,
                              lastname: _this.state.lastname,
                              password: _this.state.password,
                              position: _this.state.position,
                              username: _this.state.username.toLowerCase()
                            });
                          })
                          .catch(function(error) {});
                      })
                      .catch(function(error) {
                        //if there is an error, get the error message
                        const errorMessage = error.message;
                        //if the email is used already, sign up anyway
                        if (
                          errorMessage ===
                          "The email address is already in use by another account."
                        ) {
                          //The sign in method (signInWithEmailAndPassword()) is provided by Firebase Authentication and React Native Firebase.
                          //sign in to the user's account using user's email. (The password here is useless because there are no information in authentication)
                          firebase
                            .auth()
                            .signInWithEmailAndPassword(
                              _this.state.email,
                              "123456"
                            )
                            .then(function() {
                              //get the current user from Firebase authentication
                              user = firebase.auth().currentUser;
                              //send a verification email to the user
                              user
                                .sendEmailVerification()
                                .then(function() {
                                  //navigate to VerificationScreen and remove the back handler
                                  _this.backHandler.remove();
                                  //send the user information to VerificationScreen
                                  _this.props.navigation.navigate(
                                    "Verification",
                                    {
                                      email: _this.state.email.toLowerCase(),
                                      firstname: _this.state.firstname,
                                      lastname: _this.state.lastname,
                                      password: _this.state.password,
                                      position: _this.state.position,
                                      username: _this.state.username.toLowerCase()
                                    }
                                  );
                                })
                                .catch(function(error) {});
                            });
                        }
                      });
                  }
                });
              } else {
                //if the password is not confirmed, notify users to confirm their passwords
                ToastAndroid.show("confirm your password", ToastAndroid.SHORT);
              }
            } else {
              ToastAndroid.show(
                "the password must be at least 6 characters long",
                ToastAndroid.SHORT
              );
            }
          } else {
            //if other inputs are filled in with incorrect format such as ".com", notify users to input the email in the right place
            ToastAndroid.show(
              "input email in the right place",
              ToastAndroid.SHORT
            );
          }
          /*} else {
            ToastAndroid.show("need to be an AISJ email", ToastAndroid.SHORT);
          }*/
        } else {
          //if other inputs are filled in with incorrect format such as ".com", notify users to input the email in the right place
          ToastAndroid.show(
            "input email in the right place",
            ToastAndroid.SHORT
          );
        }
      } else {
        //if the name has wrong format, notify users
        ToastAndroid.show("that is not a name", ToastAndroid.SHORT);
      }
    } else {
      //if any text field is not filled in, notify users to input something
      ToastAndroid.show("cannot be blank", ToastAndroid.SHORT);
    }
  };

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  //press the hide icon to hide or unhide the password
  onPressHidePassword = () => {
    //if the password is already hidden
    if (this.state.hide) {
      //set the password unhidden and set the hide icon to show
      this.setState({
        hide: false,
        hideUrl: require("../assets/images/show.png")
      });
    } else {
      //if the password is unhidden
      //set the password hidden and change the hide icon to hide
      this.setState({
        hide: true,
        hideUrl: require("../assets/images/hide.png")
      });
    }
  };

  //perform the same thing to the onPressHidePassword function but perform on the confirmation password
  onPressHideConfirmPassword = () => {
    if (this.state.hide1) {
      this.setState({
        hide1: false,
        hideUrl1: require("../assets/images/show.png")
      });
    } else {
      this.setState({
        hide1: true,
        hideUrl1: require("../assets/images/hide.png")
      });
    }
  };

  //UI starts here
  render() {
    //const { navigate } = this.props.navigation;
    return (
      <ScrollView
        style={styles.container}
        ref="scrollView"
        scrollEnabled={true}
      >
        <StatusBar backgroundColor="#f7f7f7" barStyle="dark-content" />
        <View
          style={{ flexDirection: "row", alignItems: "center", paddingTop: 40 }}
        >
          <TouchableOpacity style={styles.button} onPress={this.onPressBack}>
            <Image style={styles.imageButton} source={this.state.backUrl} />
          </TouchableOpacity>
          <Text style={styles.titleText1}>{this.state.bigTitle}</Text>
        </View>
        <View style={styles.usernameinput}>
          <Picker
            style={styles.gradepicker}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({ position: itemValue })
            }
          >
            <Picker.Item label="" value="" />
            <Picker.Item label="Grade 9 student" value="9" />
            <Picker.Item label="Grade 10 student" value="10" />
            <Picker.Item label="Grade 11 student" value="11" />
            <Picker.Item label="Grade 12 student" value="12" />
            <Picker.Item label="Teacher" value="teacher" />
          </Picker>
          <TextInput
            style={styles.nameInputstyle}
            placeholder="I am a ..."
            value={this.state.position}
            editable={false}
          />
        </View>
        <View style={styles.nameContainer}>
          <View style={styles.firstNameinput}>
            <TextInput
              style={styles.nameInputstyle}
              placeholder="First name"
              onChangeText={firstname => this.setState({ firstname })}
              value={this.state.firstname}
            />
          </View>

          <View style={styles.lastNameinput}>
            <TextInput
              style={styles.nameInputstyle}
              placeholder="Last name"
              onChangeText={lastname => this.setState({ lastname })}
              value={this.state.lastname}
            />
          </View>
        </View>
        <View style={styles.inputstyles}>
          <TextInput
            style={styles.inputstyle}
            placeholder="Username"
            onChangeText={username => this.setState({ username })}
            value={this.state.username}
          />
        </View>
        <View style={styles.inputstyles}>
          <TextInput
            style={styles.inputstyle}
            placeholder="Email"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
        </View>
        <View style={styles.inputstyles}>
          <TextInput
            style={styles.inputstyle}
            placeholder="Password"
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
            secureTextEntry={this.state.hide}
          />
          <TouchableOpacity
            style={{
              width: 25,
              height: 25,
              marginTop: 15,
              left: width - 90
            }}
            onPress={this.onPressHidePassword}
          >
            <Image
              style={{
                width: 25,
                height: 20,
                marginTop: 2.5,
                resizeMode: "center"
              }}
              source={this.state.hideUrl}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputstyles}>
          <TextInput
            style={styles.inputstyle}
            placeholder="Confirm the Password"
            onChangeText={passwordconfirm => this.setState({ passwordconfirm })}
            value={this.state.passwordconfirm}
            secureTextEntry={this.state.hide1}
          />
          <TouchableOpacity
            style={{
              width: 25,
              height: 25,
              marginTop: 15,
              left: width - 90
            }}
            onPress={this.onPressHideConfirmPassword}
          >
            <Image
              style={{
                width: 25,
                height: 20,
                marginTop: 2.5,
                resizeMode: "center"
              }}
              source={this.state.hideUrl1}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: "#f7f7f7",
            width: width,
            height: height / 2
          }}
        >
          <View style={styles.touchBackground}>
            <TouchableOpacity
              style={styles.signupButtonBlue}
              onPress={this.UserRegistrationFunction}
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
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const SignUpNavigator = createStackNavigator({
  SignUp: {
    screen: SignupScreen,
    navigationOptions: {
      header: null
      //StatusBar: null
    }
  }
});

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7"
  },
  nameContainer: {
    width: width,
    height: 55,
    marginTop: 25,
    flexDirection: "row"
  },
  imageButton: {
    width: 26,
    height: 26,
    marginLeft: 10,
    resizeMode: "contain"
  },
  titleText1: {
    fontSize: 24,
    color: themecolor,
    fontWeight: "bold",
    marginLeft: 12.5
  },
  gradepicker: {
    width: width - 75,
    height: 55,
    marginLeft: 25,
    marginTop: 0
  },
  usernameinput: {
    width: width - 50,
    height: 55,
    marginTop: 40,
    left: 25,
    backgroundColor: "white",
    borderRadius: 100,
    flexDirection: "row"
  },
  pickerstyle: {
    position: "absolute",
    width: width - 70,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#646464",
    left: 10
  },
  inputstyles: {
    width: width - 50,
    height: 55,
    marginTop: 25,
    left: 25,
    backgroundColor: "white",
    borderRadius: 100
  },
  firstNameinput: {
    width: width / 2 - 37.5,
    height: 55,
    left: 25,
    backgroundColor: "white",
    borderRadius: 100
  },
  lastNameinput: {
    width: width / 2 - 37.5,
    height: 55,
    left: 50,
    backgroundColor: "white",
    borderRadius: 100
  },
  nameInputstyle: {
    position: "absolute",
    width: width / 2 - 57.5,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#646464",
    left: 10
  },
  positioninputstyle: {
    position: "absolute",
    width: width - 70,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#9F9F9F",
    left: 10
  },
  inputstyle: {
    position: "absolute",
    width: width - 70,
    height: 55,
    fontSize: 18,
    fontWeight: "bold",
    color: "#646464",
    left: 10
  },
  signupButtonBlue: {
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
    left: 25,
    backgroundColor: "#000000",
    borderRadius: 100
  }
};
