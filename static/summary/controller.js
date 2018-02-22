app.controller("summaryCtrl", function ($scope, centsa) {
    $scope.getBudget = () => centsa.settings.set("strict.mode", $scope.strictMode, () => {
        centsa.general.budget($scope.strictMode, budget => $scope.budget = budget)
    });

    centsa.settings.get("strict.mode", setting => {
        $scope.strictMode = setting;
        $scope.getBudget();
    });

    centsa.transactions.getCumulativeSums(data => {
        const sums = data.map(x => ({
            date: new Date(x.date).formatDate("yyyy/MM/dd"),
            sum: x.sum / 100
        }));
        const valueAxes = [{
            id: "v1",
            axisAlpha: 0,
            position: "left",
            ignoreAxisWidth: true
        }];
        const graphs = [{
            id: "g1",
            balloon: {
                drop: true,
                adjustBorderColor: false,
                color: "#ffffff"
            },
            lineThickness: 2,
            useLineColorForBulletBorder: true,
            valueField: "sum",
            balloonText: "<span>[[value]]</span>"
        }];
        const chartOpts = {
            type: "serial",
            theme: "light",
            marginRight: 60,
            marginLeft: 60,
            dataDateFormat: "YYYY/MM/DD",
            valueAxes: valueAxes,
            balloon: {
                borderThickness: 1,
                shadowAlpha: 0
            },
            graphs: graphs,
            chartCursor: {
                pan: true,
                valueLineEnabled: true,
                valueLineBalloonEnabled: true,
                cursorAlpha: 1,
                cursorColor: "#258cbb",
                limitToGraph: "g1",
                valueLineAlpha: 0.2,
                valueZoomable: true
            },
            categoryField: "date",
            categoryAxis: {
                parseDates: false,
                dashLength: 1,
            },
            chartScrollbar: {
                graph: "g1",
                oppositeAxis: false,
                offset: 30,
                scrollbarHeight: 80,
                backgroundAlpha: 0,
                selectedBackgroundAlpha: 0.1,
                selectedBackgroundColor: "#888888",
                graphFillAlpha: 0,
                graphLineAlpha: 0.5,
                selectedGraphFillAlpha: 0,
                selectedGraphLineAlpha: 1,
                color: "#AAAAAA"
            },
            dataProvider: sums,
            mouseWheelZoomEnabled: true
        };
        AmCharts.makeChart("trans-chart", chartOpts);
    });
});