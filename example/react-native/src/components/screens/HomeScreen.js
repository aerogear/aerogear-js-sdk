import React, { Component } from "react";
import { View, Text, StatusBar } from "react-native";
import { RNMetricsService } from "aerogear-react-native-sdk";
import find from "lodash.find";
import { NavDrawerButton } from "../common";
import { Colors } from "../../assets";
import mobileServicesJson from "../../../mobile-services.json";

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
    res: "",
    err: ""
  };

  componentWillMount() {
    const configuration = find(mobileServicesJson.services, { type: "metrics" });
    const metricsService = new RNMetricsService(configuration);

    metricsService.sendAppAndDeviceMetrics()
      .then(() => this.setState({ res: "Done!" }))
      .catch(err => console.log(err));
  }

  render() {
    const { containerStyle, welcomeStyle, smallStyle } = styles;

    return (
      <View style={containerStyle}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View>
          <Text style={welcomeStyle}>
            HOME
          </Text>
          <Text style={smallStyle}>Sending device metrics...</Text>
          <Text style={smallStyle}>{this.state.res}</Text>
          <Text style={smallStyle}>{this.state.err.message}</Text>
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
