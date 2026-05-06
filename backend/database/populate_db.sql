--INSERT INTO player (ID, name, playerNumber, email, passwordHash, isVerified)
--VALUES 
--	(2, 'Fai', 23, 'fai@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1),
--	(3, 'Julian', 23, 'julian@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1)
--	(4, 'Hong', 23, 'hong@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1),
--	(5, 'Eric', 23, 'eric@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1),
--	(6, 'Qiao Wen', 23, 'qiaowen@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1),
--	(7, 'Terrence', 23, 'terrence@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1),
--	(8, 'Jeffrey', 23, 'jeffrey@gmail.com', '$2b$12$bBLHmq/pNFSA8IJprGxn0eI72ylj6oFyKtsOpcc425xtSbDH5Op0y', 1)


--UPDATE membership SET teamID=1, role='root' WHERE playerID=1

--INSERT INTO membership (playerID, teamID, role)
--VALUES
--	(2, 1, 'player'),
--	(3, 1, 'manager'),
--	(4, 1, 'player'),
--	(5, 2, 'manager'),
--	(6, 2, 'player'),
--	(7, 3, 'manager'),
--	(8, 3, 'player')

--INSERT INTO team (ID, name)
--VALUES 
--	(1, 'SKVB'),
--	(2, 'Super Happy'),
--	(3, 'Sarawak Titans')