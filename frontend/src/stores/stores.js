import Server from './server'
import MtStore from './mt_store'

const server = new Server()
server.init()
const mtStore = new MtStore(server)

export { server, mtStore }
