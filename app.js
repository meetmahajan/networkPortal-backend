const bodyParser = require('body-parser');
const cors = require('cors');
const mysqlConnection = require('./connection');

class App {
	constructor (app) {
		this.app = app;
	}

	async setupMiddlewares() {
		this.app.use(cors());
		this.app.use(bodyParser.urlencoded({ extended: false }));
		this.app.use(bodyParser.json());
		let connection = await mysqlConnection.getProxyNodeConnection();
		await connection.query("CREATE TABLE if not exists `user` (`id` int(50) NOT NULL AUTO_INCREMENT,`userId` varchar(45) NOT NULL,`firstName` varchar(45) NOT NULL,`lastName` varchar(45) NOT NULL,`role` varchar(45) NOT NULL,`email` varchar(45) NOT NULL,`accessToken` varchar(450) NOT NULL,`encryptedPassword` varchar(450) NOT NULL,`password` varchar(45) NOT NULL,`createdAt` bigint(55) DEFAULT NULL,`updatedAt` bigint(55) DEFAULT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;");
		connection.release();
		connection = null;
	}

}
module.exports = App;

