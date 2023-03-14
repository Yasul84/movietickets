import axios from 'axios';

export default ({ req }) => {
    // Case: request is generated on server-side
    if (typeof window === 'undefined') {
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        // Case: request is generated from the browser
        return axios.create({
            baseURL: '/'
        });
    }
};