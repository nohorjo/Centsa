app.controller("importCtrl", function ($scope, $rootScope, $timeout, centsa) {
    $scope.rules = [];
    centsa.general.rules().then(resp => {
        $scope.rules = resp.data;
        $scope.rule = resp.data.find(x => x.name == "Default").id.toString();
    });

    $scope.importProgress = {
        processed: 0,
        total: 1
    };

    $scope.importFile = () => {
        $scope.importError = "";
        $('#progressModal').modal({
            backdrop: 'static',
            keyboard: false
        }).appendTo("body");

        const importWorker = new Worker("/workers/importWorker.js");

        let debounceTimeout;
        importWorker.addEventListener('message', ({data}) => {
            if (data) {
                $timeout.cancel(debounceTimeout);
                debounceTimeout = $timeout(() => {
                    $scope.importProgress = data;
                }, 200);
            } else {
                $timeout(() => {
                    $scope.importProgress = {
                        processed: 0,
                        total: 1
                    };
                    $('#progressModal').appendTo(".content").modal("hide");
                }, 1000);
            }
        });
        importWorker.addEventListener('error', ({message}) => {
            $scope.$apply(() => {
                $scope.importError = `Error: ${message}`;
            });
        });
        importWorker.postMessage({
            rule: $scope.rule,
            script: $scope.rules.find(x => x.id == $scope.rule).script,
            csv: $scope.uploadFile
        });
    };

    $scope.showEditor = false;
    let editor;

    $scope.$watch('rule', newValue => {
        if (newValue == "") {
            $scope.newRuleName = "";
            $scope.showEditor = true;
            if (editor) {
                editor.getSession().setValue('/** Enter import rule script here **/');
            }
        } else if (newValue) {
            $scope.newRuleName = $scope.rules.find(x => x.id == newValue).name;
        }
    });
    $scope.updateEditor = () => {
        if ($scope.rule) {
            centsa.general.rule($scope.rule).then(resp => {
                const script = resp.data;
                editor.getSession().setValue(script);
                $scope.rules.find(x => x.id == $scope.rule).script = resp.data;
            });
        }
    };
    $scope.$watch('showEditor', show => {
        if (show) {
            editor = ace.edit('editor');
            editor.setTheme("ace/theme/chrome");
            editor.session.setMode("ace/mode/javascript");
            $scope.updateEditor();
            editor.$blockScrolling = Infinity;
            editor.setOptions({
                maxLines: Infinity
            });
        }
    });

    $scope.saveRule = () => {
        const script = editor.getSession().getValue();
        centsa.general.saveRule($scope.newRuleName, script).then(resp => {
            const id = resp.data;
            const newRule = $scope.rules.find(x => x.name == $scope.newRuleName);
            if (newRule) {
                newRule.script = script;
                newRule.id = id;
            } else {
                $scope.rules.push({
                    name: $scope.newRuleName,
                    id: id,
                    script: script
                });
            }
            $scope.rule = id.toString();
        });
    };

    $scope.isRuleNameValid = () => $scope.newRuleName && $scope.newRuleName != 'Default';
});
