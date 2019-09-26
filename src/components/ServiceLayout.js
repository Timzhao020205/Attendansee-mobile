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
  Dimensions,
  Animated,
  ActivityIndicator
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
import QRCode from "react-native-qrcode-svg";
import firebase from "react-native-firebase";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const themecolor = "#557DFF";

type Props = {};

/**
 * Class description
 * ServiceLayout is a class that can generate QR codes for the QR code scanner to scan.
 * ServiceLayout is only connected to Realtime database (attendance results).
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class ServiceLayout extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Realtime database and React Native Firebase.
    //this.databaseRef is a Firebase Realtime database Javascript reference.
    this.databaseRef = firebase.database();
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.firestoreRef is a Firebase Cloud Firestore collection "services" Javascript reference.
    this.firestoreRef = firebase.firestore().collection("services");
    this.state = {
      qrId: 1,
      serviceId: 1,
      //distanceCheck is a String that is "0" or "1", "0" is don't check the distance, "1" is check the distance.
      distanceCheck: "1",
      //studentName is a String, it is the admin's name (admin does not need to be a student).
      studentname: "",
      //serviceName is a String.
      serviceName: "",
      //latitude is a String, the geolocation of admin's (service leader's) device.
      latitude: "",
      //longitude is a String, the geolocation of admin's (service leader's) device.
      longitude: "",
      //pin is a String, a random 4 digits pin generated to confirm the enrollment
      pin: "",
      //sheetUrl is actually service id, but because the first prototype did not an id for each service,
      //the variable name is incorrect.
      sheetUrl: null,
      error: null,
      expanded: false,
      //reset animation to original positions.
      expandAnim: new Animated.Value(0),
      translateAnim: new Animated.Value(0),
      fadeAnim: new Animated.Value(0),
      //opacity is 0, it is transparent
      opacity: 0,
      loadingOpacity: 0,
      generatePressed: false,
      minHeight: 80,
      maxHeight: 360,
      url: require("../assets/images/generate.png")
    };
  }

  //When the class is running
  componentDidMount() {
    //get the service name from ProfileScreen.
    var serviceName = this.getServiceName();
    //get the service id from ProfileScreen.
    var url = this.getSheetUrl();
    //get the admin's name from ProfileScreen.
    var studentName = this.getStudentName();
    //reset the size of the layout to the unexpanded size.
    let initialValue = this.state.expanded
      ? this.state.maxHeight + this.state.minHeight
      : this.state.minHeight;
    this.state.expandAnim.setValue(initialValue);
    //set global service name, id, and student's name variables to values from ProfileScreen.
    this.setState({
      serviceName: serviceName,
      sheetUrl: url,
      studentName: studentName
    });
  }

  //get the service name from ProfileScreen using props.
  getServiceName() {
    return this.props.sampleString;
  }

  //get the service id from ProfileScreen using props.
  getSheetUrl() {
    return this.props.sheetUrl;
  }

  //get the student's name from ProfileScreen using props.
  getStudentName() {
    return this.props.studentName;
  }

  //randomly generate a pin between 1000 to 9000 (4 digits pin).
  generatePin() {
    var val = Math.floor(1000 + Math.random() * 9000);
    return val;
  }

  //get the date when the QR code is generated.
  getDate() {
    //create day and month variables as Strings.
    var stringDay = "";
    var stringMonth = "";
    //get the day
    var day = new Date().getDate();
    //reformat the date to yyyymmdd for sorting convenience.
    //Fill the tens place of ones digit with 0.
    if (day < 10) {
      stringDay = "0" + day.toString();
    } else {
      stringDay = day.toString();
    }
    //get the month
    var month = new Date().getMonth() + 1;
    //Fill the tens place of ones digit with 0.
    if (month < 10) {
      stringMonth = "0" + month.toString();
    } else {
      stringMonth = month.toString();
    }
    //get year in yyyy format
    var year = new Date().getFullYear();
    //combine year, month, and day to reformat the date to yyyymmdd.
    var date = year.toString() + stringMonth + stringDay;
    return date;
  }

  //writeData() is where the attendance is taken and written in the database.
  writeData() {
    //The write method (set()) is provided by Firebase Realtime Database and React Native Firebase.
    //Mark the user as present in directory services/serviceId/date/name: "present"
    this.databaseRef
      .ref(
        "services/" +
          this.state.sheetUrl +
          "/" +
          this.getDate() +
          "/" +
          this.state.studentName
      )
      .set("present");
  }

  /*
   * onPressGenerate is called when the QR code icon is pressed.
   * The method performs an animation.
   * The method get local variable "distanceCheck" to check if the admin wants distance check.
   * Get the geolocation and encode the coordinate into the QR code.
   */

  onPressGenerate = () => {
    //run the animation, expand from minHeight to maxHeight.
    let initialValue = this.state.expanded
      ? this.state.maxHeight + this.state.minHeight
      : this.state.minHeight;
    let finalValue = this.state.expanded
      ? this.state.minHeight
      : this.state.maxHeight + this.state.minHeight;
    //if the button is not pressed, and the QR code is not generated
    if (this.state.generatePressed == false) {
      if (!this.state.expanded) {
        this.setState({ expanded: true });
        this.state.expandAnim.setValue(initialValue);
        Animated.spring(this.state.expandAnim, {
          toValue: finalValue
        }).start();
      }
      //get the local variable "distanceCheck"
      AsyncStorage.getItem("distanceCheck").then(value => {
        const jsonValue = JSON.parse(value);
        //if the admin wants distanceCheck
        if (jsonValue === "true") {
          //set global variable distanceCheck to 1.
          this.setState({ distanceCheck: "1" });
          //get the current position of admin's device.
          //store latitude and longitude to corresponding global variables.
          navigator.geolocation.getCurrentPosition(
            position => {
              this.setState({
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
                error: null,
                opacity: 100,
                loadingOpacity: 0,
                url: require("../assets/images/close.png"),
                generatePressed: true
              });
            },
            error => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
          //if the admin does not want distanceCheck
        } else if (jsonValue === "false") {
          //set distanceCheck to 0.
          this.setState({ distanceCheck: "0" });
          //set latitude and longitude all to 0 (they are not going to be used)
          this.setState({
            latitude: "0",
            longitude: "0",
            error: null,
            opacity: 100,
            loadingOpacity: 0,
            url: require("../assets/images/close.png"),
            generatePressed: true
          });
          //if the local variable "distanceCheck" is null
        } else {
          //set the distanceCheck to 1 as default.
          this.setState({ distanceCheck: "1" });
          //get the position and set latitude and longitude.
          navigator.geolocation.getCurrentPosition(
            position => {
              this.setState({
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
                error: null,
                opacity: 100,
                loadingOpacity: 0,
                url: require("../assets/images/close.png"),
                generatePressed: true
              });
            },
            error => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        }
      });
      //take attendance of the admin
      this.writeData();
      //generate a pin and store the pin to the global variable.
      //pin will be decoded in the QR code.
      this.setState({
        loadingOpacity: 100,
        pin: this.generatePin().toString()
      });
      //if the button is pressed, and the QR code is generated.
    } else if (this.state.generatePressed == true) {
      //close ServiceLayout, decrease the height to minHeight.
      if (this.state.expanded) {
        this.state.expandAnim.setValue(initialValue);
        Animated.spring(this.state.expandAnim, {
          toValue: finalValue
        }).start();
        //reset all values.
        this.setState({
          opacity: 0,
          loadingOpacity: 0,
          generatePressed: false,
          expanded: false,
          url: require("../assets/images/generate.png")
        });
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.boxStyle, { height: this.state.expandAnim }]}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.textTop}>{this.state.serviceName}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={this.onPressGenerate}
            >
              <Image style={styles.imageButton} source={this.state.url} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Animated.View
              style={[styles.qrCode, { opacity: this.state.opacity }]}
            >
              <QRCode
                value={
                  "attendanceapp," +
                  this.state.latitude +
                  "," +
                  this.state.longitude +
                  "," +
                  this.state.sheetUrl +
                  "," +
                  this.state.distanceCheck +
                  "," +
                  this.state.pin
                }
                size={232.73}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: "center"
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginTop: ((55 * 100) / 360).toString() + "%"
                  }}
                >
                  {"PIN: "} {this.state.pin}
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    );
  }
}

const styles = {
  container: {
    marginTop: 20,
    flex: 1,
    alignItems: "center"
  },
  boxStyle: {
    width: ((325 * 100) / 360).toString() + "%",
    backgroundColor: "white",
    borderRadius: 15,
    flexDirection: "column"
  },
  textTop: {
    paddingTop: 25,
    paddingLeft: 25,
    width: 245,
    color: "rgb(75, 75, 75)",
    fontSize: 16,
    fontWeight: "bold"
  },
  button: {
    paddingTop: 25,
    paddingRight: 25
  },
  imageButton: {
    width: 27.5,
    height: 27.5
  },
  loading: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    marginTop: 160
  },
  qrCode: {
    width: 250,
    height: 250,
    marginTop: ((55 * 100) / 360).toString() + "%",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute"
  }
};
