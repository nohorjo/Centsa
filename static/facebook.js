let fbInit = () => {

    window.checkLoginState = function () {
        FB.getLoginStatus(function (response) {
            if (response.authResponse) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/fb');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(response.authResponse));
            }
        });
    };

    window.fbAsyncInit = function () {
        FB.init({
            appId: '531919070519328',
            cookie: true,
            xfbml: true,
            version: 'v2.11'
        });

        FB.AppEvents.logPageView();
        FB.login(function (response) {
            window.checkLoginState();
        }, { scope: 'public_profile,email' });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.11&appId=531919070519328&autoLogAppEvents=1';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


}