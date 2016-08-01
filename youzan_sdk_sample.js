
(async () => {

	function get_brand_name(data){
		var reg = /【.*】/
		var res = data.match(reg)
		console.log(res)
		res     = res[0]
		return res
	}

	console.log(get_brand_name("	MARIPOSA 蝴蝶百合墙饰（一套装）【umbra】"));


	// 引入有赞SDK
	let SDK 		= require('youzan-sdk');
	// 初始化SDK，在 https://koudaitong.com/v2/apps/open/setting 开启API接口，复制相应 AppID、AppSecert

	let AppID 		= "0eb3d2acf73c033353"
	let AppSecert 	= "e4dbae40b7a367c1efb7eea48c00fa75"
	let sdk_obj 	= SDK({key: AppID, secret: AppSecert})
	let data 		= await sdk_obj.get('kdt.item.get', {
	    num_iid: "58358083",
	    fields: ""
	});

	console.log(data.response.item);

	
})();