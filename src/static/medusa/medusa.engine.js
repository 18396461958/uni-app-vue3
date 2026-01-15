/* eslint-disable */
window.closeServe = function () {
  if (sdk) {
    sdk.close();
    up_track = null;
  }
};
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
      str += String.fromCharCode(
        ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
      );
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

function MessageReceived(info) {

}

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
  let uris = null;
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

  for (var i = 0; i < 15; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }
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
  if (strs[0] == "StartMeasure") DT_bMeasure = true;	// 如果开始测量打开状态
  if (strs[0] == "StopMeasure") DT_bMeasure = false;	// 如果开始测量关闭状态
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
function getPixelScale()
{
  return 1;//getPixelScale()
}
// 鼠标点击
function mousedown(event) {
  // console.log(DT_container.offsetLeft+','+DT_container.offsetTop);
  event.preventDefault();
  event.stopPropagation();
  var offsetData = DT_container.getBoundingClientRect();
  if (event.type = "mousedown" && event.button == 0) {
    DT_bLeftDown = true;
    var msg = `OnLMouseDown_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    // var msg = 'OnLMouseDown_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
    // DT_cPoint = event;
  }
  if (event.type = "mousedown" && event.button == 1) {
    DT_bRighttDown = true;
    var msg = `OnRMouseDown_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    // var msg = 'OnLMouseDown_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
    // DT_cPoint = event;
  }
  // console.log();

  // var msg = 'OnWheel_' + 100 + '_' + (event.clientX-DT_container.offsetLeft) + '_' + (event.clientY-DT_container.offsetTop);
  // var message = new Paho.Message(msg);
  // //console.log("client msg:"+msg);
  // message.destinationName = DT_ChannelName;
  // if (client && client.isConnected()) {
     // client.send(message);
  //}

  // console.log(event);
}

window.up_track ={
  time:0,
  msg:""
}

// 鼠标点击
function mouseup(event) {
  // console.log(event);
  var offsetData = DT_container.getBoundingClientRect();

  if (event.type = "mouseup" && event.button == 0) {
    DT_bLeftDown = false;
    var msg = `OnLMouseUp_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    // var msg = 'OnLMouseUp_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if(msg == up_track.msg){
      let now = new Date().getTime();
      if(now - up_track.time < 10){
        up_track.time = now;
        return;
      }
    }
    up_track.time = new Date().getTime();
    up_track.msg = msg;
    if (client && client.isConnected()) {
      client.send(message);
  }
    // var disX = Math.abs(DT_cPoint.clientX-(event.clientX-DT_container.offsetLeft));
    // var disY = Math.abs(DT_cPoint.clientY-(event.clientY-DT_container.offsetTop));

    // if(Math.sqrt(disX * disX + disY * disY) > 20){  //小范围偏差认为是点击，大范围忽略掉
    // 	return;
    // }

    // console.log(event);
  }
  if (event.type = "mouseup" && event.button == 1) {
    DT_bRighttDown = false;
    var msg = `OnRMouseUp_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    // var msg = 'OnLMouseUp_' + 100 + '_' + 100;
    var message = new Paho.Message(msg);
    // console.log("client msg:"+msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
    // var disX = Math.abs(DT_cPoint.clientX-(event.clientX-DT_container.offsetLeft));
    // var disY = Math.abs(DT_cPoint.clientY-(event.clientY-DT_container.offsetTop));

    // if(Math.sqrt(disX * disX + disY * disY) > 20){  //小范围偏差认为是点击，大范围忽略掉
    // 	return;
    // }

    // console.log(event);
  }
  // var msg = 'OnWheel_' + 100 + '_' + (event.clientX-DT_container.offsetLeft) + '_' + (event.clientY-DT_container.offsetTop);
  // var message = new Paho.Message(msg);
  // //console.log("client msg:"+msg);
  // message.destinationName = DT_ChannelName;
  // if (client && client.isConnected()) {
      //client.send(message);
  //}
}


