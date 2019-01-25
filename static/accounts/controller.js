app.controller('accountsCtrl', function ($scope, centsa) {
    $scope.accounts = [];
    let otherType = null;
    centsa.accounts.getAll().then(resp => {
        $scope.accounts = resp.data;

        centsa.settings.get('default.account').then(data => $scope.$apply(() => {
            $scope.defaultAccountId = data.toString();
            $scope.transfer.from = transfer.from = $scope.defaultAccountId;
            $scope.transfer.to = transfer.to = (
                $scope.accounts.find(a => a.savings)
                || $scope.accounts.find(a => a.id != data)
                || {id: data}
            ).id.toString();
        }));
    });
    centsa.types.getAll().then(resp => otherType = resp.data.find(t => t.name == 'Other').id);
    $scope.defaultAccountId = '';

    $scope.newAccount = {
        name: '',
        balance: 0,
        savings: false,
    };
    let newAccount = {...$scope.newAccount};

    $scope.transfer = {
        date: new Date().formatDate('yyyy/MM/dd'),
        amount: 0,
        comment: ''
    };
    let transfer = {...$scope.transfer};

    $scope.saveAccount = () => {
        centsa.accounts.insert($scope.newAccount).then(resp => {
            $scope.newAccount.id = resp.data;
            $scope.accounts.unshift($scope.newAccount);
            if ($scope.newAccount.balance) {
                centsa.transactions.insert({
                    amount: -$scope.newAccount.balance,
                    comment: 'Initial value',
                    account_id: $scope.newAccount.id,
                    type_id: '1',
                    expense_id: null,
                    date: new Date()
                });
            }
            $scope.newAccount = {...newAccount};
        });
    };

    /**
     * Inserts two transactions to represent money going from one account to
     * another
     */
    $scope.transferFunds = () => {
        console.log('transfer funds');
        const amount = $scope.transfer.amount;
        const date = new Date($scope.transfer.date);
        date.setHours(12);
        
        const trans = {
            comment: $scope.transfer.comment,
            type_id: otherType,
            expense_id: null,
            date
        };
        const from = {
            ...trans,
            amount: amount,
            account_id: $scope.transfer.from
        };
        const to = {
            ...trans,
            amount: -amount,
            account_id: $scope.transfer.to
        };
        centsa.transactions.insert(from);
        centsa.transactions.insert(to);
        $scope.accounts.find(a => a.id == $scope.transfer.from).balance -= amount;
        $scope.accounts.find(a => a.id == $scope.transfer.to).balance += amount;
        $scope.transfer = {...transfer};
        $('.datepicker').datepicker('update', new Date().formatDate('yyyy/MM/dd'));
    };

    $scope.sumAccountBalances = () => ($scope.accounts.reduce((a, b) => ({
        balance: a.balance + b.balance
    }), { balance: 0 }).balance / 100).toFixed(2);

    $('.datepicker').datepicker({
        format: 'yyyy/mm/dd',
        endDate: new Date(),
        todayBtn: 'linked',
        autoclose: true,
        todayHighlight: true
    });
    $('.datepicker').datepicker('update', new Date().formatDate('yyyy/MM/dd'));

    $scope.adjustAccount = acc => {
        const diff = acc.balanceOld - acc.balance;
        if (diff) {
            console.log('adjust account');
            centsa.transactions.insert({
                amount: diff,
                comment: 'Adjustment',
                account_id: acc.id,
                type_id: otherType,
                expense_id: null,
                date: new Date()
            }).then(() => acc.balanceOld = acc.balance);
        }
    };

    $scope.setDefaultAccount = id => centsa.settings.set('default.account', id);

    $scope.updateAccount = (a, force) => {
        if (force || a.name != a.nameOld){
            console.log('update account');
            centsa.accounts.insert(a);
        }
    };

    $scope.deleteAccount = async id => {
        if ($scope.accounts.length == 1) {
            swal(
                'Error',
                'Cannot delete last account',
                'error'
            );
            return;
        }
        const inputOptions = $scope.accounts.reduce((opts, a) => {
            if (a.id != id)
                opts[a.id] = a.name;
            return opts;
        }, {[-1]: 'None, delete them'});
        const transfer = await swal({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this account! You will need to select the account to transfer transactions and automatic expenses to',
            input: 'select',
            inputOptions,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(({value}) => (value == -1) ? swal({
            title: 'This action in irreversible!',
            text: 'Once deleted, you will not be able to recover these transactions and expenses!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => result.value && value) : value);
        if (transfer) {
            centsa.accounts.remove(id, transfer).then(() => {
                $scope.accounts.splice($scope.accounts.findIndex(a => a.id == id), 1);
                if ($scope.defaultAccountId == id) {
                    $scope.setDefaultAccount($scope.defaultAccountId = $scope.accounts[0].id.toString());
                }
            });
        }
    };

});
