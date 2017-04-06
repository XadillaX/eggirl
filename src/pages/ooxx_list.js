/**
 * XadillaX <i@2333.moe> created at 2017-03-30 19:52:12 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import async from "async";
import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react/native";
import { TouchableOpacity, Image, FlatList, View, Text, Animated } from "react-native";

import cheerio from "cheerio-without-node-native";
import Spinner from "react-native-loading-spinner-overlay";

import spidex from "../lib/spidex";

import ListGirlItem from "../components/list_girl_item";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

@observer
export default class OOXXList extends Component {
    @observable
    inited = false;

    @observable
    list = [];

    @observable
    lastPage = -1;

    @observable
    networkError = false;

    nsfw = false;

    respCookie = "";

    @observable
    refreshing = false;

    buffList = [];

    loadedHash = {};

    @action
    updateList(list) {
        if(this.list.length && this.list[this.list.length - 1].fetchingNext) {
            this.list.pop();
            if(this.loadingMoreDotTimer) {
                clearInterval(this.loadingMoreDotTimer);
                this.loadingMoreDotTimer = null;
            }
        }

        for(const item of list) {
            // 去重
            if(!this.loadedHash[item.key]) {
                this.loadedHash[item.key] = true;
                this.buffList.push(item);
            }
        }

        // 有时候会不够 10 个
        if(this.buffList.length < 10) {
            this.fetchIndex();
        } else {
            if(this.refreshing) {
                this.list.clear();
            }

            for(const item of this.buffList) {
                this.list.push(item);
            }

            this.buffList = [];
            this.refreshing = false;
            this.inited = true;
        }
    }

    onIndexFetched(html, status, header) {
        if(status !== 200) {
            this.networkError = new Error("server returned a wrong status code");
            return console.log("错误的状态码。", status);
        }

        const cookie = spidex.parseCookie(header);
        if(cookie) this.respCookie += (this.respCookie ? " " : "") + cookie;

        const $ = cheerio.load(html);
        const list = [];
        $("ol.commentlist > li").each(function(i, ele) {
            const id = $(ele).attr("id");
            const author = $(ele).find("div.author strong").text();
            const ago = $(ele).find("div.author small").text();

            // image list
            const images = [];
            $(ele).find("div.text a.view_img_link").each(function(_i, a) {
                const img = {
                    large: `https:${$(a).attr("href")}`,
                    thumbnail: `https:${$(a).next().next().attr("src")}`
                };
                images.push(img);

                if($(a).next().next().attr("org_src")) {
                    img.gif = `https:${$(a).next().next().attr("org_src")}`;
                }
            });

            list.push({
                idx: list.length,
                key: id,
                author: author,
                ago: ago,
                images: images
            });
        });

        if(this.lastPage < 0) {
            const currentPage = $("span.current-comment-page").text();
            this.lastPage = parseInt(currentPage.substr(1, currentPage.length - 2));
        }

        const self = this;
        async.mapLimit(list, 10, function(item, callback) {
            async.eachLimit(item.images, 10, function(image, callback) {
                Image.getSize(image.thumbnail, function(w, h) {
                    image.ratio = w / h;
                    return callback(undefined, image);
                }, function(err) {
                    console.log(err);
                    image.ratio = 1;
                    return callback(undefined, image);
                });
            }, function() {
                return callback(undefined, item);
            });
        }, function(err, newList) {
            if(err) {
                console.error(err);
            }

            self.updateList(newList);
        });
    }

    get cookies() {
        let base = "";
        base += `nsfw-click-load=${this.nsfw ? "on" : "off"}`;

        if(this.respCookie) base += ` ${this.respCookie}`;
        return base;
    }

    fetchIndex() {
        let url = "/ooxx";
        this.lastPage--;
        if(this.lastPage > 0) {
            url += `/page-${this.lastPage}`;
        } else if(this.lastPage === 0) {
            this.list[this.list.length - 1].fetchingNext = false;
            this.list[this.list.length - 1].noMore = true;
            return;
        }

        const self = this;
        const header = {
            // ":authority": "jiandan.net",
            // ":method": "GET",
            // ":path": url,
            // ":scheme": "http",

            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "accept-language": "zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4,sv;q=0.2,zh-TW;q=0.2",
            "cache-control": "no-cache",

            pragma: "no-cache",
            "upgrade-insecure-requests": 1,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) " +
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
        };
        const cookies = this.cookies;
        if(cookies) header.cookie = cookies;

        spidex.get(`https://jandan.net${url}`, {
            header: header
        }, this.onIndexFetched.bind(this)).on("error", function(err) {
            if(self.list.length && self.list[self.list.length - 1].fetchingNext === true) {
                self.list.pop();
            }

            self.networkError = err;
            console.log(err);
        });
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.fetchIndex();
    }

    renderRow(item) {
        const obj = item.item;
        const idx = item.index;

        if(obj.fetchingNext) {
            let dot = "";
            for(let i = 0; i < this.loadingMoreDotCount; i++) dot += ".";
            return (
                <View style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    paddingTop: 10,
                    paddingBottom: 5
                }} key={obj.key}>
                    <Text>Loading more{dot}</Text>
                </View>
            );
        } else if(obj.noMore) {
            return (
                <View style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    paddingTop: 10,
                    paddingBottom: 5
                }} key={obj.key}>
                    <Text>No more.</Text>
                </View>
            );
        }

        // 是否要显示左边栏
        //
        // 如果作者和时间都与上方相同则不显示左边栏
        const showLeft = idx === 0 ?
            true :
            !(this.list[idx - 1].author === obj.author && this.list[idx - 1].ago === obj.ago);

        return (
            <ListGirlItem item={obj} showLeft={showLeft} />
        );
    }

    @observable
    loadingMoreDotCount = 3;

    loadingMoreDotTimer = null;

    @action
    fetchNextPage() {
        if(this.lastPage === 0) return;

        this.networkError = false;
        if(this.list.length && this.list[this.list.length - 1].fetchingNext === true) return;

        if(!this.loadingMoreDotTimer) {
            const self = this;
            this.loadingMoreDotTimer = setInterval(function() {
                let cnt = self.loadingMoreDotCount - 1;
                if(cnt < 0) cnt = 3;
                self.loadingMoreDotCount = cnt;
            }, 500);
        }

        this.list.push({ fetchingNext: true, key: "fetching" });
        this.fetchIndex();
    }

    render() {
        if(this.networkError) {
            return (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <TouchableOpacity onPress={this.fetchNextPage.bind(this)}>
                        <Text style={{ textAlign: "center", fontSize: 20, color: "#999" }}>
                            Network Error, tap to reload 👆
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        } else if(!this.inited) {
            return (
                <View style={{ flex: 1 }}>
                    <Spinner visible={true} textContent="Loading..." textStyle={{ color: "#FFF" }} />
                </View>
            );
        } else {
            // for refreshing forcely
            this.loadingMoreDotCount; // eslint-disable-line
            return (
                <View style={{ marginTop: 64 }}>
                    <AnimatedFlatList
                        data={this.list.slice()}
                        renderItem={this.renderRow.bind(this)}
                        onEndReached={this.fetchNextPage.bind(this)}
                        onRefresh={() => {
                            this.refreshing = true;
                            this.lastPage = -1;
                            this.fetchIndex();
                        }}
                        refreshing={this.refreshing}
                        onEndReachedThreshold={1}
                        style={{ paddingLeft: 10, paddingRight: 10, backgroundColor: "#f5fcff" }} />
                </View>
            );
        }
    }
}
