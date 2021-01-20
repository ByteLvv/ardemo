class App {
    private webAR: WebAR;

    constructor() {
        // 认证token,请从官网获取
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

                    // 识别成功,加载模型
                    // 建议将模型参数保存在云识别的brief字段中,可以在服务端动态更调整模型参数
                    this.showModel(JSON.parse(msg.brief));
                    // this.showModel();
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
            this.openPage('page1', 'page2');
            this.showModel();
        });
    }

    private hideScan(): void {
        document.querySelector('#scanTip').classList.add('hide');
    }

    private openPage(from: string, to: string): void {
        if (from != '') {
            document.querySelector(`#${from}`).classList.add('hide');
        }

        if (to != '') {
            document.querySelector(`#${to}`).classList.remove('hide');
        }
    }

    private showModel(setting: any = null): void {
        this.hideScan();

        if (!setting) {
            // 可以奖setting保存在云误识别的brief字段中
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
        const m = new Model();

        m.loadModel(setting, (e) => {
            // 加载进度
            console.info(e.loaded, e.total);
        });
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