const express = require('express'),
	route = express.Router();

const {
	success,
	getImageInfo
} = require('../utils/tools');

const {
	writeFile
} = require('../utils/promiseFS');


//=>获取部门列表
route.get('/list', (req, res) => {
	let data = req.$imageDATA;
	data = data.map(item => {
		return {
			num: item.num,
			width: item.width,
			height: item.height,
			smallImage: item.smallImage,
            largeImage: item.largeImage
		}
	});
	// if (data.length > 0) {
	// 	res.send(success(true, {
	// 		data: data
	// 	}));
	// 	return;
	// }
	// res.send(success(false, {
	// 	codeText: 'no matching data was found!'
	// }));
	res.send(success(true, {
		data: data
	}));
});

//=>获取部门信息
route.get('/info', (req, res) => {
	let {
		imagenum = 0
	} = req.query;
	if (parseFloat(imagenum) === 0) {
		imagenum = req.session.imagenum;
	}
	let data = getImageInfo(imagenum, req);
	if ('name' in data) {
		res.send(success(true, {
			data: {
				num: data.num,
				width: data.width,
				height: data.height,
				smallImage: data.smallImage,
                largeImage: data.largeImage
			}
		}));
		return;
	}
	res.send(success(false, {
		codeText: 'no matching data was found!'
	}));
});

//=>增加新部门
route.post('/add', (req, res) => {
	let $imageDATA = req.$imageDATA,
		passDATA = null;
	passDATA = Object.assign({
		num: $imageDATA.length === 0 ? 1 : (parseFloat($imageDATA[$imageDATA.length - 1]['num']) + 1),
		width: '',
		height: '',
		smallImage: '',
        largeImage: ''
	}, (req.body || {}));
	$imageDATA.push(passDATA);

	writeFile('./json/image.json', $imageDATA).then(() => {
		res.send(success(true));
	}).catch(() => {
		res.send(success(false));
	});
});

//=>修改部门信息
route.post('/update', (req, res) => {
	req.body = req.body || {};
	let $imageDATA = req.$imageDATA,
		imagenum = req.body.imagenum,
		flag = false;
	delete req.body.imagenum;
	$imageDATA = $imageDATA.map(item => {
		if (parseFloat(item.num) === parseFloat(imagenum)) {
			flag = true;
			return {
				...item,
				...req.body
			};
		}
		return item;
	});
	if (!flag) {
		res.send(success(false));
		return;
	}
	writeFile('./json/image.json', $imageDATA).then(() => {
		res.send(success(true));
	}).catch(() => {
		res.send(success(false));
	});
});

//=>删除部门信息
route.get('/delete', (req, res) => {
	let $imageDATA = req.$imageDATA,
		flag = false;
	let {
		imagenum = 0
	} = req.query;
	$imageDATA = $imageDATA.map(item => {
		if (parseFloat(item.num) === parseFloat(imagenum)) {
			flag = true;
			return {
				...item,
				state: 1
			};
		}
		return item;
	});
	if (!flag) {
		res.send(success(false));
		return;
	}
	writeFile('./json/image.json', $imageDATA).then(() => {
		res.send(success(true));
	}).catch(() => {
		res.send(success(false));
	});
});

module.exports = route;