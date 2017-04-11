/**
 * XadillaX <i@2333.moe> created at 2017-04-06 15:54:44 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { observable } from "mobx";
import { observer } from "mobx-react/native";
import { Dimensions, Platform, Alert, View } from "react-native";
import { Actions } from "react-native-router-flux";
import Share from "react-native-share";
import RNFetchBlob from "react-native-fetch-blob";
import Spinner from "react-native-loading-spinner-overlay";

import Toast, { DURATION } from "react-native-easy-toast";
import Gallery from "react-native-photo-browser";

const otrans = require("otrans");

@observer
export default class OOXXGallery extends Component {
    @observable
    hide = true;

    @observable
    selectedIndex = 0;

    constructor(props) {
        super(props);
        this.hide = props.hide === undefined ? true : props.hide;
    }

    @observable
    saveFetching = false;

    render() {
        if(this.hide) {
            return <View style={{ position: "absolute", top: -5, left: -5, height: 0, width: 0 }} />;
        } else {
            const self = this;

            const spinner = this.saveFetching ? <Spinner visible={true} textContent="Preparing..."/> : null;
            return (
                <View
                    style={{
                        backgroundColor: "#000",
                        flex: 1,
                        flexDirection: "row",
                        height: Dimensions.get("window").height,
                        width: Dimensions.get("window").width,
                        position: "absolute",
                        top: 0,
                        left: 0
                    }}
                    onPress={() => { this.hide = true; Actions.pop(); }}>
                    {spinner}
                    <Gallery
                        style={{ flex: 1 }}
                        mediaList={this.props.images}
                        initialIndex={this.props.initialSelectedIndex}
                        displayActionButton={true}
                        onBack={() => { this.hide = true; Actions.pop(); }}
                        onActionButton={media => {
                            this.saveFetching = true;
                            let mime = "image/jpeg";
                            RNFetchBlob.config({
                                fileCache: true
                            }).fetch("GET", media.photo).then(function(resp) {
                                const headers = otrans.toCamel(resp.respInfo.headers);

                                if(headers.contentType) {
                                    mime = headers.contentType;
                                }

                                return resp.base64();
                            }).then(function(base64) {
                                self.saveFetching = false;
                                Share.open({
                                    url: `data:${mime};base64,${base64}`,
                                    message: `Eggirl - ${media.caption}`,
                                    type: "image/jpeg"
                                }).catch(err => err && console.log(err));
                            }).catch(err => console.log(err));
                        }}
                        delayPhotoLongPress={1000}
                        onPhotoLongPress={media => {
                            console.log(Platform.OS);
                            if(Platform.OS === "ios") return;

                            // if android
                            Alert.alert("You're going to save this image.", null, [
                                { text: "Save", onPress: function() {
                                    let filename = "temp";
                                    let type = "jpeg";
                                    self.saveFetching = true;
                                    RNFetchBlob.config({
                                        fileCache: true
                                    }).fetch("GET", media.photo).then(function(resp) {
                                        filename = resp.taskId;

                                        const headers = otrans.toCamel(resp.respInfo.headers);
                                        if(headers.contentType) {
                                            type = headers.contentType.split("/")[1];
                                        }

                                        return resp.base64();
                                    }).then(function(base64) {
                                        if(type === "jpeg") {
                                            type = "jpg";
                                        }

                                        const imageLocation = `${RNFetchBlob.fs.dirs.PictureDir}/${filename}.${type}`;
                                        RNFetchBlob.fs.writeFile(imageLocation, base64, "base64").then(function() {
                                            self.saveFetching = false;
                                            self.refs.toast.show("Saved.", DURATION.LENGTH_SHORT);
                                        }).catch(err => {
                                            self.saveFetching = false;
                                            Alert.alert("Error", err.message);
                                        });
                                    }).catch(err => console.log(err));
                                } },
                                { text: "Cancel", onPress: function() {} }
                            ]);
                        }} />

                    <Toast ref="toast" />
                </View>
            );
        }
    }
}
