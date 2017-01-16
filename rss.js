let RssFeedEmitter = require('rss-feed-emitter');
let feeder = new RssFeedEmitter();

feeder.add({
    url: 'http://www.ruanyifeng.com/blog/atom.xml',
    refresh: 2000
});

feeder.on('new-item', function(item) {
    console.log(item);
})

const list = feeder.list();

// console.log(list);
