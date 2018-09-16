(() => {
    let editor, password, mode;

    document.addEventListener("DOMContentLoaded", () => {
        password = document.getElementById('password').value = window.sessionStorage.getItem('password');
        mode = document.querySelector('input[name="mode"]:checked').value;
        editor = ace.edit('editor');
        editor.setTheme("ace/theme/solarized_dark");
        editor.session.setMode("ace/mode/" + mode);
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            maxLines: Infinity
        });
    });

    window.updatePassword = () => {
        password = document.getElementById('password').value;
        window.sessionStorage.setItem('password', password);
    };

    window.updateMode = () => {
        mode = document.querySelector('input[name="mode"]:checked').value;
        editor.session.setMode("ace/mode/" + mode);
    };

    window.execute = retries => {
        const token = otplib.authenticator.generate(password);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    document.getElementById("output").innerHTML = xhttp.responseText
                                                                    .replace(/\n/g, '<br>')
                                                                    .replace(/ /g, '&nbsp;');
                } else if (retries) {
                    setTimeout(() => window.execute(--retries), 1000);
                } else {
                    document.getElementById("output").innerHTML = 'ERROR:\n' + xhttp.responseText;
                }
            }
        };
        xhttp.open("POST", "/api/admin/execute");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
            token,
            mode,
            command: editor.session.getValue()
        }));
    };
})();
