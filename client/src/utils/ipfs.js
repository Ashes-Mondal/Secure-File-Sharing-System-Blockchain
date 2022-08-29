import {create} from 'ipfs-http-client'

const Ipfs = create(new URL('http://127.0.0.1:5001'));

export default Ipfs;