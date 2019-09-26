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
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import firebase from "react-native-firebase";
import ViewPager from "@react-native-community/viewpager";
import { createAppContainer, createStackNavigator } from "react-navigation";

var width = Dimensions.get("window").width;
var height = Dimensions.get("window").height;
var themecolor = "#557DFF";

type Props = {};
export default class AddServiceModal extends Component<Props> {
  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection("services");
    this.state = {};
    this.arrayValueIndex = 0;
  }

  componentDidMount() {}

  render() {
    return (
      <View
        style={{
          backgroundColor: "white",
          width: 325,
          height: 400,
          borderRadius: 15
        }}
      >
        <Text
          style={{
            paddingTop: 25,
            paddingLeft: 25,
            color: themecolor,
            fontSize: 18,
            fontWeight: "bold"
          }}
        >
          Add Service
        </Text>
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
      </View>
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
  }
};
