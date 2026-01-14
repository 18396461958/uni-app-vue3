// import mqtt from 'mqtt';
// import { v4 as uuid } from 'uuid';
// import { SrsRtcWhipWhepAsync } from '../srs.sdk.js';
// import { EventHandler } from './EventHandler.js';
// // Add a type declaration for SrsRtcWhipWhepAsync if it doesn't exist


// interface StreamEngineEventMap {
//     'pointerdown': PointerEvent;
//     'pointerup': PointerEvent;
//     'pointermove': PointerEvent;
//     'keydown': KeyboardEvent;
//     'keyup': KeyboardEvent;
//     'message': any;
//     'Connected': any
// }


// export class StreamEngine extends EventHandler<StreamEngineEventMap> {

//     width = 1792;
//     height = 1008;

//     /**
//      * @type {mqtt.Client}
//      */
//     client!: mqtt.MqttClient;

//     /**
//     * @type {string[]}
//     */
//     topics: string[] = [];
//     /**
//     * @type {string}
//     */
//     url!: string;
//     /**
//     * @type {string}
//     */
//     webrtc!: string;
//     /**
//     * @type {string}
//     */
//     engineId!: string;
//     /**
//     * @type {string}
//     */
//     clientId!: string;

//     srs: any
//     viewElement!: HTMLVideoElement;

//     constructor() {
//         super();
//         console.log("StreamEngine constructor");
//         this.clientId = uuid();
//         this.srs = SrsRtcWhipWhepAsync();
//     }

//     /**
//      * 
//      * @param {string} url 
//      * @param {string} webrtc 
//      * @param {string} engineId 
//      */
//     start(url: string, webrtc: string, engineId: string) {
//         this.url = url;
//         this.webrtc = webrtc;
//         this.engineId = engineId;
//         const options = {
//             clean: true,
//             connectTimeout: 4000,
//             clientId: this.clientId,
//             username: 'stream_engine',
//             password: 'stream_engine',
//         }
//         this.client = mqtt.connect(url, options)
//         this.client.on('connect', this.onConnect.bind(this));
//         this.client.on('message', this.onMessage.bind(this));
//         document.addEventListener('pointerdown', this.onPointerdown.bind(this));
//         document.addEventListener('pointerup', this.onPointerup.bind(this));
//         document.addEventListener('pointermove', this.onPointermove.bind(this));
//         document.addEventListener('keydown', this.onKeydown.bind(this));
//         document.addEventListener('keyup', this.onKeyup.bind(this));
//         document.addEventListener('wheel', this.onWheel.bind(this));
//     }

//     getVideoSize() {
//         return { width: this.viewElement.offsetWidth, height: this.viewElement.offsetHeight };
//     }

//     GetPoint(e: { offsetX: number; offsetY: number }) {
//         let { width, height } = this.getVideoSize();
//         let x = e.offsetX / width * this.width;
//         let y = e.offsetY / height * this.height;
//         return { x, y }
//     }
//     async play(videoId: string) {

//         this.viewElement = document.getElementById(videoId) as HTMLVideoElement;
//         this.viewElement['srcObject'] = this.srs.stream;
//         this.srs.play(this.webrtc);
//     }

//     onConnect() {
//         console.log('Connected')
//         this.client.subscribe(this.engineId, (err) => {
//             if (!err) {
//                 this.client.publish('test', 'Hello mqtt')
//             }
//             this.dispatchEvent({ type: 'Connected', data: this });
//         })
//     }
//     onMessage(topic: string, message: any) {
//         if (topic == this.engineId)
//             this.dispatchEvent({ type: 'message', data: message });
//     }

//     onPointerdown(event: PointerEvent) {
//         if (this.viewElement != event.target) return;
//         let buttonType = '';
//         let { x, y } = this.GetPoint(event);
//         switch (event.button) {
//             case 0:
//                 this.SendMessage(`OnLMouseDown_${x}_${y}`);
//                 break;
//             case 1:
//                 this.SendMessage(`OnLMouseDown_${x}_${y}`);
//                 break;
//             case 2:
//                 this.SendMessage(`OnRMouseDown_${x}_${y}`);
//                 break;
//             default:
//         }
//         this.dispatchEvent({ type: 'pointerdown', data: event });
//     }

//     onPointerup(event: PointerEvent) {
//         if (this.viewElement != event.target) return;

