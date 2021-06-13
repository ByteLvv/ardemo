class App {
    private webAR: WebAR;
    private model: Model;
    private progress: HTMLProgressElement;

    constructor() {
        // 认证token,请从官网获取
        const token = 'YTU5NjgxYzU1NDAxM2ZiNWQ0OGMxOGY5Yjk2ZThlYjYxNzY2M2EwOGQ5NmIzMTYzZjYwZDkxOTQwODk2NTc2ZHsiYWNjZXNzS2V5IjoiODg3ZjE2MmFlYTY4NDk0OGE3OTI1MzNkNWZlZjY0NmQiLCJleHBpcmVzIjozMjc4MjM0NzU5NTk4fQ==';
        this.webAR = new WebAR('https://iss-cn1.wujianar.com', token, 1000);
        this.model = new Model();
        this.progress = document.querySelector('#btnProgress');

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
    private search(): void {
        this.webAR.startSearch((msg: any) => {
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
    private showModel(setting: any = null): void {
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

    private isIos(): boolean {
        return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    }

    private isWeiXin(): boolean {
        return /micromessenger/.test(navigator.userAgent.toLowerCase())
    }

    private hideTarget(target: string): void {
        document.querySelector(target).classList.add('hide');
    }

    private showTarget(target: string): void {
        document.querySelector(target).classList.remove('hide');
    }

    private openPage(from: string, to: string): void {
        if (from != '') {
            this.hideTarget(`#${from}`);
        }

        if (to != '') {
            this.showTarget(`#${to}`);
        }
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