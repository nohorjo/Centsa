app.controller("summaryCtrl", function($scope, $sce) {
    $scope.trust = $sce.trustAsHtml;
    $scope.strictMode = centsa.settings.get("strict.mode") == "true";

    $scope.getBudget = function() {
        centsa.settings.set("strict.mode", $scope.strictMode);
        $scope.budget = centsa.general.budget($scope.strictMode);
    };

    $scope.getBudget();

    $scope.getPostInstallWarning = (function(){
        var message = centsa.settings.get("post.install.warning");
        setTimeout(function(){
            centsa.settings.set("post.install.warning", null);
        },1000);
        return message;
    })();

    (function() {
        var sums = []
        var data = centsa.transactions.getCumulativeSums();
        $(data).each(function() {
            sums.push({
                date : new Date(this.date).formatDate("yyyy/MM/dd"),
                sum : this.sum / 100
            });
        });
        var valueAxes = [ {
            "id" : "v1",
            "axisAlpha" : 0,
            "position" : "left",
            "ignoreAxisWidth" : true
        } ];
        var graphs = [ {
            "id" : "g1",
            "balloon" : {
                "drop" : true,
                "adjustBorderColor" : false,
                "color" : "#ffffff"
            },
            "lineThickness" : 2,
            "useLineColorForBulletBorder" : true,
            "valueField" : "sum",
            "balloonText" : "<span>[[value]]</span>"
        } ];
        var chartOpts = {
            "type" : "serial",
            "theme" : "light",
            "marginRight" : 60,
            "marginLeft" : 60,
            "dataDateFormat" : "YYYY/MM/DD",
            "valueAxes" : valueAxes,
            "balloon" : {
                "borderThickness" : 1,
                "shadowAlpha" : 0
            },
            "graphs" : graphs,
            "chartCursor" : {
                "pan" : true,
                "valueLineEnabled" : true,
                "valueLineBalloonEnabled" : true,
                "cursorAlpha" : 1,
                "cursorColor" : "#258cbb",
                "limitToGraph" : "g1",
                "valueLineAlpha" : 0.2,
                "valueZoomable" : true
            },
            "categoryField" : "date",
            "categoryAxis" : {
                "parseDates" : false,
                "dashLength" : 1,
            },
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis":false,
                "offset":30,
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "color":"#AAAAAA"
            },
            "dataProvider" : sums,
            "mouseWheelZoomEnabled":true
        };
        AmCharts.makeChart("trans-chart", chartOpts);
    })();
});