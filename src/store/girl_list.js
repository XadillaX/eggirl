/**
 * XadillaX <i@2333.moe> created at 2017-04-05 19:34:06 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

import { computed, observable, action } from "mobx";

class GirlListStore {
    @observable
    list = [];

    buffList = [];

    loadedHash = {};

    constructor() {
    }

    push(item) {
        item.idx = this.list.length;
        this.list.push(item);
    }

    pushToBuffList(item) {
        if(this.loadedHash[item.key]) {
            return;
        }

        this.loadedHash[item.key] = true;
        this.buffList.push(item);
    }

    get count() {
        return this.list.length;
    }

    get buffCount() {
        return this.buffList.length;
    }

    @computed
    get raw() {
        return this.list.slice();
    }

    get last() {
        if(!this.list.length) return null;
        return this.list[this.list.length - 1];
    }

    pop() {
        const last = this.last;
        if(last.key) this.loadedHash[last.key] = undefined;
        return this.list.pop();
    }

    @action
    syncBuffToList() {
        for(const item of this.buffList) {
            this.push(item);
        }

        this.buffList = [];
    }

    at(idx) {
        return this.list[idx];
    }

    clear() {
        this.loadedHash = {};
        this.list.clear();
    }
}

module.exports = new GirlListStore();
