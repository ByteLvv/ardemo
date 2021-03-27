# WebAR 快速入门

技术支持：无间AR

官网: [https://www.wujianar.com](https://www.wujianar.com)

3D模型渲染: [https://ardemo.wujianar.com/3d/](https://ardemo.wujianar.com/3d/)

视频播放: [https://ardemo.wujianar.com/video/](https://ardemo.wujianar.com/video/)



# WebAR开发说明

            
### 1 初始化WebAR SDK

```javascript
// 相关参数请从开发者中心获取
const endpointUrl = '识别API地址';
const token = '认证token';
const interval = 500; // 识别间隔(单位为秒)

// 初始化
const webAR = new WebAR(endpointUrl, token, interval);
```


### 2 打开摄像头

可使用两种方式打开摄像头，均返回promise，操作方式**完全相同**。

#### 2.1 使用预定义参数打开摄像头

```javascript
webAR.tryCamera().then(() => {
    // todo 打开成功

    // 开始识别，识别成功后会自动关闭识别功能，不再请求识别API
    webAR.startSearch((msg) => {
        // todo 播放视频或展示3D模型
    });
}).catch(err => {
    // todo 打开失败
});
```

#### 2.2 使用自定参数打开摄像头

```javascript
// 如果打开失败，可使用自定参数方式
// 打开后置摄像参数，参数说明请查看 https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
const constraints = {
    audio: false,
    video: {
        facingMode: {
            exact: 'environment'
        }
    }
};

// 打开摄像头
webAR.openCamera(constraints).then(() => {
    // todo 打开成功
}).catch(err => {
    // todo 打开失败
});
```

### 3. 识别

请将摄像头对准识别图 (示例使用的识别图为marker.jpg)。

### 4. 视频或3D模型渲染

视频播放可以使用HTML5的video；

3D模型渲染可以使用threejs等WebGL库。

如本示例中的 video 与 3d。

### 5. 开发与部署说明

开发环境可以使用 
http://127.0.0.1:3001/3d
或
http://127.0.0.1:3001/video
地址访问。

可以使用本站提供的HTTP WEB服务软件运行：https://github.com/wujianar/simple-server

线上环境建议使用Nginx或Apache软件，需要HTTPS域名支持。

### 6. 示例下载

[示例下载: https://github.com/wujianar/ardemo](https://github.com/wujianar/ardemo)
