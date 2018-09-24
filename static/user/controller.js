app.controller("userCtrl", function ($scope, $rootScope, centsa) {
    $scope.controllers = [];
    $scope.email = '...';
    centsa.general.controllers().then(({data}) => {
        $scope.email = data.email;
        $scope.controllers = data.controllers;
    });

    $scope.addController = () =>  centsa.general.addController($scope.newController).then(() => {
        $scope.controllers.push($scope.newController);
        delete $scope.newController;
    });

    $scope.deleteController = async email => {
        const result = await swal({
            title: "Are you sure?",
            text: "This user will no longer be able to access your account!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if(result.value) {
            centsa.general.deleteController(email)
            .then(() => $scope.controllers.splice($scope.controllers.findIndex(c => c == email), 1));
        }
    };

    $scope.readNotifications = () => {
        centsa.general.readNotifications().then(() => {
            $rootScope.notifications.forEach(n => n.read = true);
        });
    };

    $scope.deleteNotification = id => {
        centsa.general.deleteNotification(id).then(() => {
            $rootScope.notifications = $rootScope.notifications.filter(n => n.id != id);
        });
    };
});

