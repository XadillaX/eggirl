/**
 * XadillaX <i@2333.moe> created at 2017-04-05 15:46:34 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { observer } from "mobx-react/native";
import { observable, action } from "mobx";
import { TouchableOpacity, Image, View, Text } from "react-native";

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

    @observable
    errored = [];

    constructor(props) {
        super(props);

        for(let i = 0; i < this.props.item.images.length; i++) {
            this.errored.push(false);
        }
    }

    @action
    onViewLayout(event) {
        if(ListGirlItem.imageWidth === 0) {
            ListGirlItem.imageWidth = event.nativeEvent.layout.width;
        }
    }

    render() {
        const item = this.props.item;
        const images = item.images.map((img, idx) => // eslint-disable-line
            this.errored[idx] ?
            <TouchableOpacity onPress={() => { this.errored[idx] = false; }}>
                    <View
                        key={img.thumbnail}
                        style={{
                            width: ListGirlItem.imageWidth,
                            height: ListGirlItem.imageWidth / img.ratio,
                            backgroundColor: "#ccc",
                            marginBottom: idx === item.images.length - 1 ? 0 : 10,
                            justifyContent: "center"
                        }}>
                        <Text style={{ fontSize: 16, textAlign: "center", color: "#999" }}>Failed to display</Text>
                        <Text style={{ textAlign: "center", color: "#999" }}>Tap to reload</Text>
                    </View>
                </TouchableOpacity> :
                <Image
                    key={img.thumbnail}
                    style={{
                        width: ListGirlItem.imageWidth,
                        height: ListGirlItem.imageWidth / img.ratio,
                        backgroundColor: "#ccc",
                        marginBottom: idx === item.images.length - 1 ? 0 : 10
                    }}
                    source={{ uri: img.gif || img.thumbnail }}
                    onError={err => {
                        console.log(`failed to display image ${img.thumbnail}`, err);
                        this.errored[idx] = true;
                    }} />
        );

        const left = this.props.showLeft ?
            <View style={STYLES.rowLeftView}>
                <Text style={{ color: "red", fontSize: 14 }}>{item.author}</Text>
                <Text style={{ color: "#ccc", fontSize: 12 }}>{item.ago}</Text>
            </View> :
            <View style={STYLES.rowLeftView} />;

        return (
            <View key={item.key} style={STYLES.rowView}>
                {left}
                <View style={STYLES.rowRightView} onLayout={event => this.onViewLayout(event)}>
                    {images}
                </View>
            </View>
        );
    }
}
