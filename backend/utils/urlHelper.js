/**
 * LifeTag Base URL & Emergency Link Helper
 * Configurable via QR_BASE_URL, APP_BASE_URL, or FRONTEND_URL environment variables.
 * Defaults to the LAN IP address for seamless cross-device mobile scanning.
 */

const getBaseUrl = () => {
    const raw = process.env.QR_BASE_URL || process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'http://10.3.153.154:5000';
    return raw.replace(/\/+$/, '');
};

const getEmergencyUrl = (token) => {
    return `${getBaseUrl()}/emergency/${token}`;
};

module.exports = {
    getBaseUrl,
    getEmergencyUrl
};
