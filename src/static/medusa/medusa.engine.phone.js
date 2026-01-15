/* eslint-disable */
window.closeServe = function() {
  if (sdk) {
    sdk.close();
    startDistance = null;
    scaleFactor = null;
    lastExecutionTime = null
  }
};

// 节流函数
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function(...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
function utf8ArrayToString(array) {
  var str = "";
  var i = 0;
  var c, c2, c3;
  while (i < array.length) {
    c = array[i];
    if (c < 128) {
      str += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      c2 = array[i + 1];
      str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = array[i + 1];
      c3 = array[i + 2];
      str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }

  return str;
}

var DT_cPoint = null;
var DT_bLeftDown = false;
var DT_bRighttDown = false;
var DT_RenderWidth = 1792;
var DT_RenderHeight = 1008;

var DT_DivWidth = 1792;
var DT_DivHeight = 1008;
var DT_ChannelName = "";
var DT_container;
var DT_bMeasure = false; // 是否在测量，如果在测量需要持续发鼠标移动的位置

var bRenderFinish = true;
var client = null;
var sdk = null; // Global handler to do cleanup when replaying.
var mqttIp = "";
var mqttPort = "";
var mqttClientId = "";
// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("connect success!");
  client.subscribe(DT_ChannelName);
  MessageReceived("CmdConnected");
}
// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log(`onConnectionLost:${responseObject.errorMessage}`);
  }
  medusa_mqtt_connect();
}
// called when a message arrives
function onMessageArrived(message) {
  // console.log(message);
  const utf8Bytes = new Uint8Array([228, 184, 150, 229, 144, 151]);

  // 创建一个TextDecoder对象
  const decoder = new TextDecoder("utf-8");

  // 将字节数组转换为字符串
  const utf8String = decoder.decode(message.payloadBytes);

  // console.log(utf8String);

  var result = utf8ArrayToString(message.payloadBytes);
  // console.log(result);

  if (result == "RenderFinish") bRenderFinish = true;

  MessageReceived(result);

  // console.log("onMessageArrived:" + message.payloadString);
}

function MessageReceived(info) {}

function medusa_mqtt_connect(hostname, port, clientId) {
  hostname = hostname || mqttIp;
  port = port || mqttPort;
  clientId = clientId || mqttClientId;

  if (!port) port = location.protocol.includes('https') ? 443 : 80
  if (client == null) client = new Paho.Client(hostname, port, clientId);
  else return;
  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  // connect the client
  window.uris = null;
  if (window.appConfig && window.appConfig.engineAgent) {
    uris = ["ws://" + hostname + ":" + port + "/dp_engine/mqtt"]
  }

  client.connect({
    onSuccess: onConnect,
    uris: uris,
    useSSL: location.protocol == 'https:' ? true : false
  });
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 15; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text; // +text;
}

function InitMessage(ipAddress, port2) {
  // medusa_mqtt_connect("220.196.62.226",30007,makeid());
  // medusa_mqtt_connect("192.168.10.35",30007,makeid());
  mqttIp = ipAddress;
  mqttPort = port2;
  mqttClientId = makeid();
  medusa_mqtt_connect(ipAddress, port2, mqttClientId);
}

// 发送具体的指令给云渲染服务器
function SendMessage(info) {
  var msg = info;
  var message = new Paho.Message(msg);
  var strs = [];
  strs = msg.toString().split("_");
  if (strs[0] == "StartMeasure") DT_bMeasure = true; // 如果开始测量打开状态
  if (strs[0] == "StopMeasure") DT_bMeasure = false; // 如果开始测量关闭状态
  // console.log("client msg:"+msg);
  message.destinationName = DT_ChannelName;
  if (client && client.isConnected()) {
      client.send(message);
  }
}

