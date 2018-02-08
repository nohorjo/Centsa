let fbInit = () => {
    const initConfig = {
        appId: '531919070519328',
        cookie: true,
        xfbml: true,
        version: 'v2.11'
    };
    window.checkLoginState = () => {
        FB.getLoginStatus(response => {
            if (response.authResponse) {
                $.post({
                    url: '/fb',
                    contentType: 'application/json',
                    data: response.authResponse,
                    success: () => {
                        window.location.pathname = "main.html";
                    }
                });
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