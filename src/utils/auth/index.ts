const TokenKey = 'admin-token';
const TokenPrefix = 'Bearer ';
function isLogin() {
  return !!uni.getStorageSync(TokenKey);
}
function getToken() {
  return uni.getStorageSync(TokenKey) || "82ea98ba-b2eb-4825-b487-e27f7e71b456";
}
function setToken(token: string) {
  uni.setStorageSync(TokenKey, token);
}
function clearToken() {
  uni.removeStorageSync(TokenKey);
}
export { clearToken, getToken, isLogin, setToken, TokenPrefix };
