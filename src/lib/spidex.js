/**
 * XadillaX <i@2333.moe> created at 2017-03-31 14:08:25 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

const EventEmitter2 = require("eventemitter2").EventEmitter2;
const qs = require("qs");

const spidex = {};

function _combineHeader(header) {
    const newHeader = {
        "user-agent": "Spidex"
    };

    if(typeof header === "string") {
        return newHeader;
    }

    for(const key in header) {
        if(header.hasOwnProperty(key)) {
            newHeader[key.toLowerCase()] = header[key];
        }
    }

    return newHeader;
}

spidex.method = function(method, url, opts, callback) {
    if(typeof opts === "function") {
        callback = opts;
        opts = {};
    }

    const fetchOpts = {
        method: method.toUpperCase(),
        headers: _combineHeader(opts.header || {})
    };

    let data = opts.data || "";
    if(typeof data === "object") {
        if(fetchOpts["content-type"].indexOf("urlencoded") >= 0) {
            data = qs.stringify(data);
        } else {
            data = JSON.stringify(data);
        }
    }

    if(data) {
        fetchOpts.body = data;
    }

    const emitter = new EventEmitter2();
    let allFinished = false;
    let timeoutEmitted = false;
    let timeoutHandler = null;
    if(opts.timeout) {
        timeoutHandler = setTimeout(function() {
            if(allFinished) return;
            timeoutEmitted = true;
            emitter.emit("error", new Error(`Spidex timeout in ${opts.timeout}ms.`));
        }, opts.timeout);
    }

    let status;
    let respHeaders;
    fetch(url, fetchOpts).then(function(resp) { // eslint-disable-line
        if(timeoutEmitted) return;
        if(timeoutHandler) clearTimeout(timeoutHandler);
        allFinished = true;

        status = resp.status;
        respHeaders = resp.headers ? resp.headers.map || {} : {};
        return resp.text();
    }).then(function(text) {
        return callback(text, status, respHeaders);
    }).catch(function(err) {
        if(timeoutEmitted) return;
        if(timeoutHandler) clearTimeout(timeoutHandler);
        allFinished = true;
        emitter.emit("error", err);
    });

    return emitter;
};

spidex.get = function(url, opts, callback) {
    return this.method("get", url, opts, callback);
};

export default spidex;

spidex.parseCookie = function(respHeader) {
    const cookies = respHeader["set-cookie"];
    if(!cookies || !Array.isArray(cookies) || cookies.length === 0) return "";

    let cookie = "";
    for(let tmpCookie of cookies) {
        if(tmpCookie.indexOf(";") !== -1) {
            tmpCookie = tmpCookie.substr(0, tmpCookie.indexOf(";") + 1);
        }

        cookie += tmpCookie;
        cookie += " ";
    }

    return cookie;
};
