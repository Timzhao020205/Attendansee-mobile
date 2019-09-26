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
  ActivityIndicator,
  TextInput,
  PixelRatio,
  Modal
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { RNCamera } from "react-native-camera";
import firebase from "react-native-firebase";
import AsyncStorage from "@react-native-community/async-storage";
import EStyleSheet from "react-native-extended-stylesheet";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const themecolor = "#557DFF";
const backgroundColor = "rgba(0, 0, 0, 0.5)";
const scannerColor = "rgba(255, 255, 255, 1)";

type Props = {};

/**
 * Class description
 * ScannerScreen is a class that displays a camera preview and perform the QR code scanning process.
 * ScannerScreen is connected to both Cloud Firestore (user information) and Realtime database (attendance results).
 * When the user scans the correct QR code, the class will connect and write information to the database using information in the QR code.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class ScannerScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The camera setup code is provided by react-native-camera.
    //this.camera is a RNCamera's reference
    this.camera = null;
    this.barcodeCodes = [];
    //The reference setup is provided by Firebase Realtime database and React Native Firebase.
    //this.databaseRef is a Firebase Realtime database Javascript reference.
    this.databaseRef = firebase.database();
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.firestoreRef is a Firebase Cloud Firestore collection "services" Javascript reference.
    this.firestoreRef = firebase.firestore().collection("services");
    this.state = {
      //texts shown in the user interface
      titleText: "Place the QR code inside",
      additionText: "Scanning will start automcatically",
      lightText: "Light",
      //name is a String, first name and last name of the user, used for attendance taking.
      name: "",
      //username is a String, got from the local storage after the user is signed in.
      username: "",
      //isTorchOn is a int, it is the status of the flash light, isTorchOn is 0 when the light is off, 1 when the light is on.
      isTorchOn: 0,
      //responsiveFontSize (big and small) are int, they change due to the screen size.
      responsiveFontSizeBig: 23,
      responsiveFontSizeSmall: 16,
      //modalVisible (pin, attendanceTaken, and attendanceNotTaken) are boolean.
      pinModalVisible: false,
      attendanceTakenVisible: false,
      attendanceNotTakenVisible: false,
      //pin is a String, it is the pin input in the pin modal.
      pin: "",
      //rightPin is a String, it is the pin generated with the QR code.
      rightPin: "",
      //scannerArea is a image source links to assets/image, it is the frame of the QR code scanner area.
      scannerArea: require("../assets/images/area.png"),
      //serviceId is a String, decoded from the QR code.
      serviceId: null,
      //latitude and longitude are doubles, the current position of the user's device.
      latitude: null,
      longitude: null,
      //qrlat and qrlong are Strings, decoded from the QR code.
      qrlat: null,
      qrlong: null,
      //checkDistance is a String, decoded from the QR code.
      checkDistance: null,
      error: null,
      //scanned is a boolean, becomes true when the QR code is scanned.
      scanned: false,
      //Below are special effects of the QR code scanner.
      loadingOpacity: 0,
      torchOpacity: null,
      width: 0,
      height: 0,
      translateAnim: new Animated.Value(0),
      camera: {
        flashMode: RNCamera.Constants.FlashMode.auto,
        barCodeScanned: false
      }
    };
  }

  //When the class is running
  componentDidMount() {
    //start the scanning effect.
    this.startAnimation();
    //get the screen size.
    const pixelRatio = PixelRatio.getPixelSizeForLayoutSize(width);
    //ToastAndroid.show(pixelRatio.toString(), ToastAndroid.SHORT);
    //use the screen size to change the font size.
    if (pixelRatio == 1) {
      this.setState({
        attendanceTakenVisible: 19,
        attendanceNotTakenVisible: 11
      });
    } else if (pixelRatio == 2) {
      this.setState({
        responsiveFontSizeBig: 20,
        responsiveFontSizeSmall: 14
      });
    } else if (pixelRatio == 3) {
      this.setState({
        responsiveFontSizeBig: 23,
        responsiveFontSizeSmall: 16
      });
    } else {
      this.setState({
        responsiveFontSizeBig: 23,
        responsiveFontSizeSmall: 16
      });
    }
    //set other modals to invisible.
    this.setState({
      attendanceTakenVisible: false,
      attendanceNotTakenVisible: false
    });
    //get the local variable "firstname" from the storage
    AsyncStorage.getItem("firstname").then(value => {
      const jsonValueFirstName = JSON.parse(value);
      if (jsonValueFirstName !== null) {
        this.setState({
          name: this.state.name + jsonValueFirstName
        });
      }
    });
    //get the local variable "lastname" from the storage
    AsyncStorage.getItem("lastname").then(value => {
      const jsonValueLastName = JSON.parse(value);
      if (jsonValueLastName !== null) {
        this.setState({
          name: this.state.name + " " + jsonValueLastName
        });
      }
    });
    //get the local variable "username" from the storage
    AsyncStorage.getItem("username").then(value => {
      const jsonValueUsername = JSON.parse(value);
      if (jsonValueUsername !== null) {
        this.setState({
          username: jsonValueUsername
        });
      }
    });
  }

  //refresh() performs a same process to componentDidMount() when there is a change in other classes.
  refresh() {
    this.setState({
      name: ""
    });
    AsyncStorage.getItem("firstname").then(value => {
      const jsonValueFirstName = JSON.parse(value);
      if (jsonValueFirstName !== null) {
        this.setState({
          name: this.state.name + jsonValueFirstName
        });
      }
    });
    AsyncStorage.getItem("lastname").then(value => {
      const jsonValueLastName = JSON.parse(value);
      if (jsonValueLastName !== null) {
        this.setState({
          name: this.state.name + " " + jsonValueLastName
        });
      }
    });
    AsyncStorage.getItem("username").then(value => {
      const jsonValueUsername = JSON.parse(value);
      if (jsonValueUsername !== null) {
        this.setState({
          username: jsonValueUsername
        });
      }
    });
  }

  readData(userId, name, email, imageUrl) {
    this.databaseRef.ref("users/" + userId).set({
      username: name,
      email: email,
      profile_picture: imageUrl
    });
  }

  //The animation of the scanning effect
  startAnimation() {
    //reset the translated part's position to the origin
    this.state.translateAnim.setValue(0);
    //move to the ending position in 1.5 seconds
    Animated.timing(this.state.translateAnim, {
      toValue: 0.9725,
      duration: 1500
    }).start(() => {
      //repeat the animation
      this.startAnimation();
    });
  }

  /*
   * onBarCodeReadAttendance is called when the QR code is detected.
   * The method will decode the data from the QR code and set them to corresponding variable.
   * If the admin requires distance check, calculate the device and QR code distance, then write data to the database.
   * Otherwise write data to the database.
   */

  onBarCodeReadAttendance = e => {
    //this only allows the scanner to scan once on one QR code, if scanned is false, perform the following process
    if (this.state.scanned == false) {
      //set scanned to true, turn off the scanner (not camera preview)
      this.setState({
        scanned: true,
        width: width,
        height: height,
        isTorchOn: 0
      });
      //after 5 seconds, set the scanner back on
      setTimeout(() => {
        this.setState({ scanned: false });
      }, 5000);
      //get substrings from the QR code's data
      //verify is to verify if the QR code scanned from the QR code generator of the app
      var verify = this.getSubstring(e.data, 0);
      //if the QR code is generated from the app
      if (verify === "attendanceapp") {
        //get all values from the QR code and set them to different variables
        //latitude is on the index 1 of the data
        var lat = this.getSubstring(e.data, 1);
        //longitude is on the index 2 of the data
        var long = this.getSubstring(e.data, 2);
        //sheetUrl (service id) is on the index 3 of the data
        var sheetUrl = this.getSubstring(e.data, 3);
        //checkDistance is on the index 4 of the data
        var checkDistance = this.getSubstring(e.data, 4);
        //pin is on the index 5 of the data
        var pin = this.getSubstring(e.data, 5);
        //rightPin is the pin generated from the admin's device
        this.setState({ rightPin: pin });
        //setup global variables
        this.setState({
          serviceId: sheetUrl,
          qrlat: lat,
          qrlong: long,
          checkDistance: checkDistance
          //pinModalVisible: true
        });
        //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
        //The joinRef becomes the query of Cloud Firestore where the service id equals to sheetUrl.
        var joinedRef = this.firestoreRef.where("id", "==", sheetUrl);
        joinedRef
          .get()
          .then(querySnapshot => {
            //Get each (forEach()) document of the query result.
            querySnapshot.forEach(doc => {
              //Get "leaders" and "students" field from the document,
              //these fields display people who are involved in the service.
              const { id, key, leaders, name, students, url } = doc.data();
              //Check if the student is already enrolled.
              //if not,
              if (
                !leaders.includes(this.state.username) &&
                !students.includes(this.state.username)
              ) {
                //display the enrollment modal, modal where users enter the generated PIN to confirm the enrollment.
                this.setState({
                  pinModalVisible: true
                });
                //if the student is in,
              } else if (
                leaders.includes(this.state.username) ||
                students.includes(this.state.username)
              ) {
                //Check if the service leaders requires distance check,
                //distance check is to get distance between the QR code and the device to prevent cheating.
                //distanceCheck is a numerical String located at the index 4 in the data from the QR code.
                var distanceCheck = this.getSubstring(e.data, 4);
                this.setState({
                  loadingOpacity: 100
                });
                //if the service leader wants distance check,
                if (distanceCheck == 1) {
                  //get the current position of the user's device (location permission required)
                  navigator.geolocation.getCurrentPosition(
                    position => {
                      this.setState({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        error: null
                      });
                      //Call method getDistance(), the QR code's coordinate and the device's coordinate are in the parameter.
                      var distance = this.getDistance(
                        lat,
                        long,
                        this.state.latitude,
                        this.state.longitude
                      );
                      //Returned value from getDistance() is in km,
                      //multiply by 1000 to convert it to m
                      distance = distance * 1000;
                      this.setState({
                        loadingOpacity: 0
                      });
                      //if the distance is smaller than 15 m
                      if (distance <= 15) {
                        //method writeData() does the attendance taking process, writing data to the database.
                        this.writeData();
                        /*ToastAndroid.show(
                          "Attendance taken, " +
                            distance.toString() +
                            " meters",
                          ToastAndroid.SHORT
                        );*/
                        //Notify the user that the attendance is taken.
                        this.setState({
                          attendanceTakenVisible: true
                        });
                        this.camera.resumePreview();
                        //if the distance is larger than 15 m
                      } else if (distance > 15) {
                        this.setState({
                          width: 0,
                          height: 0
                        });
                        /*ToastAndroid.show(
                          "Scan inside 15 meters, you are " +
                            distance.toString() +
                            " meters away",
                          ToastAndroid.SHORT
                        );*/
                        //Notify the user that the attendance is not taken because it is too far away.
                        this.setState({
                          attendanceNotTakenVisible: true
                        });
                        this.camera.resumePreview();
                      }
                      this.setState({
                        latitude: null,
                        longitude: null,
                        error: null,
                        width: 0,
                        height: 0
                      });
                    },
                    error => this.setState({ error: error.message }),
                    {
                      enableHighAccuracy: true,
                      timeout: 20000,
                      maximumAge: 1000
                    }
                  );
                  //if the service leader does not require distance check,
                } else if (distanceCheck == 0) {
                  this.setState({
                    loadingOpacity: 0,
                    width: 0,
                    height: 0
                  });
                  //method writeData() does the attendance taking process, writing data to the database.
                  this.writeData();
                  //Notify the user that the attendance is taken.
                  ToastAndroid.show("Attendance taken", ToastAndroid.SHORT);
                  this.setState({
                    attendanceTakenVisible: true
                  });
                  this.camera.resumePreview();
                  //this.props.navigation.navigate("Checked");
                }
              }
            });
          })
          .catch(function(error) {
            console.log("Error getting documents: ", error);
          });
      } else {
        ToastAndroid.show(e.data.toString(), ToastAndroid.SHORT);
      }
    }
  };

  /*
   * getSubstring() method uses Javascript String.split()[] method,
   * The method splits a series of texts separated by "," into individual text.
   */

  getSubstring(input, pos) {
    var substring = input.split(",")[pos];
    return substring;
  }

  /*
   * getDistance() calculates the distance between the admin's device (QR code) and the user's device using the Haversine formula.
   * The distance calculation algorithm is provided by https://www.movable-type.co.uk/scripts/latlong.html
   * latitude 1 and longitude 1 are the coordinate of the QR code,
   * latitude 2 and longitude 2 are the coordinate of the user's device.
   */

  getDistance(latitude1, longitude1, latitude2, longitude2) {
    if (latitude1 == latitude2 && longitude1 == longitude2) {
      return 0;
    } else {
      //Convert 2 latitudes to radians.
      var radlatitude1 = (Math.PI * latitude1) / 180;
      var radlatitude2 = (Math.PI * latitude2) / 180;
      //Get the difference between longitude 1 and longitude 2.
      var theta = longitude1 - longitude2;
      //Convert theta to radian.
      var radtheta = (Math.PI * theta) / 180;
      //Calculation
      var distance =
        Math.sin(radlatitude1) * Math.sin(radlatitude2) +
        Math.cos(radlatitude1) * Math.cos(radlatitude2) * Math.cos(radtheta);
      if (distance > 1) {
        distance = 1;
      }
      distance = Math.acos(distance);
      distance = (distance * 180) / Math.PI;
      distance = distance * 60 * 1.1515;
      distance = distance * 1.609344;
      return distance;
    }
  }

  //joinService method does the enrollment process.
  joinService = () => {
    //if the input pin matches the pin generated.
    if (this.state.pin === this.state.rightPin) {
      //notify the user that the pin matches.
      ToastAndroid.show(
        "pin correct, you are in the service.",
        ToastAndroid.SHORT
      );
      //close pin modal and reset the pin.
      this.setState({
        pinModalVisible: false,
        pin: ""
      });
      //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
      //studentRef becomes the query result of Cloud Firestore.
      var studentsRef = this.firestoreRef.where(
        "id",
        "==",
        this.state.serviceId
      );
      //The fetch method (get()) is provided by Firebase Cloud Firestore and React Native Firebase.
      //Get all data queried from the database.
      studentsRef.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          //The update method (update()) is provided by Firebase Cloud Firestore and React Native Firebase.
          //Add the user's username to students array in the service document.
          this.firestoreRef.doc(doc.id).update({
            students: firebase.firestore.FieldValue.arrayUnion(
              this.state.username
            )
          });
          //method takeAttendance() does the same thing to onBarCodeReadAttendance.
          this.takeAttendance();
        });
      });
    } else {
      ToastAndroid.show("pin incorrect", ToastAndroid.SHORT);
    }
  };

  //method takeAttendance() does the same thing to onBarCodeReadAttendance; however, it is called after the user enrolled.
  //Any confusion, please view onBarCodeReadAttendance.
  takeAttendance() {
    this.setState({
      loadingOpacity: 100
    });
    if (this.state.checkDistance == 1) {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          });
          var distance = this.getDistance(
            this.state.qrlat,
            this.state.qrlong,
            this.state.latitude,
            this.state.longitude
          );
          distance = distance * 1000;
          this.setState({
            loadingOpacity: 0
          });
          if (distance <= 15) {
            this.writeData();
            /*ToastAndroid.show(
              "Attendance taken, " + distance.toString() + " meters",
              ToastAndroid.SHORT
            );*/
            this.setState({
              attendanceTakenVisible: true
            });
            this.camera.resumePreview();
          } else if (distance > 15) {
            this.setState({
              width: 0,
              height: 0
            });
            /*ToastAndroid.show(
              "Scan inside 15 meters, you are " +
                distance.toString() +
                " meters away",
              ToastAndroid.SHORT
            );*/
            this.setState({
              attendanceNotTakenVisible: true
            });
            this.camera.resumePreview();
          }
          this.setState({
            latitude: null,
            longitude: null,
            error: null,
            width: 0,
            height: 0
          });
        },
        error => this.setState({ error: error.message }),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );
    } else if (this.state.checkDistance == 0) {
      this.setState({
        loadingOpacity: 0,
        width: 0,
        height: 0
      });
      this.writeData();
      //ToastAndroid.show("Attendance taken", ToastAndroid.SHORT);
      this.setState({
        attendanceNTakenVisible: true
      });
      this.camera.resumePreview();
      //this.props.navigation.navigate("Checked");
    }
  }

  //writeData() is where the attendance is taken and written in the database.
  writeData() {
    //The write method (set()) is provided by Firebase Realtime Database and React Native Firebase.
    //Mark the user as present in directory services/serviceId/date/name: "present"
    this.databaseRef
      .ref(
        "services/" +
          this.state.serviceId +
          "/" +
          this.getDate() +
          "/" +
          this.state.name
      )
      .set("present");
  }

  //Method getDate() convert the date to the format "yyyymmdd"
  getDate() {
    //Create Strings of day, month, and year.
    var stringDay = "";
    var stringMonth = "";
    //Get the current date.
    var day = new Date().getDate();
    //Fill the tens place of ones digit with 0.
    if (day < 10) {
      stringDay = "0" + day.toString();
    } else {
      stringDay = day.toString();
    }
    //Fill the tens place of ones digit with 0.
    var month = new Date().getMonth() + 1;
    if (month < 10) {
      stringMonth = "0" + month.toString();
    } else {
      stringMonth = month.toString();
    }
    //Get the current year.
    var year = new Date().getFullYear();
    //Put year, month, and day together to format "yyyymmdd".
    var date = year.toString() + stringMonth + stringDay;
    return date;
  }

  //Control the flash light
  onPressFlashLight = () => {
    //if the flash light is off
    if (this.state.isTorchOn == 0) {
      //turn the flash light on
      this.setState({
        isTorchOn: 2
      });
      //if the flash light is on
    } else if (this.state.isTorchOn == 2) {
      //turn the flash light on
      this.setState({
        isTorchOn: 0
      });
    }
  };

  //Close the view of attendance taken
  closeAttendanceTakenModal = () => {
    this.setState({
      attendanceTakenVisible: false
    });
  };

  //Close the view of attendance not taken
  closeAttendanceNotTakenModal = () => {
    this.setState({
      attendanceNotTakenVisible: false
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType={this.state.animationType}
          transparent={true}
          visible={this.state.pinModalVisible}
          onRequestClose={() => {
            this.setState({
              pinModalVisible: false
            });
          }}
        >
          <View
            style={{
              marginTop: (height - 250) / 2,
              marginLeft: (width - 325) / 2,
              backgroundColor: "white",
              width: 325,
              height: 250,
              borderRadius: 15
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "black",
                paddingTop: 20,
                paddingLeft: 25
              }}
            >
              {"New to the service?"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                width: 300,
                fontWeight: "bold",
                color: "black",
                marginTop: 16,
                paddingLeft: 25
              }}
            >
              {"Enter the PIN shown on the service leader's device"}
            </Text>
            <View
              style={{
                flex: 1,
                alignItems: "center"
              }}
            >
              <TextInput
                style={{
                  height: 55,
                  width: 75,
                  paddingLeft: 15,
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 4
                }}
                maxLength={4}
                placeholder={"PIN"}
                onChangeText={pin => this.setState({ pin })}
                value={this.state.pin}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  height: 55,
                  width: 325,
                  marginTop: 5
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 250,
                    height: 55,
                    backgroundColor: themecolor,
                    borderRadius: 100,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onPress={this.joinService}
                  activeOpacity={0.9}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "white",
                      paddingBottom: 3
                    }}
                  >
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.attendanceTakenVisible}
          onRequestClose={() => {
            this.setState({
              attendanceTakenVisible: false
            });
          }}
        >
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
                color: themecolor,
                paddingTop: height / 3
              }}
            >
              Attendance Taken
            </Text>
            <TouchableOpacity
              onPress={this.closeAttendanceTakenModal}
              style={{ marginTop: 250 }}
            >
              <View>
                <Text style={{ fontSize: 21, fontWeight: "bold" }}>Back</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.attendanceNotTakenVisible}
          onRequestClose={() => {
            this.setState({
              attendanceNotTakenVisible: false
            });
          }}
        >
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
                color: "#FF0048",
                paddingTop: height / 3
              }}
            >
              Attendance Not Taken
            </Text>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 25,
                textAlign: "center"
              }}
            >
              You must be next to the QR code
            </Text>

            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 10,
                textAlign: "center"
              }}
            >
              to have your attendance taken
            </Text>
            <TouchableOpacity
              onPress={this.closeAttendanceNotTakenModal}
              style={{ marginTop: 170 }}
            >
              <View>
                <Text style={{ fontSize: 21, fontWeight: "bold" }}>Back</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={StyleSheet.absoluteFill}
          type={RNCamera.Constants.Type.back}
          flashMode={this.state.isTorchOn}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={this.onBarCodeReadAttendance}
          captureAudio={false}
        >
          <View style={styles.topView}>
            <Text
              style={[
                styles.helperTitleText,
                { fontSize: this.state.responsiveFontSizeBig }
              ]}
            >
              {this.state.titleText}
            </Text>
            <Text
              style={[
                styles.helperText,
                { fontSize: this.state.responsiveFontSizeSmall }
              ]}
            >
              {this.state.additionText}
            </Text>
          </View>
          <View
            style={[styles.middleView, { justifyContent: "space-between" }]}
          >
            <View style={styles.sideViews} />
            <View
              style={{
                width: ((245 * 100) / 360).toString() + "%",
                aspectRatio: 1,
                justifyContent: "space-between"
              }}
            >
              <View style={styles.spaceBetween}>
                <View style={styles.fillGapView} />
                <View style={styles.fillGapView} />
              </View>
              <View style={styles.spaceBetween}>
                <View style={styles.fillGapView} />
                <View style={styles.fillGapView} />
              </View>
            </View>
            <View style={styles.sideViews} />
          </View>
          <View style={styles.bottomView}>
            <TouchableOpacity
              style={{ opacity: this.state.torchOpacity }}
              onPress={this.onPressFlashLight}
            >
              <Image
                style={styles.lightStyle}
                source={require("../assets/images/flash.png")}
              />
              <Text
                style={[
                  styles.lightHelperText,
                  { fontSize: this.state.responsiveFontSizeSmall }
                ]}
              >
                {this.state.lightText}
              </Text>
            </TouchableOpacity>
          </View>
        </RNCamera>
        <View
          style={{
            width: this.state.width,
            height: this.state.height,
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            opacity: this.state.loadingOpacity
          }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <ImageBackground
            style={{
              width: (250 / 360) * width,
              aspectRatio: 1,
              top: "27.8%",
              alignItems: "center"
            }}
            source={this.state.scannerArea}
          >
            <Animated.View
              style={[
                { width: "98%", height: "8%", marginBottom: 10 },
                {
                  transform: [
                    {
                      translateY: this.state.translateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 229]
                      })
                    }
                  ]
                }
              ]}
            >
              <Image
                style={{ width: "100%", height: "90%" }}
                source={require("../assets/images/effect.png")}
              />
              <Image
                style={{
                  width: "100%",
                  height: "10%",
                  backgroundColor: scannerColor
                }}
              />
            </Animated.View>
          </ImageBackground>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1
  },
  cameraView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  helperTitleText: {
    color: "rgba(255, 255, 255, 1)",
    fontWeight: "bold",
    marginBottom: 6
  },
  helperText: {
    fontWeight: "500",
    color: "rgba(235, 235, 235, 1)",
    marginBottom: 60
  },
  arrowStyle: {
    width: 28,
    height: 28,
    marginBottom: 17.5,
    borderRadius: 0,
    resizeMode: "contain"
  },
  topView: {
    width: "100%",
    height: ((212.39 * 100) / 755).toString() + "%",
    backgroundColor: backgroundColor,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  middleView: {
    width: "100%",
    height: (245 / 360) * width,
    flexDirection: "row"
  },
  sideViews: {
    width: ((57.5 * 100) / 360).toString() + "%",
    height: "100%",
    backgroundColor: backgroundColor
  },
  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  fillGapView: {
    width: 5.5,
    height: 5.5,
    backgroundColor: backgroundColor
  },
  bottomView: {
    flex: 1,
    backgroundColor: backgroundColor,
    alignItems: "center",
    justifyContent: "center"
  },
  lightStyle: {
    width: 48,
    height: 48,
    borderRadius: 0
  },
  lightHelperText: {
    fontWeight: "500",
    color: "rgba(235, 235, 235, 1)",
    textAlign: "center",
    marginTop: 5
  }
};

EStyleSheet.build({
  $textColor: "white",
  $rem: width / 380
});

const extendedStyles = EStyleSheet.create({
  text: {
    color: "$textColor",
    fontSize: "23rem",
    fontWeight: "bold",
    marginBottom: 6
  }
});
