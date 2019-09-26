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
  Modal,
  TouchableOpacity,
  Image,
  ImageBackground,
  Animated,
  ActivityIndicator,
  ScrollView,
  TextInput,
  RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import firebase from "react-native-firebase";
import { createAppContainer, createStackNavigator } from "react-navigation";
import ScannerScreen from "./ScannerScreen";
import ServiceLayout from "../components/ServiceLayout";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const themecolor = "#557DFF";
let _this;

type Props = {};

/**
 * Class description
 * ProfileScreen is a class that displays the user's profile and what services they are leading.
 * ProfileScreen is only connected to Cloud Firestore (user and service information).
 * ProfileScreen will display ServiceLayouts.
 */

//All invoked methods in the class that are not credited specifically are provided by React and React Native.
export default class ProfileScreen extends Component<Props> {
  constructor(props) {
    super(props);
    //The reference setup is provided by Firebase Realtime database and React Native Firebase.
    //this.databaseRef is a Firebase Realtime database Javascript reference.
    this.databaseRef = firebase.database();
    //The reference setup is provided by Firebase Cloud Firestore and React Native Firebase.
    //this.firestoreRef is a Firebase Cloud Firestore collection "services" Javascript reference.
    this.firestoreRef = firebase.firestore().collection("services");
    this.state = {
      //firstname, lastname are Strings, values come from the local storage.
      firstname: "",
      lastname: "",
      //fullname is a String, it is the combination firstname and lastname, it will be displayed in the profile.
      fullname: "",
      //position is a String, it will be "Student" for now.
      position: "Student",
      //grade and username are Strings, values come from the local storage.
      grade: "",
      username: "",
      //id is the service id
      id: "",
      //key is the service key, the users need the key to upgrade them to service leaders.
      key: "",
      //serviceName and serviceId will be in the parameter when initiating a ServiceLayout class.
      serviceName: "",
      serviceId: "",
      //all information of a service when creating a new service.
      newServiceName: "",
      newServiceId: "",
      newServiceKey: "",
      //students cannot create service without the school permission.
      //the organization can give students they school name and key in order to create a new service.
      newServiceSchool: "",
      schoolKey: "",
      animationType: "slide",
      //status of events
      refreshing: false,
      addPressedOnce: false,
      createPressedOnce: false,
      //if there is any error returned.
      error: null,
      //reset the animation value to 0.
      expandAnim: new Animated.Value(0),
      //opacity is a int, it is the opacity of some components.
      opacity: 0,
      loadingOpacity: 0,
      //status of generate button.
      generatePressed: false,
      //viewArray is a ServiceLayout array.
      viewArray: [],
      //the default size of array.
      defaultLayoutNumber: 0,
      //ModalVisible is boolean, it is the visibility of some modals.
      addServiceModalVisible: false,
      createServiceModalVisible: false,
      //opacity is int, they are the opacity of some components.
      layoutOpacity: 0,
      indicatorOpacity: 100,
      indicatorHeight: 0,
      indicatorPaddingTop: 50,
      //image icons sources.
      url: require("../assets/images/generate.png"),
      addUrl: require("../assets/images/add.png"),
      closeUrl: require("../assets/images/close.png")
    };
    //arrayValueIndex is a int, it is 0 default.
    this.arrayValueIndex = 0;
  }

  //When the class is running
  componentDidMount() {
    //set _this (because "this" won't work in function())
    _this = this;
    //reset sizes and opacity of some components.
    this.setState({
      layoutOpacity: 0,
      indicatorOpacity: 100,
      indicatorHeight: 0,
      indicatorPaddingTop: 50
    });

    //Use AsyncStorage to access local variables from the device and save them in corresponding variables.
    AsyncStorage.getItem("firstname").then(value => {
      const jsonValueFirstName = JSON.parse(value);
      if (jsonValueFirstName !== null) {
        this.setState({
          firstname: jsonValueFirstName
        });
      }
    });

    AsyncStorage.getItem("lastname").then(value => {
      const jsonValueLastName = JSON.parse(value);
      if (jsonValueLastName !== null) {
        this.setState({
          lastname: jsonValueLastName,
          fullname: this.state.firstname + " " + jsonValueLastName
        });
      }
    });

    AsyncStorage.getItem("grade").then(value => {
      const jsonValueGrade = JSON.parse(value);
      if (jsonValueGrade !== null) {
        this.setState({
          grade: jsonValueGrade
        });
      }
    });

    AsyncStorage.getItem("username").then(value => {
      const jsonValueUsername = JSON.parse(value);
      if (jsonValueUsername !== null) {
        this.setState({
          username: jsonValueUsername
        });
        //this.createOnStart();
      }
    });
  }

