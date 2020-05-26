import env from './env'

// const DEV_URL = 'http://localhost:8081/'
// const PRO_URL = 'http://localhost:8081/'
const DEV_URL = 'http://139.224.135.139:8081/'
const PRO_URL = 'http://139.224.135.139:8081/'

export default env === 'development' ? DEV_URL : PRO_URL
