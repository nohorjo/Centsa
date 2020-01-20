app.controller('summaryCtrl', function ($scope, $rootScope, centsa) {
    let transChart;
    const byDate = (a, b) => new Date(a.date) - new Date(b.date);

    $scope.cumulativeSums = [];
    $scope.budgetModes = [
        {name: 'Expense based', code: 'expense'},
        {name: 'Strict expense based', code: 'strictExpense'},
        {name: 'Time based', code: 'time'},
        {name: 'Strict Time based', code: 'strictTime'},
        {name: 'Manual', code: 'manual'},
    ];
    $scope.cashflowPeriods = [
        {name: 'Never', days: 0},
        {name: 'Week', days: 7},
        {name: 'Month', days: 30},
        {name: 'Five week', days: 35},
        {name: 'Quarter', days: 90},
        {name: 'Half year', days: 180},
        {name: 'Year', days: 365},
    ];
    $scope.movingAverages = [
        {name: 'Weekly', days: 7},
        {name: 'Monthly', days: 30},
        {name: 'Five-weekly', days: 35},
        {name: 'Quarterly', days: 90},
        {name: 'Half-yearly', days: 180},
        {name: 'Annually', days: 365},
    ];

    $scope.getBudget = () => {
        if ($scope.budgetMode.mode === 'manual' && !$('#manualStart').val()) {
            return;
        }
        centsa.settings.set('budget.mode', JSON.stringify($scope.budgetMode));
        centsa.general.budget($scope.budgetMode).then(({data}) => $scope.budget = data);
    };

    $scope.filterDate = $event => {
        if ($event.originalEvent.path[3].constructor == HTMLDivElement) {
            let date = $($event.currentTarget.innerHTML).find('.amcharts-balloon-div-categoryAxis').text();
            if ((date = new Date(date)).getTime()){
                transChart.handleMouseOut();
                $rootScope.setFilter({
                    fromDate: date.formatDate('yyyy/MM/dd'),
                    sort: 'date ASC, id ASC'
                });
            }
        }
    };

    centsa.settings.get('budget.mode').then(budgetMode => $scope.$apply(() => {
        $scope.budgetMode = {
            mode: 'expense',
            expenseRounds: 1,
            frequency: '7',
            days: 90,
            start: new Date().formatDate('yyyy/MM/dd'),
            amount: 0,
            cashflowPeriod: 0,
            ...(budgetMode && JSON.parse(budgetMode))
        };
        if ($scope.budgetMode.mode == 'manual') {
            $scope.initDatePickers();
        }
        $scope.getBudget();
    }));

    Promise.all([
        centsa.transactions.getCumulativeSums(),
        centsa.settings.get('moving.average.days').then(setting => $scope.$apply(() => {
            $scope.movingAvgDays = +setting || 30;
        }))
    ]).then(([resp]) => {
        $scope.cumulativeSums = resp.data.map(x => ({
            date: new Date(x.date).formatDate('yyyy/MM/dd'),
            sum: x.sum / 100
        })).sort(byDate);
        if ($scope.cumulativeSums.length) $scope.drawGraph();
    });

    $scope.drawGraph = () => {
        console.log('draw graph');
        centsa.settings.set('moving.average.days', $scope.movingAvgDays);
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
        const balloonText = `<span>${$rootScope.currency.prepend ? $rootScope.currency.symbol : ''}[[value]]${$rootScope.currency.prepend ? '' : $rootScope.currency.symbol}</span>`;

        const valueAxes = [{
            id: 'v1',
            axisAlpha: 0,
            position: 'left',
            ignoreAxisWidth: true,
            unit: $rootScope.currency.symbol,
            unitPosition: $rootScope.currency.prepend ? 'left' : 'right',
        }];
        const graphs = [{
            id: 'g1',
            title: 'Total balance', 
            balloon: {
                drop: true,
                adjustBorderColor: false,
                color: '#ffffff'
            },
            lineThickness: 2,
            useLineColorForBulletBorder: true,
            valueField: 'sum',
            balloonText
        }, {
            id: 'g2',
            title: 'Moving average', 
            lineThickness: 2,
            valueField: 'avg',
            bullet: 'round',
            balloonText
        }, {
            id: 'g3',
            title: 'Average rate of spending', 
            lineThickness: 2,
            valueField: 'rate',
            bullet: 'round',
            lineColor: '#ff7f7f',
            balloonText
        }];
        const chartOpts = {
            type: 'serial',
            theme: 'light',
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
                cursorColor: '#258cbb',
                limitToGraph: 'g1',
                valueLineAlpha: 0.2,
                valueZoomable: true
            },
            categoryField: 'date',
            categoryAxis: {
                parseDates: true,
                dashLength: 1,
            },
            chartScrollbar: {
                graph: 'g1',
                oppositeAxis: false,
                offset: 30,
                scrollbarHeight: 80,
                backgroundAlpha: 0,
                selectedBackgroundAlpha: 0.1,
                selectedBackgroundColor: '#888888',
                graphFillAlpha: 0,
                graphLineAlpha: 0.5,
                selectedGraphFillAlpha: 0,
                selectedGraphLineAlpha: 1,
                color: '#AAAAAA'
            },
            dataProvider: sums,
            mouseWheelZoomEnabled: true,
            legend: {
                useGraphSettings: true,
                position: 'top',
                spacing: 75,
            },
            dataDateFormat: 'YYYY/MM/DD'
        };
        transChart = AmCharts.makeChart('trans-chart', chartOpts);
        transChart.zoom(new Date - 3.15e10);
    };

    $scope.initDatePickers = () => {
        $('#manualStart').datepicker({
            format: 'yyyy/mm/dd',
            endDate: new Date(),
            todayBtn: 'linked',
            autoclose: true,
            todayHighlight: true
        });
        $('#manualStart').datepicker('update', new Date($scope.budgetMode.start).formatDate('yyyy/MM/dd'));
    };
});