function medusa_publish(x, y) {
  var msg = `mousestart_${x}_${y}_ds好的自己`;
  var message = new Paho.Message(msg);
  // console.log("client msg:"+msg);
  message.destinationName = DT_ChannelName;
  if (client && client.isConnected()) {
      client.send(message);
  }
}
window.startDistance = 0; // 起始距离
window.scaleFactor = 1; // 当前缩放因子

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
// 鼠标点击
function mousedown(event) {
  // console.log(DT_container.offsetLeft+','+DT_container.offsetTop);
  event.preventDefault();
  event.stopPropagation();
  var offsetData = DT_container.getBoundingClientRect();
  if (!DT_bRighttDown && event.touches.length < 2) {
    DT_bLeftDown = true;
    var msg =
      `OnLMouseDown_${
        ((event.touches[0].clientX * window.devicePixelRatio - offsetData.left * window.devicePixelRatio) *
        DT_RenderWidth) /
        DT_DivWidth
      }_${
        ((event.touches[0].clientY * window.devicePixelRatio - offsetData.top * window.devicePixelRatio) *
        DT_RenderHeight) /
        DT_DivHeight}`;
    var message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  } else if (DT_bRighttDown) {
    DT_bRighttDown = true;
    var msg =
      `OnRMouseDown_${
        ((event.touches[0].clientX - offsetData.left) * window.devicePixelRatio * DT_RenderWidth) / DT_DivWidth
      }_${
        ((event.touches[0].clientY - offsetData.top) * window.devicePixelRatio * DT_RenderHeight) / DT_DivHeight}`;
    // var msg = 'OnLMouseDown_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  }
  if (event.touches.length === 2) {
    startDistance = getDistance(event.touches);
  }
}

// 鼠标点击
function mouseup(event) {
  var offsetData = DT_container.getBoundingClientRect();
  if (!DT_bRighttDown && event.type == "touchend" && event.changedTouches.length === 1) {
    DT_bLeftDown = false;
    var msg =
      `OnLMouseUp_${
        ((event.changedTouches[0].clientX * window.devicePixelRatio - offsetData.left * window.devicePixelRatio) *
        DT_RenderWidth) /
        DT_DivWidth
      }_${
        ((event.changedTouches[0].clientY * window.devicePixelRatio - offsetData.top * window.devicePixelRatio) *
        DT_RenderHeight) /
        DT_DivHeight}`;
    var message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  } else if (DT_bRighttDown) {
    var msg =
      `OnRMouseUp_${
        ((event.changedTouches[0].clientX - offsetData.left) * window.devicePixelRatio * DT_RenderWidth) / DT_DivWidth
      }_${
        ((event.changedTouches[0].clientY - offsetData.top) * window.devicePixelRatio * DT_RenderHeight) / DT_DivHeight}`;
    // var msg = 'OnLMouseUp_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  }
}

// 鼠标拖动
function mousemove(event) {
  event.stopPropagation();
  var offsetData = DT_container.getBoundingClientRect();
  if (!DT_bRighttDown && DT_bLeftDown && event.type == "touchmove" && event.touches.length < 2) {
    var msg =
      `OnLMouseMove_${
        ((event.touches[0].clientX - offsetData.left) * window.devicePixelRatio * DT_RenderWidth) / DT_DivWidth
      }_${
        ((event.touches[0].clientY - offsetData.top) * window.devicePixelRatio * DT_RenderHeight) / DT_DivHeight}`;

    var message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  }
  if (event.touches.length === 2) {
    const currentDistance = getDistance(event.touches);
    const distanceDelta = currentDistance - startDistance; // 计算距离变化量
    scaleFactor += distanceDelta / 200; // 可调整的缩放因子，200为可调的比例
    startDistance = currentDistance; // 更新起始距离

    mousewheel(event, distanceDelta);

    // 更新你的图形或元素的缩放
    // 例如: element.style.transform = `scale(${scaleFactor * scale})`;

    // 阻止默认行为，防止页面滚动
    event.preventDefault();
  }
  if (DT_bRighttDown) {
    var msg =
      `OnRMouseMove_${
        ((event.touches[0].clientX * window.devicePixelRatio - offsetData.left * window.devicePixelRatio) *
        DT_RenderWidth) /
        DT_DivWidth
      }_${
        ((event.touches[0].clientY * window.devicePixelRatio - offsetData.top * window.devicePixelRatio) *
        DT_RenderHeight) /
        DT_DivHeight}`;
    var message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  }
}

window.lastExecutionTime = 0; // 记录上一次执行的时间  
window.executionLimit = 1000 / 6; // 每秒最多执行3次  

function mousewheel(event, startDistance) {  
  const currentTime = Date.now(); // 获取当前时间  

  // 检查距离上次执行的时间是否超过节流限制  
  if (currentTime - lastExecutionTime < executionLimit) {  
    return; // 如果没有超过限制，直接返回，放弃此次执行  
  }  

  lastExecutionTime = currentTime; // 更新上次执行时间  

  var offsetData = DT_container.getBoundingClientRect();  
  var msg =  
    `OnWheel_${  
      startDistance > 0 ? 100:-100 
    }_${  
      Math.ceil(((event.touches[0].clientX - offsetData.left) * window.devicePixelRatio * DT_RenderWidth) / DT_DivWidth * 100)/100
    }_${  
      Math.ceil(((event.touches[0].clientY - offsetData.top) * window.devicePixelRatio * DT_RenderHeight) / DT_DivHeight *100)/100}`;  
  var message = new Paho.Message(msg);  
  message.destinationName = DT_ChannelName;  
  if (client && client.isConnected()) {
      client.send(message);
  }  
}
function ConnectServer(renderAddress, dataChannelAddress) {
  var startPlay = function() {
    $("#cloud_render_player").show();

    // Close PC when user replay.
    if (sdk) {
      sdk.close();
    }
    sdk = new SrsRtcPlayerAsync();

    // https://webrtc.org/getting-started/remote-streams
    $("#cloud_render_player").prop("srcObject", sdk.stream);
    // Optional callback, SDK will add track to stream.
    // sdk.ontrack = function (event) { console.log('Got track', event); sdk.stream.addTrack(event.track); };

    // For example: webrtc://r.ossrs.net/live/livestream
    // var url = $("#txt_url").val();
    // var url = "webrtc://123.57.2.172:30003/live/livestream2";
    // var url = 'webrtc://'+ ipAddress + ':'+ port1+ '/live/livestream';
    // var url = 'webrtc://123.57.2.172:30013/live/livestream';
    // var url = 'webrtc://220.196.62.226/live/lx1';

    var strs = [];
    strs = dataChannelAddress.split("/");
    var strs1 = [];
    strs1 = strs[2].split(":");

    DT_ChannelName = strs[3];

    InitMessage(strs1[0], strs1.length > 1 ? parseInt(strs1[1]) : null);
    sdk.play(renderAddress).then(function (session) {
      //$('#sessionid').html(session.sessionid);
      //$('#simulator-drop').attr('href', session.simulator + '?drop=1&username=' + session.sessionid);
    }).catch(function (reason) {
      sdk.close();
      $('#cloud_render_player').hide();
      console.error(reason);
    });
  };

  $("#cloud_render_player").on("contextmenu", () => false); // 屏蔽右键菜单
  // 禁用缩放手势
  $("#cloud_render_player").on("gesturestart", () => false);
  $("#cloud_render_player").on("gesturechange", () => false);
   $("#cloud_render_player").on("touchstart", () => false);
  $("#cloud_render_player").on("touchmove", () => false);
  // 禁用缩放手势

  // 获取视频元素
  const videoContainer = document.querySelector("#video-webrtc");

  // 创建按钮元素
  const button = document.createElement("button");
  button.style.position = "absolute"; /* 绝对定位 */
  button.style.top = "80px"; /* 垂直居中 */
  button.style.right = "15px"; /* 水平居中 */
  button.style.padding = "5px 10px";
  button.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; /* 半透明背景 */
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.zIndex = "9999";

  // 添加初始的图标和文本
  const icon = document.createElement("i");
  icon.className = "el-icon-rank"; // 初始为移动图标
  button.appendChild(icon);
  button.appendChild(document.createTextNode(" 切换模型移动"));
  button.textContentFlag = false;

  // 按钮点击事件
  button.onclick = function() {
    if (!button.textContentFlag) {
      DT_bRighttDown = true;
      icon.className = "el-icon-place"; // 切换为旋转图标
      button.childNodes[1].textContent = " 切换模型旋转"; // 更新文本
      button.textContentFlag = true;
    } else {
      DT_bRighttDown = false;
      icon.className = "el-icon-rank"; // 切换为移动图标
      button.childNodes[1].textContent = " 切换模型移动"; // 更新文本
      button.textContentFlag = false;
    }
  };
  window.flagButton = localStorage.getItem("preViewMode");
  if(flagButton){
      // 创建按钮元素
  const button2 = document.createElement("button");
  button2.style.position = "absolute"; /* 绝对定位 */
  button2.style.bottom = "15px"; /* 垂直居中 */
  button2.style.right = "15px"; /* 水平居中 */
  button2.style.padding = "5px 10px";
  button2.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; /* 半透明背景 */
  button2.style.border = "none";
  button2.style.borderRadius = "5px";
  button2.style.cursor = "pointer";
  button2.style.fontSize = "14px";
  button2.style.zIndex = "9999";

  // 添加初始的图标和文本
  const icon2 = document.createElement("i");
  icon2.className = "el-icon-back"; // 初始为移动图标
  button2.appendChild(icon2);
  button2.appendChild(document.createTextNode("退出大屏模式"));
  button2.textContentFlag = false;

  // 按钮点击事件
  button2.onclick = function() {
    localStorage.removeItem("preViewMode");
    location.reload();

  };
  videoContainer.appendChild(button2);
  }

  // 将按钮添加到视频容器中
  videoContainer.appendChild(button);
  
  DT_container = document.getElementById("cloud_render_player");
  DT_DivWidth = DT_container.clientWidth;
  DT_DivHeight = DT_container.clientHeight;
  // console.log(DT_container.clientWidth);
  window.touchstart = throttle(mousedown, 5);
  window.touchend = throttle(mouseup, 1);
  window.touchmove = throttle(mousemove, 5);
  DT_container.addEventListener(
    "touchstart",
    (e) => {
      touchstart(e);
    },
    false
  );
  DT_container.addEventListener(
    "touchend",
    (e) => {
      touchend(e);
    },
    false
  );
  DT_container.addEventListener("wheel", mousewheel);
  DT_container.addEventListener("touchmove", touchmove, { passive: true });

  var timeOffset = new Date().getTime();
  document.addEventListener("keydown", (event) => {
    if (document.activeElement.tagName === "INPUT") {
      return;
    }
    // if (event.target.localName == 'input') return;
    if (new Date().getTime() - timeOffset < 100) {

    } else {
      // 获取被按下的按键信息
      var key = event.key;
      SendMessage(`KeyDown_${key}`);
      timeOffset = new Date().getTime();
    }

    // console.log("按下了" + key);
  });
  document.addEventListener("keyup", (event) => {
    // 获取被按下的按键信息
    var key = event.key;
    SendMessage(`KeyUp_${key}`);
    // console.log("松开了" + key);
  });

  $("#cloud_render_player").hide();
  var query = parse_query_string();
  // srs_init_rtc("#txt_url", query);

  // $("#btn_play").click(function() {
  //     $('#cloud_render_player').prop('muted', false);
  //     startPlay();
  // });

  query.autostart = "true";

  if (query.autostart === "true") {
    $("#cloud_render_player").prop("muted", true);
    // console.warn('For autostart, we should mute it, see https://www.jianshu.com/p/c3c6944eed5a ' +
    //    'or https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#audiovideo_elements');
    startPlay();
  }
}