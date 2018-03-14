import React, { Component } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback
} from "react-native";
// import { ConfigService } from "@aerogearservices/core";
// import mobileServicesJson from "../mobile-services.json";

class HomeScreen extends Component {

  static navigationOptions = {
    title: "Home"
  };

  openDrawer() {
    this.props.navigation.navigate("DrawerOpen");
  }

  render() {
    // const config = new ConfigService(mobileServicesJson);
    // const keycloakConfig = config.getKeycloakConfig();

    return (
      <View style={styles.containerStyle}>
        <TouchableWithoutFeedback onPress={this.openDrawer.bind(this)}>
          <View>
            <Text style={styles.welcomeStyle}>
              HOME
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

export { HomeScreen };
