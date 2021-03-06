/*
DROP TABLE transactions;
DROP TABLE expenses;
DROP TABLE types;
DROP TABLE accounts;
DROP TABLE settings;
DROP TABLE rules;
DROP TABLE usercontrol;
DROP TABLE notifications;
DROP TABLE users;
*/

CREATE TABLE users
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50),
    UNIQUE(email)
);
CREATE TABLE notifications
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message VARCHAR(500) NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOL NOT NULL DEFAULT FALSE
);
CREATE TABLE usercontrol
(
    controller BIGINT NOT NULL,
    controllee BIGINT NOT NULL, 
    FOREIGN KEY (controller) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (controllee) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(controller,controllee)
);
CREATE TABLE rules
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    user_id BIGINT,
    content TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id,name)
);
CREATE TABLE settings
(
    user_id BIGINT NOT NULL,
    setting VARCHAR(40) NOT NULL,
    value VARCHAR(250),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id,setting)
);
CREATE TABLE accounts
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    savings BOOL NOT NULL DEFAULT FALSE,
    UNIQUE(user_id,name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE types
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    UNIQUE(user_id,name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE expenses
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    cost INTEGER NOT NULL,
    frequency VARCHAR(10) NOT NULL,
    started DATE NOT NULL,
    automatic BOOL NOT NULL DEFAULT FALSE,
    account_id BIGINT,
    type_id BIGINT NOT NULL,
    UNIQUE(user_id,name),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (type_id) REFERENCES types(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE transactions
(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    amount INTEGER NOT NULL,
    comment VARCHAR(255),
    account_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    expense_id BIGINT,
    date DATE NOT NULL,
    UNIQUE(amount,comment,account_id,type_id,expense_id,date),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (type_id) REFERENCES types(id),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO rules SET name='Default',content = 
'/**
 * Script is initialized with the variables: 
 *      $records : an iterator of the records in the CSV 
 *      $centsa : an interface to the backend
 */

$records.next(); // Skip header

// Store account and type ids
const [
    {data: accountsCache},
    {data: typesCache}
] = await Promise.all([
	$centsa.accounts.getAll(),
	$centsa.types.getAll(),
]);

// Putting transactions in an array for bulk insert
const allTransactions = [];

while ($records.hasNext()) {
    const row = $records.next();

    if (row.length == 5) {
        let account = accountsCache.find(a => a.name == row[3]);
        if (!account) {
            // Account does not exist so create it
            account = { name: row[3] };
            account.id = (await $centsa.accounts.insert(account)).data;
            // Add it back to the cache
            accountsCache.push(account);
        }

        let type = typesCache.find(a => a.name == row[4]);
        if (!type) {
            // Type does not exist so create it
            type = { name: row[4] };
            type.id = (await $centsa.types.insert(type)).data;
            // Add it back to the cache
            typesCache.push(type);
        }

        const date = new Date(row[0]);
        date.setHours(12); // So that DST does not set the date back a day

        allTransactions.push({
            date: date,
            amount: parseFloat(row[1].replace(/[^\\d\\.\\-]/g,"")) * 100,
            comment: row[2],
            account_id: account.id,
            type_id: type.id,
            expense_id: null
        });
    }
}

await $centsa.transactions.insert(allTransactions);
';
