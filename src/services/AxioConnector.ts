import axios from 'axios';
import { base_url } from '../utils/APIUrls';

const axioConnectorInstance = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

export default axioConnectorInstance;