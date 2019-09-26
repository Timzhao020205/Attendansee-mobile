/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  BackHandler,
  AppRegistry,
  Platform,
  StyleSheet,
  Text,
  View,
  ToastAndroid
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

//use these classes in the navigator
import HomeScreen from "./src/screens/HomeScreen";
import SigninScreen from "./src/screens/SigninScreen";
import SignupScreen from "./src/screens/SignupScreen";
import StartScreen from "./src/screens/StartScreen";
import SettingScreen from "./src/screens/SettingScreen";
import VerificationScreen from "./src/screens/VerificationScreen"

type Props = {};

/**
 * Class discription
 * App class is the driver class of the entire react native app.
 * The class has StackNavigator and AppContainer from react-navigation to navigate between screens.
 * The class imports all other StartScreen, SigninScreen, SignupScreen, HomeScreen, and SettingScreen.
 * This is the primary displayed class. All user interfaces displayed will be in the AppContainer.
 */

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  //UI starts here
  render() {
    return <AppContainer />;
  }
}

//AppNavigator is a StackNavigator that manages the navigation of the entire application.

const AppNavigator = createStackNavigator(
  {
    //Start is the simplified route name of StartScreen class.
    Start: {
      screen: StartScreen,
      navigationOptions: {
        //The screen in the component will not have a header.
        header: null
      }
    },
    //Home is the route name of HomeScreen class.
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null
      }
    },
    //Signin is the route name of SigninScreen class.
    Signin: {
      screen: SigninScreen,
      navigationOptions: {
        header: null,
        gesturesEnabled: false
      }
    },
    //Signup is the route name of SignupScreen class.
    Signup: {
      screen: SignupScreen,
      navigationOptions: {
        header: null
      }
    },
    Verification: {
      screen: VerificationScreen,
      navigationOptions: {
        header: null
      }
    },
    //Settings is the route name of SettingScreen class.
    Settings: {
      screen: SettingScreen,
      navigationOptions: {
        header: null
      }
    }
  },
  {
    initialRouteName: "Start"
  }
);

/*AppContainer is a user interface container that contains the corresponding screen in AppNavigator,
 * and display */
const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent("App", () => App);
