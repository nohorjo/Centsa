app.controller("usersCtrl", function ($scope, centsa) {
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
            .then(() => $scope.controllers.splice($scope.controllers.findIndex(c => c==email), 1));
        }
    };
});