  //show the add service modal when add button is clicked.
  addService = () => {
    this.setState({
      addServiceModalVisible: true
    });
  };

  //show the create service modal when the create link in add service modal is clicked.
  creatService = () => {
    this.setState({
      addServiceModalVisible: false,
      createServiceModalVisible: true
    });
  };

  //close the add service modal, and reset variables relates to the modal.
  closeAddServiceModal() {
    this.setState({
      id: "",
      key: "",
      addServiceModalVisible: false,
      addPressedOnce: false
    });
  }

  //close the add service modal when close button is clicked, and reset variables relates to the modal.
  onPressCloseAddServiceModal = () => {
    this.setState({
      id: "",
      key: "",
      addServiceModalVisible: false,
      addPressedOnce: false
    });
  };

  //close the create service modal, and reset variables relates to the modal.
  closeCreatServiceModal() {
    this.setState({
      newServiceName: "",
      newServiceKey: "",
      newServiceSchool: "",
      schoolKey: "",
      createServiceModalVisible: false,
      createPressedOnce: false
    });
  }

  //close the create service modal when close button is clicked, and reset variables relates to the modal.
  onPressCloseCreatServiceModal = () => {
    this.setState({
      newServiceName: "",
      newServiceKey: "",
      newServiceSchool: "",
      schoolKey: "",
      createServiceModalVisible: false,
      createPressedOnce: false
    });
  };

