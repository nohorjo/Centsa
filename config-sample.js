let config = {
    DB_USER: 'root',
    DB_PASSWORD: 'root',
    DB_IP: '127.0.0.1',
    DB_PORT: 3306,
    DB_NAME: 'centsa',
    SESSION_SECRET: 'keyboard cat'
};

for (let v in config) {
    if (!process.env[v]) {
        process.env[v] = config[v];
    }
}

module.exports = config;
