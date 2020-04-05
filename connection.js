const mysql = require('mysql2');

const proxyPool = mysql.createPool({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	waitForConnections: true,
	connectionLimit: 10
});
const proxyConnectionPool = proxyPool.promise();

async function getProxyNodeConnection() {
	const connection = await proxyConnectionPool.getConnection();
	await connection.changeUser({
		database: 'networkPortal'
	});
	return connection;
}

module.exports = {getProxyNodeConnection};
