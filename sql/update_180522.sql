CREATE TABLE usercontrol
(
    controller BIGINT NOT NULL,
    controllee BIGINT NOT NULL, 
	FOREIGN KEY (controller) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (controllee) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(controller,controllee)
);
