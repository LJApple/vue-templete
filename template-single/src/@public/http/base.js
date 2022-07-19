import request from './request.js'

export default class BaseApi {
  constructor(url, version) {
    this.url = url
    this.version = version
    this.fetch = request
  }
}
