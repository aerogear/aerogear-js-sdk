import React from "react";
import { Platform, View, ToolbarAndroid } from "react-native";

const Toolbar = () => {
  if (Platform.OS === "ios") {
    return <View></View>;
  } else {
    return <View><ToolbarAndroid title="Home" /></View>;
  }
};

export default Toolbar;
