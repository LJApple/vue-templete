import CryptoJS from 'crypto-js'
import JsEncrypt from 'jsencrypt'
const secretKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuT+FULiUbth2W6v1v4BO1/nrDbdJZ8XVMVPStZQmGV08m3rKJ/eEkCqz42Swo78Bhytq6pkzGy5jQeAwhVcgJc9JjxBlwhFw6x3E/CMH4J+j/WqaNyxjUSG7N+b4XHQc18UMEI8BUQcXTwToUo/lCskf9wgdQNsGI4vqeosEmIYZiwG5suH3tcoUGf4NZJGw/2zxqhRaSZu/XnrHwqRHrI2EASZ9yokKW2phQhcMxcn+P7dliFp3Xyn+rEuHh5VhLLWgyaVu/GrQh/SE3cn+Xf+t2X9vMNGE85g7WnGZYX+TKdzvcaZoTWPU1wWSG7BmmehpryHZ/hMLBgfl+wQaywIDAQAB'
export const CryptoUtil = {
  /**
   * RSA加密方法
   * @param content 要加密的字符串
   * @returns {string} 加密结果
   */
  rsaEncrypt: (content) => {
    let encryptor = new JsEncrypt(); // 新建JSEncrypt对象
    encryptor.setPublicKey(`-----BEGIN PUBLIC KEY-----${secretKey}-----END PUBLIC KEY-----`); // 设置公钥
    return encryptor.encrypt(content)
  },
  /**
   * AES加密方法
   * @param content 要加密的字符串
   * @returns {string} 加密结果
   */
  aesEncrypt: (content) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const srcs = CryptoJS.enc.Utf8.parse(content);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  },
  /**
   * 解密方法
   * @param encryptStr 密文
   * @returns {string} 明文
   */
  aesDecrypt: (encryptStr) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const decrypt = CryptoJS.AES.decrypt(encryptStr, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
}




// md5 加密
const md5 = str => CryptoJS.MD5(str).toString().toUpperCase()
export const sign = (params, appKey, appSecret) => {
  const obj = {}
  let str = ''
 
  for (const k in params) {
    if (['sign', 'appKey'].includes(k) || k instanceof Array || k instanceof Object || params[k] === undefined) {
      continue
    }
 
    obj[k] = params[k]
  }
 
  Object.keys(obj).sort().forEach(k => {
    str += obj[k]
  })
  str = encodeURI(`${ appKey }${ str }${ appSecret }`).toUpperCase()
  return md5(str);
}
