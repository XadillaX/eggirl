/**
 * XadillaX <i@2333.moe> created at 2017-03-30 19:52:12 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react/native";
import { View, Text } from "react-native";

import Spinner from "react-native-loading-spinner-overlay";

@observer
export default class OOXXList extends Component {
    @observable
    inited = false;

    render() {
        if(!this.inited) {
            return (
                <View style={{ flex: 1 }}>
                    <Spinner visible={true} textContent="加载中..." textStyle={{ color: "#FFF" }} />
                </View>
            );
        } else {
            return <Text>Hello</Text>;
        }
    }
}
