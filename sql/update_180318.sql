-- #92 Created setting for default account
INSERT INTO settings (
    user_id,
    setting,
    value
) SELECT 
    u.id,
    'default.account',
    (SELECT a.id from accounts a
        WHERE a.user_id=u.id AND a.name="Default")
FROM users u;