//         let { x, y } = this.GetPoint(event);
//         switch (event.button) {
//             case 0:
//                 this.SendMessage(`OnLMouseUp_${x}_${y}`);
//                 break;
//             case 1:
//                 this.SendMessage(`OnRMouseUp_${x}_${y}`);
//                 break;
//             case 2:
//                 this.SendMessage(`OnRMouseUp_${x}_${y}`);
//                 break;
//             default:
//         }
//         this.dispatchEvent({ type: 'pointerup', data: event });
//     }
//     onPointermove(event: PointerEvent) {
//         if (this.viewElement != event.target) return;

//         let { x, y } = this.GetPoint(event);
//         switch (event.buttons) {
//             case 0:
//             // this.SendMessage(`OnLMouseMove_${x}_${y}`);
//             // break;
//             case 1:
//                 this.SendMessage(`OnLMouseMove_${x}_${y}`);
//                 break;
//             case 2:
//                 this.SendMessage(`OnRMouseMove_${x}_${y}`);
//                 break;
//             case 4:
//                 this.SendMessage(`OnMouseMove_${x}_${y}`);
//                 break;
//             default:
//         }
//         this.dispatchEvent({ type: 'pointerdown', data: { event } });
//     };

//     onWheel(event: WheelEvent) {
//         if (this.viewElement != event.target) return;

//         let { x, y } = this.GetPoint(event);
//         this.SendMessage(`OnWheel_${-event.deltaY}_${x}_${y}`);
//         this.dispatchEvent({ type: 'pointerdown', data: { event } });
//     }
//     onKeydown(event: KeyboardEvent) {
//         if (this.viewElement != event.target) return;

//         console.log('onKeydown')
//         this.dispatchEvent({ type: 'keydown', data: event });
//     };


//     onKeyup(event: KeyboardEvent) {
//         if (this.viewElement != event.target) return;

//         this.dispatchEvent({ type: 'keyup', data: event });
//         console.log('onMousedown')
//     };

//     SendMessage(message: string) {
//         this.client.publish(this.engineId, message);
//     }

//     async GetFunction(cmd: string, filterCallback: (filter: string) => boolean) {
//         return new Promise((resolve: (value: string[]) => void, reject) => {
//             this.SendMessage(cmd);
//             const onMessageHandler = (event: any) => {
//                 if (filterCallback(event.data.toString())) {
//                     resolve(event.data.toString().split('_'));
//                     this.removeEventListener('message', onMessageHandler); // 确保只处理一次消息
//                 }
//             };
//             this.addEventListener('message', onMessageHandler);

//             // 可选：设置超时处理
//             setTimeout(() => {
//                 if (this.hasEventListener('message', onMessageHandler))
//                     reject(new Error(cmd + ' timed out'));
//             }, 10000); // 超时时间为 5 秒
//         });
//     }

//     async GetModelList() {
//         const list = await this.GetFunction('GetModelList', (filter: string) => {
//             return filter.startsWith('ModelList_');
//         });
//         return list.slice(1);
//     }

//     AddModel(ModelName: string, ModelId: string) {
//         this.SendMessage(`AddModel_${ModelName}_${ModelId}`);
//     }
//     ResetViewPort() {
//         this.SendMessage(`ResetViewPort`);
//     }
//     /**
//  * 白天黑夜开关
//  * @param {*} value//0白天、1黑夜
//  */
//     GetTimeModeState() {
//         this.SendMessage(`GetTimeModeState`)
//     };
//     SetTimeMode(value: number) {
//         // 0白天、1黑夜
//         this.SendMessage(`SetTimeMode_${value}`);
//         this.GetTimeModeState();
//     }  /**
//     * 动态体积云开关
//     * @param {*} show 动态体积云
//     * @returns
//     */
//     SetDynamicCloud(show = true) {
//         // 打开（true）/关闭（false）动态体积云
//         this.SendMessage(show ? "ShowDynamicCloud" : "HideDynamicCloud");
//         this.GetDynamicCloudState();
//     }

//     GetDynamicCloudState() {
//         // 获取当前体积云状态
//         this.SendMessage("GetDynamicCloudState");
//     }
//     GetShadowMode() {
//         this.SendMessage("GetShadowMode"); // 获取当前阴影的状态，0为没阴影，1为有阴影
//     }

//     SetShadowMode(value: string) {
//         // 显示/不显示阴影 0为没阴影，1为有阴影
//         this.SendMessage(`SetShadowMode_${value}`);
//         this.GetShadowMode();
//     }
//     HighLightElement(elementId: string, r = 0, g = 0, b = 255, a = 1.0) {
//         if (!elementId) return;
//         this.SendMessage(`${"HighlightElement" + "_"}${elementId}_${r}_${g}_${b}_${a}`);
//     }

//     /**
//      * 清除模型构件高亮效果
//      */
//     async ClearHighlightElement() {
//         this.SendMessage("ClearHighlightElement");
//     }
// }