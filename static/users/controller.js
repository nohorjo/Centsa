app.controller("usersCtrl", function ($scope, centsa) {
    $scope.controllers = [];
    centsa.general.controllers().then(resp => $scope.controllers = resp.data);

    $scope.addController = () =>  centsa.general.addController($scope.newController).then(() => {
        $scope.controllers.push($scope.newController);
        delete $scope.newController;
    });

    $scope.deleteController = email => centsa.general.deleteController(email)
        .then(() => $scope.controllers.splice($scope.controllers.findIndex(c => c==email), 1));
});

