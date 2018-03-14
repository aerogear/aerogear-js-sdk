import React, { Component } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback
} from "react-native";
import Toolbar from "./common/Toolbar";
// import { ConfigService } from "@aerogearservices/core";
// import mobileServicesJson from "../mobile-services.json";

class HomeScreen extends Component {

  static WELCOME_TEXT = "AeroGear SDK Demo";

  openDrawer() {
    this.props.navigation.navigate("DrawerOpen");
  }

  render() {
    // const config = new ConfigService(mobileServicesJson);
    // const keycloakConfig = config.getKeycloakConfig();

    return (
      <View>
        <Toolbar />
        <TouchableWithoutFeedback onPress={this.openDrawer.bind(this)}>
          <View style={styles.containerStyle}>
            <Text style={styles.welcomeStyle}>
              {this.WELCOME_TEXT}
            </Text>
            <Text style={styles.smallStyle}>
              {"Tap to extend drawer\n"}
              {/* keycloakConfig = {JSON.stringify(keycloakConfig)} */}
              keycloakConfig
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
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

export default HomeScreen;
