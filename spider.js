import http from 'http';
import cheerio from 'cheerio';
import request from 'superagent';
import EventProxy from 'eventproxy';
import AV from 'leancloud-storage';
import Jieba from 'nodejieba';


const APP_ID = 'DKznYjsoBovqVJ8fdTm3RwlB-gzGzoHsz';
const APP_KEY = 'mTGcLoJJelK9SqLqfU5kSLi0';

const url = 'https://www.lagou.com/jobs/113258.html';
const url1 = 'https://www.lagou.com/jobs/list_前端开发?px=default&city=上海#filterBox';
const url2 = 'https://www.lagou.com/zhaopin/qianduankaifa/1/';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});

let jobs = [];
let pages = [];
let entry = [];
let jobIndex = 0;
let pageIndex = 0;

const interval = 3000;
const ep = new EventProxy();

for (var i = 0; i < 30; i++) {
    pages.push(`https://www.lagou.com/zhaopin/qianduankaifa/${i+1}/`);
}


function runStart(page) {
    console.log(page);
    console.log(`正在获取第${pageIndex + 1}页数据`);
    request
        .get(page)
        .end(function(err, res) {
            if (res.text) {
                const $ = cheerio.load(res.text);
                $('.position_link').each(function(index, element) {
                    var $element = $(element);
                    entry.push(`http:${$element.attr('href')}`);
                });
                console.log('入口：\n', entry);
                getJobs(entry);
            } else {
                console.log(404);
            }
        });

}



function getJobs(entryList) {

    ep.after('got_jobs', entryList.length, function(list) {
        // 在所有文件的异步执行结束后将被执行
        // 所有文件的内容都存在list数组中
        // jobs.push(list);
        // console.log(list);
        let descConcat = '';
        for (let i = 0; i < list.length; i++) {
            descConcat = descConcat + list[i].title;
        }
        // descConcat = descConcat.replace(/([\u4e00-\u9fa5]|d+)/g, '').toLowerCase();
        console.log(descConcat);
        // console.log(Jieba.extract(descConcat, 100));
        // const segment = new Segment();
        // segment.useDefault();
        //
        // const result = segment.doSegment(JSON.stringify(list));
        // console.log(JSON.stringify(result));
        // var JobObject = AV.Object.extend('Job');
        // var jobObject = new JobObject();
        // jobObject.save({
        //     page: list
        // }).then(function(object) {
        //     console.log('save ok ✅');
        // })

        console.log(`第${pageIndex+1}页数据抓取完成，现在共${jobs.length}页数据`);
        setTimeout(() => {
                if (pageIndex < pages.length - 1) {
                    entry = [];
                    jobIndex = 0;
                    pageIndex++;
                    runStart(pages[pageIndex]);
                }
            }, 5000)
            // ep.emit('job_data', list);
            // console.log(`链接获取中...`);
            // return jobs;
    });

    getJobInfo();


}


function getJobInfo() {

    setTimeout(function() {
        console.log(` 🚀 正在获取第${jobIndex+1}条数据...\n`);
        // ep.emit('got_jobs', {});
        // if (jobIndex < entry.length - 1) {
        //     jobIndex++;
        //     getJobInfo();
        // }
        request
            .get(entry[jobIndex])
            .end(function(err, res) {
                if (res.text) {
                    const $ = cheerio.load(res.text);
                    console.log(`✨ 第${jobIndex+1}个网页获取成功\n`);
                    ep.emit('got_jobs', {
                        title: cleanText($('.job_request').text()),
                        advans: cleanText($('.job-advantage').text()),
                        desc: cleanText($('.job_bt').text()),
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


function cleanText(text) {
    return text.toString().replace(/[\r\n\s+]/g, '');
}

runStart(pages[pageIndex]);
