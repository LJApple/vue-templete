import Schema from 'async-validator';
/*
 *@Description: 判断是否为空
 *@param {arg} any
 *@return [type] 空值返回真 其他返回假
 *@Date: 2019-06-21 16:01:51
*/
export function validatenull(val) {
  if (typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'number') {
    return false;
  }
  if (val instanceof Array) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}') return true;
  } else {
    if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '') {
      return true;
    }
    return false;
  }
  return false;
}
/*
 *@Description: 异步校验器
 *@param {arg} type
 *@return [type]
 *@Date: 2019-06-21 16:05:00
*/
export const asyncValidator = (rules, form, option = {}) =>
  new Promise((resolve, reject) => {
    const schema = new Schema(rules);
    schema.validate(form, option, errors => {
      if (errors) {
        reject(errors);
      } else {
        resolve();
      }
    });
  });
