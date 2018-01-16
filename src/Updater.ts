import axios from 'axios';

export default {
    autoCheckUpdate() {
        axios.get('https://api.github.com/repos/nohorjo/Centsa/releases/latest')
            .then(response => {
                console.log(response.data.url);
                console.log(response.data.explanation);
            })
            .catch(error => {
                console.log(error);
            });
    }
};