// 鼠标拖动
function mousemove(event) {
  // console.log(event);
  let offsetData = DT_container.getBoundingClientRect();
  if (DT_bLeftDown && event.type == "mousemove" && event.button == 0) {
    let msg = `OnLMouseMove_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    // var msg = 'OnLMouseMove_' + 100 + '_' + 100;
    
    let message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  } else if (DT_bRighttDown && event.type == "mousemove") {
    let msg = `OnRMouseMove_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    let message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  } else if (DT_bMeasure) {
    let msg = `OnLMouseMove_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
    let message = new Paho.Message(msg);
    message.destinationName = DT_ChannelName;
    if (client && client.isConnected()) {
      client.send(message);
  }
  }
  // console.log(event);
}

// 滚轮缩放
function mousewheel(event) {
  var offsetData = DT_container.getBoundingClientRect();
  // if(!bRenderFinish) return;
  var msg = `OnWheel_${-event.deltaY}_${(event.clientX - offsetData.left) * getPixelScale() * DT_RenderWidth / DT_DivWidth}_${(event.clientY - offsetData.top) * getPixelScale() * DT_RenderHeight / DT_DivHeight}`;
  var message = new Paho.Message(msg);
  // console.log("client msg:"+msg);
  message.destinationName = DT_ChannelName;
  if (client && client.isConnected()) {
      client.send(message);
  }

  // bRenderFinish= false;

  // console.log(event);
}

function ConnectServer(renderAddress, dataChannelAddress) {
  var startPlay = function () {
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

  $('#cloud_render_player').bind('contextmenu', function () { return false; });	//屏蔽右键菜单
  DT_container = document.getElementById('cloud_render_player');
  DT_DivWidth = DT_container.clientWidth;
  DT_DivHeight = DT_container.clientHeight;
  // console.log(DT_container.clientWidth);
  DT_container.addEventListener('mouseenter', (event) => {
    document.activeElement.blur();
  });
  DT_container.addEventListener('mousedown', (e) => {
    mousedown(e)
    if (document.getElementById('cloud_render_player_before')) {
      return
    }
    // 创建透明覆盖层  
    const overlay = document.createElement('div');
    // 设置覆盖层的样式
    overlay.id = 'cloud_render_player_before'
    overlay.style.position = 'absolute';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0)'; // 半透明白色  
    overlay.style.pointerEvents = 'auto'; // 允许覆盖层捕获事件  
    overlay.style.zIndex = '9999'; // 确保其在视频上方
    overlay.style.left = DT_container.offsetLeft + 'px';
    overlay.style.top = DT_container.offsetTop + 'px';
    overlay.style.width = DT_DivWidth + 'px';
    overlay.style.height = DT_DivHeight + 'px';
    DT_container.removeEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', (e) => {
      mouseup(e)
      DT_container.addEventListener('mousemove', mousemove, false);
      document.querySelector('#cloud_render_player_before')?.remove()
    }, false);
    overlay.addEventListener('mousemove', mousemove, false);
    DT_container?.parentElement?.appendChild(overlay);
  }, false);
  DT_container.addEventListener('mouseup', (e) => {
    mouseup(e)
    DT_container.addEventListener('mousemove', mousemove, false);
    DT_container.querySelector('#cloud_render_player_before')?.remove()
  }, false);
  DT_container.addEventListener('wheel', mousewheel, false);
  DT_container.addEventListener('mousemove', mousemove, false);
  //$('#cloud_render_player').document.addEventListener('mousedown', mousedown, false);
  //$('.container').context.addEventListener('mousedown', mousedown, false);
  //$('.container').context.addEventListener('mouseup', mouseup, false);
  //$('.container').context.addEventListener('wheel', mousewheel, false);
  //$('.container').context.addEventListener('mousemove', mousemove, false);
  //console.log($('#cloud_render_player').context);
  //$('#cloud_render_player').addEventListener('mousedown', mousedown, false);

  var timeOffset = (new Date()).getTime();
  document.addEventListener('keydown', function (event) {
    if (document.activeElement.tagName === 'INPUT') {
      return;
    }
    // if (event.target.localName == 'input') return;
    if ((new Date()).getTime() - timeOffset < 100) {
      return;
    } else {
      // 获取被按下的按键信息
      var key = event.key;
      SendMessage('KeyDown_' + key);
      timeOffset = (new Date()).getTime();
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
    // window.addEventListener("load", function () { startPlay(); });
    startPlay();
  }
}