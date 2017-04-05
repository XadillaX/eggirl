/**
 * XadillaX <i@2333.moe> created at 2017-04-05 15:46:34 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { observer } from "mobx-react/native";
import { observable, computed } from "mobx";
import { Image, View, Text } from "react-native";

const STYLES = {
    rowView: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10
    },

    rowLeftView: {
        flex: 0.4
    },

    rowRightView: {
        flex: 0.6
    }
};

@observer
export default class ListGirlItem extends Component {
    @observable
    static imageWidth = 0;

    @computed
    get imageHeight() {
        return ListGirlItem.imageWidth * (this.props.item.imageSize.width / this.props.item.imageSize.height);
    }

    constructor() {
        super();
    }

    onViewLayout(event) {
        if(ListGirlItem.imageWidth === 0) {
            ListGirlItem.imageWidth = event.nativeEvent.layout.width;
        }
    }

    render() {
        const item = this.props.item;
        return (
            <View key={item.key} style={STYLES.rowView}>
                <View style={STYLES.rowLeftView}>
                    <Text style={{ color: "red", fontSize: 14 }}>{item.author}</Text>
                    <Text style={{ color: "#ccc", fontSize: 12 }}>{item.ago}</Text>
                </View>
                <View style={STYLES.rowRightView} onLayout={event => this.onViewLayout(event)}>
                    <Image
                        style={{
                            width: this.imageWidth,
                            height: this.imageHeight,
                            backgroundColor: "#ccc"
                        }}
                        source={{ uri: item.img }} />
                </View>
            </View>
        );
    }
}
