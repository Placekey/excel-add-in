import axios from 'axios';
import { base_url } from '../utils/APIUrls';
import { addin_version } from '../utils/Config';

const axioConnectorInstance = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// getting an error when setting user agent header via the axios - 'Refused to set unsafe header "User-Agent"'
axioConnectorInstance.defaults.headers['X-PK-App'] = `placekey-excel/${addin_version}`; 

export default axioConnectorInstance;