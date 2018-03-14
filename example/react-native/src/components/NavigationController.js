import { StackNavigator, DrawerNavigator } from "react-navigation";
import { HomeScreen, HttpScreen } from "./screens";

/**
 * Main navigation controller, it wraps the DrawerNavigator controller
 * and provides the screens with a native header
 */
const NavigationController = StackNavigator({
  screen: {
    screen: DrawerNavigator({
      Home: { screen: HomeScreen },
      Http: { screen: HttpScreen },
    })
  }
});

/**
 * Navigation controller that provides the app with a lateral drawer.
 */


export default NavigationController;
