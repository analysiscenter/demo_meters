import keyMirror from 'fbjs/lib/keyMirror'

const SocketIOEvents = {
  CONNECTING: 'connecting',
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',
  RECONNECTING: 'reconnecting',
  RECONNECT: 'reconnect'
}

const ServerEvents = keyMirror({
  SERVER_READY: null
})

const MT_Requests = keyMirror({
  MT_GET_LIST: null,
  MT_GET_ITEM_DATA: null,
  MT_GET_INFERENCE: null,
  MT_UPLOAD_IMAGE: null
})

const MT_Responses = keyMirror({
  MT_GOT_LIST: null,
  MT_GOT_ITEM_DATA: null,
  MT_GOT_INFERENCE: null
})

const MT_API = Object.assign({}, MT_Responses, MT_Requests)

const API_Requests = Object.assign({}, MT_Requests)
const API_Responses = Object.assign({}, MT_Responses)

const API_Events = Object.assign({}, API_Requests, API_Responses)

const Events = Object.assign({}, SocketIOEvents, ServerEvents, API_Events)

export { Events, SocketIOEvents, ServerEvents, API_Events, API_Responses, API_Requests, MT_API, MT_Responses, MT_Requests }
