import * as CommonApi from './common';
import * as UserApi from './user';
// 引入自己封装的请求方法 + 核心请求配置类型【和你封装的request.ts里的类型一致】
import { get, post, download } from '@/utils/request';
import type { HttpRequestConfig } from 'uview-plus/libs/luch-request/index';
export { engineApi } from "./engine/engine"
export { CommonApi, UserApi };

/**
 * POST请求公共方法
 * @param url 请求地址
 * @param data 请求体参数
 * @param params URL拼接参数
 * @param headers 请求头配置
 * @returns Promise<T> 接口返回数据泛型
 */
export function postAction<T = any>(
	url: string,
	data?: Record<string, any>,
	params?: Record<string, any>,
	headers?: Record<string, string>
): Promise<T> {
	return post<T>(url, { data, params, header:headers });
}

/**
 * POST请求【强制form-data表单格式】，适配文件上传/表单提交场景
 * @param url 请求地址
 * @param parameter 请求体参数
 * @param headers 自定义请求头（会和默认form-data合并）
 * @returns Promise<T> 接口返回数据泛型
 */
export function httpAction<T = any>(
	url: string,
	parameter?: Record<string, any>,
	headers?: Record<string, string>
): Promise<T> {
	return post<T>(url, {
		data: parameter,
		header: { 'Content-Type': 'multipart/form-data', ...headers }
	});
}

/**
 * PUT请求【注：原逻辑为POST请求方式，此处完全保留原有逻辑不变】
 * @param url 请求地址
 * @param parameter 请求体参数
 * @returns Promise<T> 接口返回数据泛型
 */
export function putAction<T = any>(
	url: string,
	parameter?: Record<string, any>
): Promise<T> {
	return post<T>(url, { data: parameter });
}

/**
 * GET请求公共方法
 * @param url 请求地址
 * @param parameter URL拼接参数
 * @param other 扩展请求配置（透传luch-request原生配置）
 * @returns Promise<T> 接口返回数据泛型
 */
export function getAction<T = any>(
	url: string,
	parameter?: Record<string, any>,
	other?: Partial<HttpRequestConfig>
): Promise<T> {
	return get<T>(url, { params: parameter, ...other });
}

/**
 * 删除请求【带确认弹窗】，默认需要二次确认，取消则返回拒绝态promise
 * @param url 请求地址
 * @param parameter URL拼接参数
 * @param msg 自定义弹窗标题，默认用国际化提示文本
 * @param confirm 是否需要确认弹窗，默认true
 * @returns Promise<T> 接口返回数据泛型 | 取消文案字符串
 */
export function deleteAction<T = any>(
	url: string,
	parameter?: Record<string, any>,
	msg?: string,
	confirm: boolean = true
): Promise<T | string> {
	if (!confirm) {
		return post<T>(url, { params: parameter });
	}
	return new Promise((resolve, reject) => {
		// Modal.confirm({
		// 	title: i18n.global.t('ti-shi') || msg,
		// 	okText: i18n.global.t('confirm'),
		// 	cancelText: i18n.global.t('qu-xiao'),
		// 	type: 'warning',
		// 	content: h('div', { style: 'color:red;' }, i18n.global.t('shan-chu-ti-shi')),
		// 	onOk() {
				post<T>(url, { params: parameter }).then(resolve).catch(reject);
		// 	},
		// 	onCancel() {
		// 		reject(i18n.global.t('qu-xiao-shan-chu'));
		// 	}
		// });
	});
}

/**
 * 下载文件公共方法 【专用于excel导出/文件导出】
 * @param url 请求地址
 * @param parameter URL拼接参数
 * @returns Promise<Blob> 返回二进制文件流
 */
export function downFile(
	url: string,
	parameter?: Record<string, any>
): Promise<Blob> {
	return download<Blob>(url, {
		params: parameter,
		responseType: 'arraybuffer'
	});
}

/**
 * 获取文件服务访问路径 拼接文件完整地址
 * @param avatar 文件相对路径/文件名
 * @param subStr 前缀判断标识，默认http
 * @returns string | undefined 拼接后的完整文件地址/原地址
 */
export function getFileAccessHttpUrl(
	avatar?: string,
	subStr: string = 'http'
): string | undefined {
	if (!avatar) return undefined;
	if (avatar.startsWith(subStr)) {
		return avatar;
	}
	if (avatar.length > 0 && avatar.indexOf('[') === -1) {
		return `${window._CONFIG.staticDomainURL}/${avatar}`;
	}
}

/**
 * 文书签章专用POST请求 【超时时间设置为10分钟】
 * @param url 请求地址
 * @param parameter 请求体参数
 * @returns Promise<T> 接口返回数据泛型
 */
export function signDocPostAction<T = any>(
	url: string,
	parameter?: Record<string, any>
): Promise<T> {
	return post<T>(url, {
		timeout: 10 * 60 * 1000, // 10分钟超时
		data: parameter
	});
}

/**
 * 自定义GET请求【适配数组类型的参数序列化】解决数组参数拼接异常问题
 * @param url 请求地址
 * @param parameter 请求参数(支持数组格式)
 * @returns Promise<T> 接口返回数据泛型
 */
export function customParamsGetAction<T = any>(
	url: string,
	parameter?: Record<string, any | any[]>
): Promise<T> {
	/** 解析数组参数拼接为 &key=val&key=val 格式 */
	const parseArray = (key = '', array: any[] = []): string => {
		return array.map((x) => `${key}=${x}`).join('&');
	};

	return get<T>(url, {
		params: parameter,
		paramsSerializer(params: Record<string, any> = {}) {
			const retArr: string[] = [];
			Object.keys(params).forEach((key) => {
				const val = params[key];
				if (Array.isArray(val)) {
					retArr.push(parseArray(key, val));
				}
				if ((typeof val === 'string' || typeof val === 'number') && val) {
					retArr.push(`${key}=${val}`);
				}
			});
			return retArr.join('&');
		}
	});
}

// ======================== TS全局类型声明(解决全局变量报错) ========================
/** 声明全局变量，避免TS语法报错，与你的业务项目变量一致，无需修改 */
declare global {
	interface Window {
		_CONFIG: {
			staticDomainURL: string;
		};
	}
}