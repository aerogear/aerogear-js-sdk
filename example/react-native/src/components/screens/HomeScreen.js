import React, { Component } from "react";
import { View, Text, StatusBar } from "react-native";
import { MobileCore } from "aerogear-react-native-core";
import { NavDrawerButton } from "../common";
import { Colors } from "../../assets";

class HomeScreen extends Component {

  static navigationOptions = ({ navigation }) => ({
    title: "Home",
    headerStyle: {
      backgroundColor: Colors.primary
    },
    headerTintColor: Colors.white,
    headerLeft: <NavDrawerButton onPress={() => navigation.navigate("DrawerOpen")} />
  });

  state = {
    deviceMetrics: {
      platform: "",
      platformVersion: "",
      device: ""
    }
  };

  componentWillMount() {
    MobileCore.getDeviceMetrics()
      .then(deviceMetrics => {
        this.setState({ deviceMetrics });
      });
  }

  render() {
    const { containerStyle, welcomeStyle, smallStyle } = styles;
    const { platform, platformVersion, device } = this.state.deviceMetrics;

    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View>
          <Text style={welcomeStyle}>
            HOME
          </Text>
          <Text style={smallStyle}>Platform: {platform}</Text>
          <Text style={smallStyle}>Version: {platformVersion}</Text>
          <Text style={smallStyle}>Device: {device}</Text>
        </View>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcomeStyle: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  smallStyle: {
    fontSize: 12
  }
};

export { HomeScreen };
