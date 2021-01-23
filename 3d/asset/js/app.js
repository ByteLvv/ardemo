class App {
    constructor() {
        // 认证token,请从官网获取
        const token = 'YzliYjE5YzFmYTY1MGYyMmM1OTc2YTEyZDlkNGJkZmQ4OGU3NThhYTIxY2RiZWFhN2Q1MDg3ZjE0MWM5NjIzM3siYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjUyODY1Mzc1MzEwfQ==';
        this.webAR = new WebAR('https://887f162aea684948a792533d5fef646d.iss-cn1.wujianar.com', token, 1000);
        this.model = new Model();
        this.progress = document.querySelector('#btnProgress');
        if (window.VConsole)
            new VConsole();
    }
    run() {
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
                // 开始识别
                this.search();
            }).catch(err => {
                isOpening = false;
                console.error(err);
                alert('打开摄像头失败');
            });
        });
        // 点击直接体验
        document.querySelector('#btnShow').addEventListener('click', () => {
            this.openPage('page1', 'page2');
            this.showModel();
        });
        // 关闭按钮
        document.querySelector('#btnCloseShow').addEventListener('click', () => {
            this.model.removeModel();
            this.showTarget('#scanTip');
            this.hideTarget('#btnCloseShow');
            this.search();
        });
    }
    /**
     * 识别
     */
    search() {
        this.webAR.startSearch((msg) => {
            this.toast('识别成功');
            this.showTarget('#btnCloseShow');
            console.info(msg);
            // 识别成功,加载模型
            // 建议将模型参数保存在云识别的brief字段中,可以在服务端动态更新调整模型参数
            this.showModel(JSON.parse(msg.brief));
        }, true);
    }
    /**
     * 加载模型
     * @param setting
     */
    showModel(setting = null) {
        this.hideTarget('#scanTip');
        if (!setting) {
            // 可以奖setting保存在云识别的brief字段中
            // setting = {
            //     "modelUrl": "asset/models/SambaDancing.fbx",
            //     "scale": 0.03,
            //     "position": [0, -2, 0],
            //     "clipAction": 0
            // };
            //
            setting = {
                "modelUrl": "asset/models/RobotExpressive.glb",
                "scale": 0.85,
                "position": [0, -2, 0],
                "clipAction": 6
            };
        }
        // 加载进度
        this.showTarget('#btnProgress');
        this.progress.value = 0;
        this.model.loadModel(setting, (e) => {
            const v = Math.floor(e.loaded / (e.total * 1.0) * 100);
            this.progress.value = v;
            if (v >= 100) {
                // 在低端上会有卡顿，直接跳过100%
                window.setTimeout(() => {
                    this.hideTarget('#btnProgress');
                }, 1000);
            }
        });
    }
    isIos() {
        return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    }
    isWeiXin() {
        return /micromessenger/.test(navigator.userAgent.toLowerCase());
    }
    hideTarget(target) {
        document.querySelector(target).classList.add('hide');
    }
    showTarget(target) {
        document.querySelector(target).classList.remove('hide');
    }
    openPage(from, to) {
        if (from != '') {
            this.hideTarget(`#${from}`);
        }
        if (to != '') {
            this.showTarget(`#${to}`);
        }
    }
    toast(text, delay = 2000) {
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
