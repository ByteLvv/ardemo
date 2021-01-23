var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * WebAR
 *
 * 技术支持： https://www.wujianar.com
 */
class WebAR {
    constructor(endpoint, token, interval = 500) {
        this.isSearching = false;
        // 摄像头设置参数列表
        this.devices = [
            { audio: false, video: { facingMode: { exact: 'environment' } } },
            { audio: false, video: true }
        ];
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
    tryCamera() {
        return __awaiter(this, void 0, void 0, function* () {
            let bl = false;
            for (const device of this.devices) {
                if (bl) {
                    break;
                }
                yield this.openCamera(device).then(() => {
                    bl = true;
                    console.info('camera opened success:', JSON.stringify(device));
                }).catch(err => {
                    console.warn('camera opened fail:', JSON.stringify(device));
                    console.info(err);
                });
            }
            return bl ? Promise.resolve(bl) : Promise.reject(bl);
        });
    }
    /**
     * 打开摄像头
     * 摄像头设置参数请查看： https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @param constraints
     * @returns {Promise<T>}
     */
    openCamera(constraints) {
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
                    }
                    else if (cameraSize.width < window.innerWidth) {
                        this.videoElement.setAttribute('width', `${window.innerWidth}px`);
                    }
                    resolve();
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
    capture() {
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
    startSearch(callback, autoStop = true) {
        this.timer = window.setInterval(() => {
            if (this.isSearching) {
                return;
            }
            this.isSearching = true;
            this.capture().then(blob => {
                const data = new FormData();
                data.append('file', blob);
                this.httpPost(data).then(res => res.json()).then(rs => {
                    this.isSearching = false;
                    if (rs.code === 0) {
                        if (autoStop) {
                            this.stopSearch();
                        }
                        callback(rs.result);
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
    stopSearch() {
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
    httpPost(data) {
        return window.fetch(this.endpoint + '/search', {
            method: 'POST',
            headers: {
                'Authorization': this.token
            },
            body: data
        });
    }
}
