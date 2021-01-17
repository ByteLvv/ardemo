class App {
    private webAR: WebAR;

    constructor() {
        // 认证token,请从开发中心获取
        const token = 'YzliYjE5YzFmYTY1MGYyMmM1OTc2YTEyZDlkNGJkZmQ4OGU3NThhYTIxY2RiZWFhN2Q1MDg3ZjE0MWM5NjIzM3siYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjUyODY1Mzc1MzEwfQ==';
        this.webAR = new WebAR('https://887f162aea684948a792533d5fef646d.iss-cn1.wujianar.com', token, 1000);
        if (window.VConsole) new VConsole();
    }

    public run(): void {
        window.onload = () => {
            if (this.isWeiXin() && this.isIos()) {
                this.openPage('page1', 'page3');
                return;
            }
        };

        // 点击扫描
        let isOpening = false;
        document.querySelector('#btnScan').addEventListener('click', () => {
            this.toast('摄像头打开中...');
            if (isOpening) {
                return;
            }

            isOpening = true;
            this.webAR.tryCamera().then(msg => {
                isOpening = false;
                this.openPage('page1', 'page2');

                console.info('打开摄像头成功');

                // 开始识别
                this.webAR.startSearch((msg: any) => {
                    this.toast('识别成功');
                    console.info('识别成功');
                    console.info(msg);
                    this.openPage('page2', 'page4');

                    // 识别成功,播放视频
                    // 建议将视频地址保存在云识别的brief字段中,可以在服务端动态更换视频地址
                    // this.showVideo(JSON.parse(msg.brief));
                    this.showVideo({'videoUrl': 'asset/videos/demo.mp4'});
                });
            }).catch(err => {
                isOpening = false;
                console.info('打开摄像头失败');
                console.error(err);
                alert('打开摄像头失败');
            });
        });

        // 点击直接体验
        document.querySelector('#btnShow').addEventListener('click', () => {
            this.openPage('page1', 'page4');
            this.showVideo({'videoUrl': 'asset/videos/demo.mp4'});
        });
    }

    private openPage(from: string, to: string): void {
        if (from != '') {
            document.querySelector(`#${from}`).classList.add('hide');
        }

        if (to != '') {
            document.querySelector(`#${to}`).classList.remove('hide');
        }
    }

    private showVideo(setting: any): void {
        console.info(setting);
        console.info('showVideo');
        this.playVideo(setting.videoUrl, true);
    }

    private playVideo(videoUrl: string, autoPlay: boolean = true): void {
        const video: HTMLMediaElement = document.querySelector('#showVideo');
        video.setAttribute('src', videoUrl);

        video.play().then(() => {
            console.info('视频播放成功');
        }).catch((err) => {
            console.info('视频播放失败');
            console.info(err);
        });

        if (!autoPlay) {
            window.setTimeout(() => {
                video.pause();
            }, 50);
        }
    }

    private isIos(): boolean {
        return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    }

    private isWeiXin(): boolean {
        return /micromessenger/.test(navigator.userAgent.toLowerCase())
    }

    private toast(text: string, delay = 2000): void {
        const el = document.createElement('div');
        el.setAttribute('class', 'toast');
        el.innerHTML = text;
        document.body.append(el);
        setTimeout(() => {
            document.body.removeChild(el);
        }, delay);
    }
}

(new App()).run();