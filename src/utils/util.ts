//@ts-check

import dayjs from "dayjs";
import CryptoJS from "crypto-js"; 

/**
 * 深度克隆对象、数组
 * @param obj 被克隆的对象
 * @return 克隆后的对象
 */
export function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 随机生成数字
 *
 * 示例：生成长度为 12 的随机数：randomNumber(12)
 * 示例：生成 3~23 之间的随机数：randomNumber(3, 23)
 *
 * @param1 最小值 | 长度
 * @param2 最大值
 * @return int 生成后的数字
 */
/* eslint-disable prefer-rest-params */
export function randomNumber() {
  // 生成 最小值 到 最大值 区间的随机数
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  if (arguments.length === 1) {
    const [length] = arguments;
    // 生成指定长度的随机数字，首位一定不是 0
    const nums = [...Array(length).keys()].map((i) => (i > 0 ? random(0, 9) : random(1, 9)));
    return parseInt(nums.join(""), 10);
  } if (arguments.length >= 2) {
    const [min, max] = arguments;
    return random(min, max);
  }
  return Number.NaN;
}

/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @return string 生成的字符串
 */
export function randomString(length, chats) {
  if (!length) length = 1;
  if (!chats) chats = "0123456789qwertyuioplkjhgfdsazxcvbnm";
  let str = "";
  for (let i = 0; i < length; i++) {
    const num = randomNumber(0, chats.length - 1);
    str += chats[num];
  }
  return str;
}

/**
 * 随机生成uuid
 * @return string 生成的uuid
 */
export function randomUUID() {
  const chats = "0123456789abcdef";
  return randomString(32, chats);
}

/**
 * 下划线转驼峰
 * @param string
 * @returns {*}
 */
export function underLine2CamelCase(string) {
  return string.replace(/_([a-z])/g, (all, letter) => letter.toUpperCase());
}

/**
  * 根据身份证获取 出生日期 年龄
  * @param {String} card
  */
export function extractInfoFromIdCard(card) {
  const birthday = `${card.substring(6, 10)}-${card.substring(10, 12)}-${card.substring(12, 14)}`;
  const day = dayjs();
  const age = Math.floor(dayjs(day).diff(dayjs(birthday), "day") / 365.25);
  return { age: age, birthday: birthday };
}

/**
 * 从 url 参数上获取问号之后的参数组成的对象
 * @param {*} paramsStr 使用&分割的字符串
 * @returns
 */
export const getRequest = (paramsStr) => {
  if (!paramsStr) {
    return {};
  }
  const paramsArr = paramsStr.split("&"); // 将字符串以 & 分割后存到数组中
  const paramsObj = {};
  // 将 params 存到对象中
  paramsArr.forEach((param) => {
    if (/=/.test(param)) { // 处理有 value 的参数
      /* eslint-disable */
      let [key, val] = param.split("="); // 分割 key 和 value
      val = decodeURIComponent(val); // 解码
      val = /^\d+$/.test(val) ? parseFloat(val) : val; // 判断是否转为数字
      if (Object.prototype.hasOwnProperty.call(paramsObj, key)) { // 如果对象有 key，则添加一个值
        paramsObj[key] = [].concat(paramsObj[key], val);
      } else { // 如果对象没有这个 key，创建 key 并设置值
        paramsObj[key] = val;
      }
    } else { // 处理没有 value 的参数
      paramsObj[param] = true;
    }
  });
  return paramsObj;
};

/**
 * 
 * @param {string} value 
 * @returns 
 */
export function encodeCrypto(value) {
  return CryptoJS.SHA1(value).toString();
}