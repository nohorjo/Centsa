app.controller("userCtrl", function ($scope, $rootScope, centsa) {
    $scope.controllers = [];
    $scope.email = '...';
    $scope.passwordSet = false;
    centsa.settings.get('password.set').then(data => {
        $scope.passwordSet = !!data;
    });
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
            $rootScope.notifications.forEach(n => n.is_read = true);
        });
    };

    $scope.deleteNotification = id => {
        centsa.general.deleteNotification(id).then(() => {
            $rootScope.notifications = $rootScope.notifications.filter(n => n.id != id);
        });
    };

    $scope.deleteUser = async () => {
        const result = await swal({
            title: "Are you sure you want to delete this account and all associated data?",
            text: `Once deleted, this cannot be undone! To confirm enter your name "${$rootScope.name}"`,
            input: 'text',
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Confirm'
        });
        if (result.value == $rootScope.name) {
            centsa.general.deleteUser().then(() => window.location.pathname = '/index.html');
        }
    };

    $scope.updatePassword = () => {
        $scope.passwordSet = true;
        centsa.general.updatePassword($scope.passwordData).then(() => {
            swal({
                position: 'top-end',
                type: 'success',
                title: 'Updated successfully',
                showConfirmButton: false,
                timer: 1000
            });
        });
    };
});