  //create service layouts when the class is running.
  createOnStart() {
    //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
    //The serviceRef becomes the query result of Cloud Firestore (where the user is the service's leader).
    var serviceRef = this.firestoreRef.where(
      "leaders",
      "array-contains",
      this.state.username
    );
    //Get the snapshot from the query result.
    serviceRef
      .get()
      .then(querySnapshot => {
        this.setState({
          layoutOpacity: 100,
          indicatorOpacity: 0,
          indicatorHeight: 0,
          indicatorPaddingTop: 0
        });
        //Read each document queried from the database
        querySnapshot.forEach(doc => {
          //Get the service name and id from each document
          const { id, key, leaders, name } = doc.data();
          //save the name and id to global variables.
          this.setState({
            serviceName: id + "  -  " + name,
            serviceId: id
          });
          //Create a new service layout
          this.createNewView();
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  //reset the user interface and refresh the user's information.
  refreshInfo() {
    //remove all service layout be resetting the view array.
    this.setState({ viewArray: [] });
    //set _this (because "this" won't work in function())
    _this = this;
    //reset sizes and opacity of some components.
    this.setState({
      layoutOpacity: 0,
      indicatorOpacity: 100,
      indicatorHeight: 0,
      indicatorPaddingTop: 50
    });

    //Use AsyncStorage to access local variables from the device and save them in corresponding variables.
    AsyncStorage.getItem("firstname").then(value => {
      const jsonValueFirstName = JSON.parse(value);
      if (jsonValueFirstName !== null) {
        this.setState({
          firstname: jsonValueFirstName
        });
      }
    });

    AsyncStorage.getItem("lastname").then(value => {
      const jsonValueLastName = JSON.parse(value);
      if (jsonValueLastName !== null) {
        this.setState({
          lastname: jsonValueLastName,
          fullname: this.state.firstname + " " + jsonValueLastName
        });
      }
    });

    AsyncStorage.getItem("grade").then(value => {
      const jsonValueGrade = JSON.parse(value);
      if (jsonValueGrade !== null) {
        this.setState({
          grade: jsonValueGrade
        });
      }
    });

    AsyncStorage.getItem("username").then(value => {
      const jsonValueUsername = JSON.parse(value);
      if (jsonValueUsername !== null) {
        this.setState({
          username: jsonValueUsername
        });
        this.createOnStart();
      }
    });
  }

  //perform the same task to createOnStart(), but only called by _onRefresh (user scroll up and refresh the page).
  createOnRefresh() {
    var serviceRef = this.firestoreRef.where(
      "leaders",
      "array-contains",
      this.state.username
    );
    serviceRef
      .get()
      .then(querySnapshot => {
        this.setState({
          layoutOpacity: 100,
          indicatorOpacity: 0,
          indicatorHeight: 0,
          indicatorPaddingTop: 0
        });
        querySnapshot.forEach(doc => {
          const { id, key, leaders, name } = doc.data();
          this.setState({
            serviceName: id + "  -  " + name,
            serviceId: id
          });
          this.createNewView();
        });
      })
      .then(function() {
        _this.setState({
          refreshing: false
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  /*
   * searchAdd is called when the add icon is clicked.
   * Users can input the service's id and key to upgrade them to admins (service leaders)
   * Once the id and key are correct, the username will be saved to "leaders" array in the service document in the database.
   * New service layout with this service's information will be created.
   */

  searchAdd = () => {
    if (!this.state.addPressedOnce) {
      this.setState({
        addPressedOnce: true
      });
      //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
      //The leadersRef becomes the query result of Cloud Firestore where the service's id matches inputted id.
      var leadersRef = this.firestoreRef.where("id", "==", this.state.id);
      //Get snapshot from leadersRef
      leadersRef
        .get()
        .then(querySnapshot => {
          //if the snapshot has a size of 0, it means there is no match and the service does not exist.
          if (querySnapshot.size == 0) {
            ToastAndroid.show("Service doesn't exist", ToastAndroid.SHORT);
            this.setState({
              addPressedOnce: false
            });
            //if the snapshot has a size more than 0, it means there is such service
          } else {
            //ToastAndroid.show("Service exists", ToastAndroid.SHORT);
            //get each service document (only 1).
            querySnapshot.forEach(doc => {
              //create corresponding variables for each field in the document.
              const { id, key, leaders, name, students } = doc.data();
              //if the service key from the database matches the inputted key,
              if (key === this.state.key) {
                //ToastAndroid.show("Service found", ToastAndroid.SHORT);
                //call the method closeAddServiceModal() to close the modal.
                this.closeAddServiceModal();
                //check if the user is already the admin (service leader).
                //if the username is included in "leaders" array (the user is already a leader).
                if (leaders.includes(this.state.username)) {
                  //notify the user.
                  ToastAndroid.show(
                    "Your are already a service leader",
                    ToastAndroid.SHORT
                  );
                  //if the user is not yet the admin (username not included in the array).
                } else if (!leaders.includes(this.state.username)) {
                  //check if the user enrolled the service already
                  //if the username is included in "students" array (the user is already enrolled).
                  if (students.includes(this.state.username)) {
                    //The update method (update()) is provided by Firebase Cloud Firestore and React Native Firebase.
                    //upgrade the user from student to admin.
                    //remove the username from "students" array.
                    //add the username to "leaders" array.
                    this.firestoreRef.doc(doc.id).update({
                      students: firebase.firestore.FieldValue.arrayRemove(
                        this.state.username
                      ),
                      leaders: firebase.firestore.FieldValue.arrayUnion(
                        this.state.username
                      )
                    });
                    //if the student is not enrolled yet.
                  } else {
                    //add the username to "leaders" array.
                    this.firestoreRef.doc(doc.id).update({
                      leaders: firebase.firestore.FieldValue.arrayUnion(
                        this.state.username
                      )
                    });
                  }
                  //get the service's id and name, and add it to the global variable serviceName.
                  //get set serviceId id.
                  this.setState({
                    serviceName: id + "  -  " + name,
                    serviceId: id,
                    addPressedOnce: false
                  });
                  //create a new service layout.
                  this.createNewView();
                }
                //if the inputted key does not match with the service's key
              } else {
                //notify the user that the key is incorrect.
                ToastAndroid.show("Incorrect key", ToastAndroid.SHORT);
                this.setState({
                  addPressedOnce: false
                });
              }
            });
          }
        })
        .catch(function(error) {
          this.setState({
            addPressedOnce: false
          });
          console.log("Error getting documents: ", error);
        });
    }
  };

  /*
   * creatNewService is called when the create new service link in add service modal is clicked.
   * Users can input the service's name, key and organization's (school's) name and key.
   * It requires the organization's name and key because any service in the app must be officially assigned by the school.
   * After the school create a new service, it will create a new service layout and display in ProfileScreen.
   */

  creatNewService = () => {
    if (!this.state.createPressedOnce) {
      this.setState({
        createPressedOnce: true
      });
      //do the format check
      //make sure the service name is not empty
      if (this.state.newServiceName !== "") {
        //check if the service key is a 4 characters pin and each character is digit.
        if (
          this.state.newServiceKey.length == 4 &&
          !isNaN(this.state.newServiceKey)
        ) {
          //The query method (where()) is provided by Firebase Cloud Firestore and React Native Firebase.
          //The schoolRef becomes the query result of Cloud Firestore,
          //where the inputted school name matches the existed school name in the database.
          var schoolRef = firebase
            .firestore()
            .collection("keys")
            .where("name", "==", this.state.newServiceSchool);
          //get the query snapshot from schoolRef
          schoolRef.get().then(querySnapshot => {
            //if the size of the query snapshot is 0,
            //the organization (school) does not exist
            if (querySnapshot.size == 0) {
              this.setState({
                createPressedOnce: false
              });
              //notify and request the user to input a correct school name.
              ToastAndroid.show(
                "The organization name does not exist, please ask for the correct organization name and key in order to create a new activity.",
                ToastAndroid.SHORT
              );
            }
            //get each document from the query snapshot
            querySnapshot.forEach(doc => {
              //get the key of the document
              const { name, key } = doc.data();
              //if the inputted key matches the key from the database
              if (this.state.schoolKey === key) {
                //close the create service modal
                this.setState({
                  createServiceModalVisible: false
                });
                //this.closeCreatServiceModal();
                //The ordering method (orderBy()) is provided by Firebase Cloud Firestore and React Native Firebase.
                //order the service's id from largest to smallest (because each service's id is auto-generated)
                var serviceRef = this.firestoreRef
                  .orderBy("intId", "desc")
                  .limit(1);
                //The fetch method (get()) is provided by Firebase Cloud Firestore and React Native Firebase.
                //Get all data queried from the database.
                serviceRef
                  .get()
                  .then(querySnapshot => {
                    //if the size of the query snapshot is larger than 0
                    if (querySnapshot.size > 0) {
                      //get the latest(largest) id of the query snapshot
                      querySnapshot.forEach(doc => {
                        const {
                          id,
                          key,
                          leaders,
                          intId,
                          name,
                          url
                        } = doc.data();
                        //Add the id integer of the latest id by 1
                        var largestId = intId + 1;
                        //convert the id to String.
                        var serviceId = largestId.toString();
                        //format the string of the id.
                        if (largestId < 10) {
                          serviceId = "000" + serviceId;
                        } else if (largestId >= 10 && largestId < 100) {
                          serviceId = "00" + serviceId;
                        } else if (largestId >= 100 && largestId < 1000) {
                          serviceId = "0" + serviceId;
                        }
                        //ToastAndroid.show(this.state.newServiceName, ToastAndroid.SHORT);
                        //The adding method (add()) is provided by Firebase Cloud Firestore and React Native Firebase.
                        //create a new service document with inputted name, generated id, inputted key.
                        //add the user to "leaders" array to add them as the admin in the beginning.
                        this.firestoreRef.add({
                          id: serviceId,
                          intId: largestId,
                          key: this.state.newServiceKey,
                          leaders: firebase.firestore.FieldValue.arrayUnion(
                            this.state.username
                          ),
                          name: this.state.newServiceName,
                          //url: "",
                          students: []
                        });
                        //set the service's name and id to corresponding global variables.
                        this.setState({
                          createPressedOnce: false,
                          serviceName:
                            serviceId + "  -  " + this.state.newServiceName,
                          serviceId: serviceId
                        });
                        //close the create service modal
                        this.closeCreatServiceModal();
                        //create a new service layout with preset global variables.
                        this.createNewView();
                      });
                    } else {
                      //this add service when the database is empty (not used anymore)
                      //performs the same to lines above.
                      this.firestoreRef.add({
                        id: "0001",
                        intId: 1,
                        key: this.state.newServiceKey,
                        leaders: firebase.firestore.FieldValue.arrayUnion(
                          this.state.username
                        ),
                        name: this.state.newServiceName,
                        //url: "",
                        students: []
                      });
                      this.setState({
                        createPressedOnce: false,
                        serviceName:
                          serviceId + "  -  " + this.state.newServiceName,
                        serviceId: serviceId
                      });
                      this.closeCreatServiceModal();
                      this.createNewView();
                    }
                  })
                  .catch(function(error) {
                    this.setState({
                      createPressedOnce: false
                    });
                    console.log("Error getting documents: ", error);
                  });
              } else {
                this.setState({
                  createPressedOnce: false
                });
                ToastAndroid.show(
                  "School key is not correct",
                  ToastAndroid.SHORT
                );
              }
            });
          });
          //if the inputted key has a wrong format (not numerical or more than 4 characters),
        } else {
          this.setState({
            createPressedOnce: false
          });
          //notify users to input the key correctly.
          ToastAndroid.show(
            "Service key does not meet the requirement",
            ToastAndroid.SHORT
          );
        }
        //if the service name input field is empty,
      } else {
        this.setState({
          createPressedOnce: false
        });
        //notify the user.
        ToastAndroid.show("Service name cannot be empty", ToastAndroid.SHORT);
      }
    }
  };

  //_onRefresh is called when the user scroll up
  _onRefresh = () => {
    //reset the view array, clean service layouts.
    this.setState({ refreshing: true, viewArray: [] });
    this.createOnRefresh();
    /*this.fetchData().then(() => {
      this.setState({refreshing: false});
    });*/
  };

  //createNewView is called when the user add or create a service.
  //it create a new ServiceLayout object with parameters.
  createNewView = () => {
    //newValue is the new index of the array
    let newValue = { arrayValueIndex: this.arrayValueIndex };
    //update viewArray's key to the newValue (new index)
    //increase the array index by 1
    //Apply map function on valueArray state array variable and matching current element’s key with updated ths.index variables’value.
    //If it matches then create a ServiceLayout.
    this.setState(
      {
        viewArray: [...this.state.viewArray, newValue]
      },
      () => {
        this.arrayValueIndex = this.arrayValueIndex + 1;
        this.setState();
        var savelayoutNumber = this.arrayValueIndex - 1;
      }
    );
  };

  render() {
    let renderAddView = this.state.viewArray.map((item, key) => {
      if (key == this.arrayValueIndex) {
        //create a new ServiceLayout object with service name, id, student name,
        //and key (key here is not service key, it is the index of the array)
        return (
          <ServiceLayout
            sampleString={this.state.serviceName}
            sheetUrl={this.state.serviceId}
            studentName={this.state.fullname}
            key={key}
          />
        );
      } else {
        return (
          <ServiceLayout
            sampleString={this.state.serviceName}
            sheetUrl={this.state.serviceId}
            studentName={this.state.fullname}
            key={key}
          />
        );
      }
    });
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        <Modal
          animationType={this.state.animationType}
          transparent={true}
          visible={this.state.addServiceModalVisible}
          onRequestClose={() => {
            this.setState({
              id: "",
              key: "",
              addServiceModalVisible: false
            });
          }}
        >
          <View
            style={{
              marginTop: (height - 360) / 2,
              marginLeft: (width - 325) / 2,
              backgroundColor: "white",
              width: 325,
              height: 360,
              borderRadius: 15
            }}
          >
            <View
              style={{
                height: 50,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text
                style={{
                  paddingLeft: 25,
                  color: themecolor,
                  fontSize: 18,
                  fontWeight: "bold"
                }}
              >
                Add Service
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={this.onPressCloseAddServiceModal}
              >
                <Image
                  style={styles.imageButton}
                  source={this.state.closeUrl}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={{
                height: 55,
                width: 250,
                paddingLeft: 25,
                marginTop: 25,
                fontWeight: "bold"
              }}
              placeholder="Service ID"
              onChangeText={id => this.setState({ id })}
              value={this.state.id}
            />
            <TextInput
              style={{
                height: 55,
                width: 250,
                paddingLeft: 25,
                fontWeight: "bold"
              }}
              placeholder="Key"
              onChangeText={key => this.setState({ key })}
              value={this.state.key}
            />

            <TouchableOpacity
              style={{
                width: 250,
                height: 55,
                backgroundColor: themecolor,
                borderRadius: 100,
                marginLeft: 37.5,
                marginTop: 25,
                alignItems: "center",
                justifyContent: "center"
              }}
              onPress={this.searchAdd}
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
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                borderRadius: 100,
                marginLeft: 100,
                paddingTop: 50
              }}
              onPress={this.creatService}
              activeOpacity={0.9}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  color: themecolor,
                  paddingBottom: 3
                }}
              >
                Create a new service
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          animationType={this.state.animationType}
          transparent={true}
          visible={this.state.createServiceModalVisible}
          onRequestClose={() => {
            this.setState({
              newServiceName: "",
              newServiceKey: "",
              newServiceSchool: "",
              schoolKey: "",
              createServiceModalVisible: false
            });
          }}
        >
          <View
            style={{
              marginTop: (height - 425) / 2,
              marginLeft: (width - 325) / 2,
              backgroundColor: "white",
              width: 325,
              height: 425,
              borderRadius: 15
            }}
          >
            <View
              style={{
                paddingTop: 25,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text
                style={{
                  paddingLeft: 25,
                  color: themecolor,
                  fontSize: 18,
                  fontWeight: "bold"
                }}
              >
                Create Service
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={this.onPressCloseCreatServiceModal}
              >
                <Image
                  style={styles.imageButton}
                  source={this.state.closeUrl}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={{
                height: 55,
                width: 250,
                marginTop: 25,
                paddingLeft: 25,
                fontWeight: "bold"
              }}
              placeholder="Service Name"
              onChangeText={newServiceName =>
                this.setState({
                  newServiceName
                })
              }
              value={this.state.newServiceName}
            />

            <TextInput
              style={{
                height: 55,
                width: 250,
                paddingLeft: 25,
                fontWeight: "bold"
              }}
              placeholder="Key (4 numbers only)"
              onChangeText={newServiceKey =>
                this.setState({
                  newServiceKey
                })
              }
              value={this.state.newServiceKey}
            />

            <TextInput
              style={{
                height: 55,
                width: 250,
                paddingLeft: 25,
                fontWeight: "bold"
              }}
              placeholder="School name"
              onChangeText={newServiceSchool =>
                this.setState({
                  newServiceSchool
                })
              }
              value={this.state.newServiceSchool}
            />

            <TextInput
              style={{
                height: 55,
                width: 250,
                paddingLeft: 25,
                fontWeight: "bold"
              }}
              placeholder="School Key"
              onChangeText={schoolKey => this.setState({ schoolKey })}
              value={this.state.schoolKey}
            />

            <TouchableOpacity
              style={{
                width: 250,
                height: 55,
                backgroundColor: themecolor,
                borderRadius: 100,
                marginLeft: 37.5,
                marginTop: 25,
                alignItems: "center",
                justifyContent: "center"
              }}
              onPress={this.creatNewService}
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
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View
          style={{
            width: width
          }}
        >
          <Text
            style={{
              paddingTop: "10%",
              paddingLeft: 25,
              color: "black",
              fontSize: 24,
              fontWeight: "bold"
            }}
          >
            {this.state.firstname} {this.state.lastname}
          </Text>
        </View>
        <Text
          style={{
            marginTop: "2.5%",
            paddingLeft: 25,
            color: "rgba(50, 50, 50, 1)",
            fontSize: 21,
            fontWeight: "bold"
          }}
        >
          {this.state.position}
        </Text>
        <Text
          style={{
            marginTop: "2.5%",
            paddingLeft: 25,
            color: "rgba(100, 100, 100, 1)",
            fontSize: 18,
            fontWeight: "bold"
          }}
        >
          Grade {this.state.grade}
        </Text>
        <View
          style={{
            paddingTop: this.state.indicatorPaddingTop,
            height: this.state.indicatorHeight,
            opacity: this.state.indicatorOpacity
          }}
        >
          <ActivityIndicator size="large" color={themecolor} />
        </View>
        <View
          style={{
            flex: 1,
            paddingTop: 17.5,
            opacity: this.state.layoutOpacity
          }}
        >
          {renderAddView}
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            opacity: this.state.layoutOpacity
          }}
        >
          <TouchableOpacity style={{ marginTop: 20 }} onPress={this.addService}>
            <Image
              style={{ width: 50, height: 50 }}
              source={this.state.addUrl}
            />
          </TouchableOpacity>
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7"
  },
  MainContainer: {
    flex: 1,
    backgroundColor: "#eee",
    justifyContent: "center",
    paddingTop: Platform.OS == "ios" ? 20 : 0
  },
  imageButton: {
    width: 25,
    height: 25,
    marginRight: 25,
    resizeMode: "contain"
  }
};
