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
})();
