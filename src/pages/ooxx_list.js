/**
 * XadillaX <i@2333.moe> created at 2017-03-30 19:52:12 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { observable, computed, action } from "mobx";
import { observer } from "mobx-react/native";
import { ListView, View, Image, Text } from "react-native";

import cheerio from "cheerio-without-node-native";
import Spinner from "react-native-loading-spinner-overlay";

import spidex from "../lib/spidex";

class GirlList {
    @observable
    list = [];

    ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    @computed
    get dataSource() {
        return this.ds.cloneWithRows(this.list.slice());
    }
}

@observer
export default class OOXXList extends Component {
    @observable
    inited = false;

    list = new GirlList();

    @observable
    lastPage = -1;

    @action
    onIndexFetched(html, status) {
        if(status !== 200) {
            return console.log("错误。");
        }

        const $ = cheerio.load(html);
        const self = this;
        $("ol.commentlist > li").each(function(i, ele) {
            const id = $(ele).attr("id");
            const author = $(ele).find("div.author strong").text();
            const img = $(ele).find("div.text a.view_img_link").attr("href");
            const ago = $(ele).find("div.author small").text();

            self.list.list.push({
                id: id,
                author: author,
                img: img,
                ago: ago,

                ratio: 3
            });
        });

        this.inited = true;
        if(this.lastPage < 0) {
            const currentPage = $("span.current-comment-page").text();
            this.lastPage = parseInt(currentPage.substr(1, currentPage.length - 2));
        }
    }

    fetchIndex() {
        let url = "http://jiandan.net/ooxx";
        this.lastPage--;
        if(this.lastPage > 0) {
            url += `/page-${this.lastPage}`;
        }

        spidex.get(url, this.onIndexFetched.bind(this)).on("error", function(err) {
            console.error(err);
        });
    }

    constructor(props) {
        super(props);
        this.fetchIndex();
    }

    STYLES = {
        rowView: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10
        },

        rowLeftView: {
            flex: 0.4
        }
    };

    @action
    onImageSizeGot(rowId, obj, width, height) {
        this.list.list[rowId].ratio = width / height;
    }

    onToResizePicture(rowId, obj) {
        Image.getSize(`http:${obj.img}`, this.onImageSizeGot.bind(this, rowId, obj));
    }

    renderRow(obj, sectionId, rowId) {
        console.log(obj.ratio, "<<<");
        return (
            <View key={obj.id} style={this.STYLES.rowView}>
                <View style={this.STYLES.rowLeftView}>
                    <Text style={{ color: "red", fontSize: 14 }}>{obj.author}</Text>
                    <Text style={{ color: "#ccc", fontSize: 12 }}>{obj.ago}</Text>
                </View>

                <Image
                    onLayout={this.onToResizePicture.bind(this, rowId, obj)}
                    style={{ flex: 0.6 }}
                    source={{ uri: `http:${obj.img}` }}
                    aspectRatio={obj.ratio} />
            </View>
        );
    }

    render() {
        if(!this.inited) {
            return (
                <View style={{ flex: 1 }}>
                    <Spinner visible={true} textContent="加载中..." textStyle={{ color: "#FFF" }} />
                </View>
            );
        } else {
            return (
                <ListView
                    enableEmptySections={true}
                    dataSource={this.list.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    style={{ padding: 10, paddingTop: 64, backgroundColor: "#f5fcff" }} />
            );
        }
    }
}
