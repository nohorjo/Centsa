(() => {
    const authUrl = '/login';
    window.fbInit = () => {
        const initConfig = {
            appId: '531919070519328',
            cookie: true,
            xfbml: true,
            version: 'v2.11'
        };

        window.checkLoginState = () => {
            FB.getLoginStatus(response => {
                if (response.authResponse) {
                    loginRequest(response.authResponse,() => { FB.getLoginStatus(() => { FB.logout(); }); });
                }
            });
        };

        window.fbAsyncInit = () => {
            FB.init(initConfig);
            FB.AppEvents.logPageView();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = `https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=${initConfig.version}&appId=${initConfig.appId}&autoLogAppEvents=1`;
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    window.logout = () => {
        $.ajax({
            url: authUrl,
            type: 'DELETE',
            success: () => window.location.pathname = "index.html"
        });

    };

    window.onSignIn = googleUser => {
        loginRequest({google_token:googleUser.getAuthResponse().id_token}, gapi.auth2.getAuthInstance().signOut);
    }
    
    function loginRequest(data, signOut) {
        $.post({
            url: authUrl,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: () => {
                signOut();
                window.location.hash = "";
                window.location.pathname = "main.html";
            }
        });
    }
})();
