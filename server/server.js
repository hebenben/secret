const CONFIG = require('./config'),
	session = require('express-session'),
	bodyParser = require('body-parser');

/*-CREATE SERVER-*/
const express = require('express'),
	app = express();
app.listen(CONFIG.PORT, () => {
	console.log(`THE WEB SERVICE IS CREATED SUCCESSFULLY AND IS LISTENING TO THE PORT：${CONFIG.PORT}!!`);
});

/*-MIDDLE WARE-*/
app.use((req, res, next) => {
	const {
		ALLOW_ORIGIN,
		CREDENTIALS,
		HEADERS,
		ALLOW_METHODS
	} = CONFIG.CROS;

	// 白名单
	let safeList = ALLOW_ORIGIN.split(','),
		origin = req.headers.origin || req.headers.referer || "";
	origin = origin.replace(/\/$/g, '');
	origin = !safeList.includes(origin) ? '' : origin;

	res.header("Access-Control-Allow-Origin", origin);
	res.header("Access-Control-Allow-Credentials", CREDENTIALS);
	res.header("Access-Control-Allow-Headers", HEADERS);
	res.header("Access-Control-Allow-Methods", ALLOW_METHODS);
	req.method === 'OPTIONS' ? res.send('OK') : next();
});
app.use(session(CONFIG.SESSION));
app.use(bodyParser.urlencoded({
	extended: false
}));

/*-QUERY DATA-*/
const {
	readFile
} = require('./utils/promiseFS');

const {
	filterInvalid
} = require('./utils/tools');

app.use(async (req, res, next) => {
	req.$customerDATA = filterInvalid(JSON.parse(await readFile('./json/customer.json')));
	req.$departmentDATA = filterInvalid(JSON.parse(await readFile('./json/department.json')));
	req.$jobDATA = filterInvalid(JSON.parse(await readFile('./json/job.json')));
	req.$userDATA = filterInvalid(JSON.parse(await readFile('./json/user.json')));
	req.$visitDATA = filterInvalid(JSON.parse(await readFile('./json/visit.json')));
	req.$imageDATA = filterInvalid(JSON.parse(await readFile('./json/image.json')));
	next();
});

/*-ROUTE-*/
app.use('/user', require('./routes/user'));
app.use('/customer', require('./routes/customer'));
app.use('/department', require('./routes/department'));
app.use('/visit', require('./routes/visit'));
app.use('/job', require('./routes/job'));
app.use('/image', require('./routes/image'));
app.use((req, res) => {
	res.status(404);
	res.send('NOT FOUND!');
});