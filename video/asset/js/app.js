var App = /** @class */ (function () {
    function App() {
        // 认证token,请从开发中心获取
        var token = 'YTU5NjgxYzU1NDAxM2ZiNWQ0OGMxOGY5Yjk2ZThlYjYxNzY2M2EwOGQ5NmIzMTYzZjYwZDkxOTQwODk2NTc2ZHsiYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjc4MjM0NzU5NTk4fQ==';
        this.webAR = new WebAR('https://iss-cn1.wujianar.com', token, 1000);
        if (window.VConsole)
            new VConsole();
    }
    App.prototype.run = function () {
        var _this = this;
        window.onload = function () {
            if (_this.isWeiXin() && _this.isIos()) {
                _this.openPage('page1', 'page3');
                return;
            }
        };
        // 点击扫描
        var isOpening = false;
        document.querySelector('#btnScan').addEventListener('click', function () {
            _this.toast('摄像头打开中...');
            if (isOpening) {
                return;
            }
            isOpening = true;
            _this.webAR.tryCamera().then(function (msg) {
                isOpening = false;
                _this.openPage('page1', 'page2');
                _this.toast('请扫描居民身份证有国徽的那一面来体验', 5000);
                // 开始识别
                _this.search();
            })["catch"](function (err) {
                isOpening = false;
                console.info('打开摄像头失败');
                console.error(err);
                alert('打开摄像头失败');
            });
            _this.createVideo();
        });
        // 点击直接体验
        document.querySelector('#btnShow').addEventListener('click', function () {
            _this.openPage('page1', 'page4');
            _this.createVideo();
            _this.showVideo({ 'videoUrl': 'asset/videos/demo.mp4' });
        });
        // 关闭按钮
        document.querySelector('#btnCloseShow').addEventListener('click', function () {
            _this.removeVideo();
            _this.hideTarget('#btnCloseShow');
            _this.search();
        });
    };
    /**
     * 识别
     */
    App.prototype.search = function () {
        var _this = this;
        this.showTarget('#scanTip');
        this.showTarget('#scanLine');
        this.webAR.startSearch(function (msg) {
            _this.hideTarget('#scanTip');
            _this.hideTarget('#scanLine');
            _this.toast('识别成功');
            _this.openPage('page2', 'page4');
            // 识别成功,播放视频
            // 建议将视频地址保存在云识别的brief字段中,可以在服务端动态更换视频地址
            _this.showTarget('#btnCloseShow');
            _this.showVideo(JSON.parse(msg.brief));
            // this.showVideo({'videoUrl': 'asset/videos/demo.mp4'});
        });
    };
    App.prototype.createVideo = function () {
        var video = document.createElement('video');
        video.setAttribute('id', 'showVideo');
        video.setAttribute('playsinline', 'playsinline');
        video.setAttribute('style', 'width:100%;height:100%');
        video.setAttribute('loop', 'loop');
        video.play().then(function () {
            console.info('play ok');
        })["catch"](function (err) {
            console.info('play error');
        });
        document.querySelector('#page4').appendChild(video);
    };
    App.prototype.showVideo = function (setting) {
        this.playVideo(setting.videoUrl, true);
    };
    App.prototype.removeVideo = function () {
        this.openPage('page4', 'page2');
        var video = document.querySelector('#showVideo');
        video.pause();
        video.removeAttribute('src');
    };
    App.prototype.playVideo = function (videoUrl, autoPlay) {
        var _this = this;
        if (autoPlay === void 0) { autoPlay = true; }
        var video = document.querySelector('#showVideo');
        video.setAttribute('src', videoUrl);
        video.play().then(function () {
            console.info('视频播放成功');
        })["catch"](function (err) {
            _this.toast('视频播放失败');
            console.info(err);
        });
        if (!autoPlay) {
            window.setTimeout(function () {
                video.pause();
            }, 50);
        }
    };
    App.prototype.isIos = function () {
        return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    };
    App.prototype.isWeiXin = function () {
        return /micromessenger/.test(navigator.userAgent.toLowerCase());
    };
    App.prototype.hideTarget = function (target) {
        document.querySelector(target).classList.add('hide');
    };
    App.prototype.showTarget = function (target) {
        document.querySelector(target).classList.remove('hide');
    };
    App.prototype.openPage = function (from, to) {
        if (from != '') {
            this.hideTarget("#" + from);
        }
        if (to != '') {
            this.showTarget("#" + to);
        }
    };
    App.prototype.toast = function (text, delay) {
        if (delay === void 0) { delay = 2000; }
        var el = document.createElement('div');
        el.setAttribute('class', 'toast');
        el.innerHTML = text;
        document.body.append(el);
        setTimeout(function () {
            document.body.removeChild(el);
        }, delay);
    };
    return App;
}());
(new App()).run();
