const axios = require('axios')

const instance = axios.create({
    baseURL: 'http://localhost:3000/api/'
})

console.log('Trying login')

let refreshToken

instance.post('/login', {
    "email": "jeanbon@gmail.com",
    "password": "gilles"
}).then((response) => {
    console.log('auth sucess')

    instance.defaults.headers.common['authorization'] = `Bearer ${response.data.token}`
    refreshToken = response.data.refresh
    loadUserInfos()
}).catch((err) => {
    console.log('auth fail')
})

const loadUserInfos = () => {
    instance.get('/me').then((response) => {
        console.log(response.data)
    }).catch((err) => {
        console.log("Don't have user information")
    })
}

instance.interceptors.response.use((response) => {
    return response;
  }, async (error) => {
    const originalRequest = error.config;
    if (error.config.url != '/refreshToken' && error.response.status === 401 && originalRequest._retry !== true) {
      originalRequest._retry = true;
      if (refreshToken && refreshToken != '') {
        instance.defaults.headers.common['authorization'] = `Bearer ${refreshToken}`;
        console.log('refresh token');
        await instance.post('/refreshToken').then((response) => {
            instance.defaults.headers.common['authorization'] = `Bearer ${response.data.token}`;
            originalRequest.headers['authorization'] = `Bearer ${response.data.token}`;
        }).catch((error) => {
            refreshToken = null;
        });
        console.log("Good ...");
        return instance(originalRequest);
      }
    }
  });
