import { DrawerNavigator } from "react-navigation";
import HomeScreen from "./HomeScreen";
import HttpScreen from "./HttpScreen";

/**
 * Navigation controller of the application, it contains all children views.
 */
const MainScreen = DrawerNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      title: "Welcome"
    }
  },
  Http: {
    screen: HttpScreen
  }
}, {
    initialRouteName: "Home"
  });

export default MainScreen;
