/**
 * WebAR
 *
 * 技术支持： https://www.wujianar.com
 */
class WebAR {
    private readonly endpoint: string;
    private readonly token: string;
    private readonly interval: number;
    private readonly canvasElement: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;
    private readonly videoElement: HTMLVideoElement;
    private timer: number;
    private isSearching: boolean = false;

    // 摄像头设置参数列表
    private devices = [
        {audio: false, video: {facingMode: {exact: 'environment'}}},
        {audio: false, video: true}
    ];

    constructor(endpoint: string, token: string, interval: number = 500) {
        this.interval = interval;
        this.endpoint = endpoint;
        this.token = token;

        // 获取/创建视频播放元素
        this.videoElement = document.querySelector('#webArVideo');
        if (this.videoElement == null) {
            this.videoElement = document.createElement('video');
            this.videoElement.setAttribute('playsinline', 'playsinline');
            document.body.append(this.videoElement);
        }

        // 创建canvas，截取摄像头图片时使用
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.setAttribute('width', `${window.innerWidth}px`);
        this.canvasElement.setAttribute('height', `${window.innerHeight}px`);
        this.canvasContext = this.canvasElement.getContext('2d');
    }

    /**
     * 使用预设置参数，遍历出所有参数，尝试打开摄像头
     */
    public async tryCamera(): Promise<any> {
        let bl = false;
        for (const device of this.devices) {
            if (bl) {
                break;
            }
            await this.openCamera(device).then(() => {
                bl = true;
                console.info('camera opened success:', JSON.stringify(device));
            }).catch(err => {
                console.warn('camera opened fail:', JSON.stringify(device));
                console.info(err);
            });
        }

        return bl ? Promise.resolve(bl) : Promise.reject(bl);
    }

    /**
     * 打开摄像头
     * 摄像头设置参数请查看： https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @param constraints
     * @returns {Promise<T>}
     */
    public openCamera(constraints?: MediaStreamConstraints): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                this.videoElement.srcObject = stream;
                this.videoElement.play().then(() => {
                    console.info('video play success');
                }).catch(err => {
                    console.info('video play error:', err);
                });

                this.videoElement.onloadedmetadata = () => {
                    const cameraSize = {
                        width: this.videoElement.offsetWidth,
                        height: this.videoElement.offsetHeight
                    };

                    // 横竖屏简单处理
                    if (window.innerWidth < window.innerHeight) {
                        if (cameraSize.height < window.innerHeight) {
                            this.videoElement.setAttribute('height', `${window.innerHeight}px`);
                        }
                    } else if (cameraSize.width < window.innerWidth) {
                        this.videoElement.setAttribute('width', `${window.innerWidth}px`);
                    }
                    resolve(true);
                };
            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * 截取摄像头图片
     * @returns {string}
     */
    public capture(): Promise<any> {
        return new Promise(((resolve, reject) => {
            this.canvasContext.drawImage(this.videoElement, 0, 0, this.videoElement.offsetWidth, this.videoElement.offsetHeight);
            this.canvasElement.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.5);
        }));
    }

    /**
     * 识别
     * @param callback
     * @param autoStop
     */
    public startSearch(callback: Function, autoStop: boolean = true): void {
        this.timer = window.setInterval(() => {
            if (this.isSearching) {
                return
            }

            this.isSearching = true;

            this.capture().then(blob => {
                const data = new FormData();
                data.append('file', blob);
                this.httpPost(data).then(res => res.json()).then(rs => {
                    this.isSearching = false;
                    if (rs.code === 200) {
                        if (autoStop) {
                            this.stopSearch();
                        }
                        callback(rs.data);
                    }
                }).catch(err => {
                    this.isSearching = false;
                    console.info(err);
                });
            }).catch(err => {
                this.isSearching = false;
                console.info(err);
            });
        }, this.interval);
    }

    /**
     * 停止识别
     */
    public stopSearch(): void {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
            this.isSearching = false;
        }
    }

    /**
     * 发送HTTP请求
     * @param data
     */
    private httpPost(data: any): Promise<any> {
        return window.fetch(this.endpoint + '/search', {
            method: 'POST',
            headers: {
                'Authorization': this.token
            },
            body: data
        });
    }
}
