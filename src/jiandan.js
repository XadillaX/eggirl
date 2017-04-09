/**
 * XadillaX <i@2333.moe> created at 2017-03-30 19:28:08 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { Router, Modal, Scene } from "react-native-router-flux";

import OOXXList from "./pages/ooxx_list";
import Gallery from "./pages/gallery";

export default class Jiandan extends Component {
    render() {
        return (
            <Router>
                <Scene key="ooxx-with-modal" component={Modal}>
                    <Scene key="ooxx-root">
                        <Scene key="ooxx-list" component={OOXXList} title="🍳irl" />
                        <Scene key="ooxx-config" title="Configuration" />
                    </Scene>
                    <Scene key="ooxx-gallery" component={Gallery} />
                </Scene>
            </Router>
        );
    }
}
