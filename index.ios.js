/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { AppRegistry } from "react-native";
import Jiandan from "./src/jiandan";

export default class App extends Component {
    render() {
        return <Jiandan />;
    }
}

AppRegistry.registerComponent("jiandan", () => App);
