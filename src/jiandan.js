/**
 * XadillaX <i@2333.moe> created at 2017-03-30 19:28:08 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import React, { Component } from "react";
import { Router, Scene } from "react-native-router-flux";

import OOXXList from "./pages/ooxx_list";

export default class Jiandan extends Component {
    render() {
        return (
            <Router>
                <Scene key="xxoo-list" title="🍳irl" component={OOXXList} />
            </Router>
        );
    }
}
