'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _eventproxy = require('eventproxy');

var _eventproxy2 = _interopRequireDefault(_eventproxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var url = 'https://www.lagou.com/jobs/113258.html';
var url1 = 'https://www.lagou.com/jobs/list_前端开发?px=default&city=上海#filterBox';
var url2 = 'https://www.lagou.com/zhaopin/qianduankaifa/1/';

var jobs = [];
var pages = [];
var entry = [];
var jobIndex = 0;
var pageIndex = 0;

var interval = 5000;
var ep = new _eventproxy2.default();

for (var i = 0; i < 30; i++) {
    pages.push('https://www.lagou.com/zhaopin/qianduankaifa/' + (i + 1) + '/');
}

function runStart(page) {
    console.log('\u6B63\u5728\u83B7\u53D6\u7B2C' + pageIndex + '\u9875\u6570\u636E');
    _superagent2.default.get(page).end(function (err, res) {
        if (res.text) {
            (function () {
                var $ = _cheerio2.default.load(res.text);
                $('.position_link').each(function (index, element) {
                    var $element = $(element);
                    entry.push('http:' + $element.attr('href'));
                });
                console.log('入口：\n', entry);
                getJobs(entry);
            })();
        } else {
            console.log(404);
        }
    });
}

function getJobs(entry) {

    ep.after('got_jobs', entry.length, function (list) {
        // 在所有文件的异步执行结束后将被执行
        // 所有文件的内容都存在list数组中
        jobs.push(list);
        console.log('\u7B2C' + (pageIndex + 1) + '\u9875\u6570\u636E\u6293\u53D6\u5B8C\u6210\uFF0C\u73B0\u5728\u5171' + jobs.length + '\u9875\u6570\u636E');
        setTimeout(function () {
            if (pageIndex < pages.length - 1) {
                entry = [];
                jobIndex = 0;
                pageIndex++;
                runStart(pages[pageIndex]);
            }
        }, 5000);
        // ep.emit('job_data', list);
        // console.log(`链接获取中...`);
        // return jobs;
    });

    getJobInfo();
}

function getJobInfo() {

    setTimeout(function () {
        console.log(' \uD83D\uDE80 \u6B63\u5728\u83B7\u53D6\u7B2C' + (jobIndex + 1) + '\u6761\u6570\u636E...\n');
        _superagent2.default.get(entry[jobIndex]).end(function (err, res) {
            if (res.text) {
                var $ = _cheerio2.default.load(res.text);
                console.log('\u2728 \u7B2C' + (jobIndex + 1) + '\u4E2A\u7F51\u9875\u83B7\u53D6\u6210\u529F\n');
                ep.emit('got_jobs', {
                    title: $('.job_request').text(),
                    advans: $('.job-advantage').text(),
                    desc: $('.job_bt').text()
                });

                if (jobIndex < entry.length - 1) {
                    jobIndex++;
                    getJobInfo();
                }
            } else {
                console.log(404);
            }
        });
    }, interval);
}

runStart(pages[pageIndex]);
