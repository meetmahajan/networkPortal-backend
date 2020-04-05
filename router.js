let crypto = require("crypto");
const mysqlConnection = require('./connection');
const uuid = require('uuid');

class Router {
	role = "employee";
	constructor(app) {
		app.get('/', (req, res) => {
			this.getBasePath(req, res);
		});
		app.post('/signUp', (req, res) => {
			this.registration(req, res);
		});
		app.post('/emailValidate', (req, res) => {
			this.emailCheck(req, res);
		});
		app.post('/passwordValidate', (req, res) => {
			this.passwordCheck(req, res);
		});
	}
	async getBasePath(req, res) {
		res.send('You are on the home page.');
	}
	async registration(req, res) {
		let connection = await mysqlConnection.getProxyNodeConnection();
		try {
			if (!req.body.firstName) {
				res.status(400).send({ error: "Please provide valid first name", status: 400 });
			}
			if (!req.body.lastName) {
				res.status(400).send({ error: "Please provide valid last name", status: 400 });
			}
			let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!req.body.email) {
				res.status(400).send({ error: "Please provide email", status: 400 });
			}
			if (!regex.test(String(req.body.email).toLowerCase())) {
				res.status(400).send({ error: "Please provide valid email", status: 400 });
			}
			if (!req.body.password) {
				res.status(400).send({ error: "Please provide valid password", status: 400 });
			}
			let accessToken = uuid.v1() + '-' + uuid.v4();
			let role = "employee";
			// console.log(await this.md5(req.body.password));
			let [[user]] = await connection.query(`SELECT * FROM user where email = \'${req.body.email}\'`);
			if (user) {
				res.status(400).send({ error: "User exist, Please try another one.", status: 400 });
			}
			else {
				await connection.query(`INSERT INTO \`user\` (\`userId\`, \`firstName\`, \`lastName\`, \`role\`, \`email\`, \`accessToken\`, \`encryptedPassword\`, \`password\`, \`createdAt\`, \`updatedAt\`) VALUES ('${req.body.firstName + "_" + req.body.lastName}', '${req.body.firstName}',  '${req.body.lastName}' , '${role}', '${req.body.email}', '${accessToken}', '${await this.md5(req.body.password)}', '${req.body.password}', '${new Date().getTime()}', '${new Date().getTime()}')`);
				if (connection) {
					connection.release();
					connection = null;
				}
				res.send(JSON.stringify({ access_token: accessToken, message: 'You\'ve successfully registered' }));
			}
		} catch (err) {
			if (connection) {
				connection.release();
				connection = null;
			}
			console.error(err);
			res.status(500).send({ error: "Something went wrong, please check console for more details.", status: 500 });
		}
	}

	async emailCheck(req, res) {
		let connection = await mysqlConnection.getProxyNodeConnection();
		try {
			let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!req.body.email) {
				res.status(400).send({ error: "Please provide email", status: 400 });
			}
			if (!regex.test(String(req.body.email).toLowerCase())) {
				res.status(400).send({ error: "Please provide valid email", status: 400 });
			}
			let formated = await connection.format(`SELECT * FROM user where email = \'${req.body.email}\'`);
			console.log(formated);
			let [[user]] = await connection.query(`SELECT * FROM user where email = \'${req.body.email}\'`);
			if (!user) {
				res.status(400).send({ error: "Please provide valid email", status: 400 });
			}
			// let updatedToken = uuid.v1() + '-' + uuid.v4();
			// // await connection.query(`UPDATE user set accessToken = \'${updatedToken}\' where id = ${user.id}`);
			// // user.new_access_token = updatedToken;
			res.send(user);
		} catch (err) {
			console.error(err);
			res.status(500).send({ error: "Something went wrong, please check console for more details.", status: 500 });
		}
	}
	async passwordCheck(req, res) {
		let connection = await mysqlConnection.getProxyNodeConnection();
		try {
			if (!req.body.password) {
				res.status(400).send({ error: "Please provide password", status: 400 });
			}
			if (!req.body.accessToken) {
				res.status(400).send({ error: "Please provide accessToken", status: 400 });
			}
			let formated = await connection.format(`SELECT * FROM user where accessToken = \'${req.body.accessToken}\' && password = \'${req.body.password}\' && encryptedPassword = \'${await this.md5(req.body.password)}\'`);
			console.log(formated);
			let [[user]] = await connection.query(`SELECT * FROM user where accessToken = \'${req.body.accessToken}\' && password = \'${req.body.password}\' && encryptedPassword = \'${await this.md5(req.body.password)}\'`);
			if (!user) {
				res.status(400).send({ error: "Please provide a valid password", status: 400 });
			}
			res.send(user);
		} catch (err) {
			console.error(err);
			res.status(500).send({ error: "Something went wrong, please check console for more details.", status: 500 });
		}
	}
	async md5(str) {
		return crypto.createHash('md5').update(str).digest('hex');
	}
}
module.exports = Router;