var lastValue = null;

function prepareSetting(value) {
    lastValue = value;
}

function setSetting(setting, value) {
    if (value != lastValue) {
        $.ajax({
            url: "/setSetting",
            type: "POST",
            data: JSON.stringify({
                "setting": setting,
                "value": value
            }),
            error: function (data) {
                alert(data.responseText);
            }
        });
    }
}