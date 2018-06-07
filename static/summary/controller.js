app.controller("summaryCtrl", function ($scope, $rootScope, centsa) {
    let transChart;

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

    centsa.transactions.getCumulativeSums().then(resp => {
        const byDate = (a, b) => new Date(a.date) - new Date(b.date);
        const applyMovingAverage = (dayMovAvg, sums) => {
            sums = sums.concat();
            const millis = dayMovAvg * 8.64e7;
            const avgs = [];

            for (
                let date = +new Date(sums[0].date) + millis, end = +new Date(sums[sums.length - 1].date) + millis;
                date <= end;
                date += millis
            ) {
                avgs.push({date});
            }

            for (let i = 0, _sums = sums.concat(); _sums.length; i++) {
                const avg = avgs[i];
                const spliceIndex = _sums.findIndex(s => new Date(s.date) > avg.date);
                const sub = _sums.splice(0, spliceIndex != -1 ? spliceIndex : _sums.length);
                avg.avg = +(sub.reduce((s, o) => s + o.sum, 0) / sub.length).toFixed(2);
            }

            avgs.forEach(a => {
                a.date = new Date(a.date - millis / 2).formatDate('yyyy/MM/dd');
                const s = sums.find(x => x.date == a.date);
                if(s) {
                    s.avg = a.avg;
                } else {
                    sums.push(a);
                }
            });

            if (avgs.length > 1) {
                sums.push(avgs.splice(-2).reduce((a, b) => ({
                    avg: +(2 * b.avg - a.avg).toFixed(2),
                    date: new Date(+new Date(b.date) + millis).formatDate('yyyy/MM/dd')
                })));
            }

            return sums.sort(byDate);
        };

        const sums = applyMovingAverage(30, resp.data.map(x => ({
            date: new Date(x.date).formatDate("yyyy/MM/dd"),
            sum: x.sum / 100
        })).sort(byDate));

        const valueAxes = [{
            id: "v1",
            axisAlpha: 0,
            position: "left",
            ignoreAxisWidth: true
        }];
        const graphs = [{
            id: "g1",
            title: 'Balance', 
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
            title: 'Average', 
            lineThickness: 2,
            valueField: "avg",
            bullet: 'round'
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
    });
});
