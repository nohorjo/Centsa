app.controller("summaryCtrl", function ($scope, $rootScope, centsa) {
    let transChart;
    const byDate = (a, b) => new Date(a.date) - new Date(b.date);

    $scope.cumulativeSums = [];
    $scope.getBudget = () => centsa.settings.set("strict.mode", $scope.strictMode).then(() => {
        centsa.general.budget($scope.strictMode).then(resp => $scope.budget = resp.data);
    });

    $scope.filterDate = $event => {
        if ($event.originalEvent.path[3].constructor == HTMLDivElement) {
            const date = $($event.currentTarget.innerHTML).find('.amcharts-balloon-div-categoryAxis').text();
            if (new Date(date).getTime()){
                transChart.handleMouseOut();
                $rootScope.setFilter({
                    fromDate: date,
                    sort: "date ASC, id ASC"
                });
            }
        }
    };

    centsa.settings.get("strict.mode").then(setting => {
        $scope.strictMode = setting == "1";
        $scope.getBudget();
    });

    Promise.all([
        centsa.transactions.getCumulativeSums(),
        centsa.settings.get("moving.average.days").then(setting => {
            $scope.movingAvgDays = setting || '30';
        })
    ]).then(([resp]) => {
        $scope.cumulativeSums = resp.data.map(x => ({
            date: new Date(x.date).formatDate("yyyy/MM/dd"),
            sum: x.sum / 100
        })).sort(byDate)
        if ($scope.cumulativeSums.length) $scope.drawGraph();
    });

    $scope.drawGraph = () => {
        console.log('draw graph');
        centsa.settings.set("moving.average.days", $scope.movingAvgDays);
        const applyMovingAverage = sums => {
            const millis = $scope.movingAvgDays * 8.64e7;
            const avgs = [];

            for (
                let date = +new Date(sums[0].date) + millis, end = +new Date(sums[sums.length - 1].date) + millis;
                date < end;
                date += millis
            ) {
                avgs.push({date});
            }

            if (avgs.length > 1) {
                sums = sums.concat();
                const _sums = sums.concat();
                let lastAmount;

                avgs.forEach(avg => {
                    const spliceIndex = _sums.findIndex(s => new Date(s.date) > avg.date);
                    const sub = _sums.splice(0, spliceIndex != -1 ? spliceIndex : _sums.length);
                    avg.avg = +(sub.reduce((s, o) => s + o.sum, 0) / sub.length).toFixed(2);
                    avg.date = new Date(avg.date - millis / 2).formatDate('yyyy/MM/dd');
                    if (!isNaN(lastAmount)) avg.rate = +(lastAmount - avg.avg).toFixed(2);
                    lastAmount = avg.avg;
                    sums.push(avg);
                });

                sums.push(avgs.splice(-2).reduce((a, b) => ({
                    avg: +(2 * b.avg - a.avg).toFixed(2),
                    date: new Date(+new Date(b.date) + millis).formatDate('yyyy/MM/dd')
                })));
            }

            return sums.sort(byDate);
        };

        const sums = applyMovingAverage($scope.cumulativeSums);

        const valueAxes = [{
            id: "v1",
            axisAlpha: 0,
            position: "left",
            ignoreAxisWidth: true
        }];
        const graphs = [{
            id: "g1",
            title: 'Total balance', 
            balloon: {
                drop: true,
                adjustBorderColor: false,
                color: "#ffffff"
            },
            lineThickness: 2,
            useLineColorForBulletBorder: true,
            valueField: "sum",
            balloonText: "<span>[[value]]</span>"
        }, {
            id: "g2",
            title: 'Moving average', 
            lineThickness: 2,
            valueField: "avg",
            bullet: 'round'
        }, {
            id: "g3",
            title: 'Average rate of spending', 
            lineThickness: 2,
            valueField: "rate",
            bullet: 'round',
            lineColor: '#ff7f7f'
        }];
        const chartOpts = {
            type: "serial",
            theme: "light",
            marginLeft: 60,
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
                parseDates: true,
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
            mouseWheelZoomEnabled: true,
            legend: {
                useGraphSettings: true,
                position: 'top'
            },
            dataDateFormat: 'YYYY/MM/DD'
        };
        transChart = AmCharts.makeChart("trans-chart", chartOpts);
    }
});
