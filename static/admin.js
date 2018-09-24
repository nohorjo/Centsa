(() => {
    let editor, password, mode;

    document.addEventListener("DOMContentLoaded", () => {
        password = document.getElementById('password').value = window.localStorage.getItem('password');
        mode = window.localStorage.getItem('mode') || document.querySelector('input[name="mode"]:checked').value;
        document.querySelector(`input[value="${mode}"]`).checked = true;

        editor = ace.edit('editor');
        editor.setTheme("ace/theme/terminal");
        editor.session.setMode("ace/mode/" + mode);
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            maxLines: Infinity
        });
        editor.setValue(window.localStorage.getItem(mode + 'command') || '');

        document.getElementById('editor').addEventListener('keyup', e => e.ctrlKey && e.keyCode == 13 && window.execute(5));
    });

    window.updatePassword = () => {
        password = document.getElementById('password').value;
        window.localStorage.setItem('password', password);
    };

    window.updateMode = () => {
        mode = document.querySelector('input[name="mode"]:checked').value;
        editor.session.setMode("ace/mode/" + mode);
        window.localStorage.setItem('mode', mode);
        editor.setValue(window.localStorage.getItem(mode + 'command') || '');
    };

    window.execute = retries => {
        const command = editor.session.getValue();
        window.localStorage.setItem(mode + 'command', command);
        const token = otplib.authenticator.generate(password);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    document.getElementById("output").innerHTML = xhttp.responseText
                                                                    .replace(/\n/g, '<br>')
                                                                    .replace(/ /g, '&nbsp;');
                    if (mode == 'sh') editor.selectAll();
                } else {
                    if (retries) {
                        setTimeout(() => window.execute(--retries), 1000);
                    } else {
                        document.getElementById("output").innerHTML = 'ERROR:\n' + xhttp.responseText;
                    }
                    try {
                        if (!otplib.authenticator.options.epoch) {
                            otplib.authenticator.options = {epoch: +xhttp.responseText || null};
                            setInterval(() => otplib.authenticator.options = {epoch: otplib.authenticator.options.epoch +1}, 1000);
                        }
                    } catch (e) {}
                }
            }
        };
        xhttp.open("POST", "/api/admin/execute");
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
            token,
            mode,
            command
        }));
    };
})();
