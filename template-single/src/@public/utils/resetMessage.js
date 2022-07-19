/*
 * @Author: jinmiao
 * @Date: 2021-09-09 19:04:57
 * @Description: file content
 * @LastEditTime: 2021-09-10 14:44:48
 */
import { Message } from 'element-ui';
let messageInstance = null;
const resetMessage = (options) => {
    if(messageInstance) {
      messageInstance.close()
    }
    messageInstance = Message(options)
  }
;
['error','success','info','warning'].forEach(type => {
  resetMessage[type] = options => {
    if(typeof options === 'string') {
      options = {
        message:options
      }
    }
    options.type = type;
    return resetMessage(options);
  }
});
export default resetMessage