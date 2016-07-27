// 引入有赞SDK
var SDK = require('youzan-sdk');
// 初始化SDK，在 https://koudaitong.com/v2/apps/open/setting 开启API接口，复制相应 AppID、AppSecert

let AppID 		= "0eb3d2acf73c033353"
let AppSecert 	= "e4dbae40b7a367c1efb7eea48c00fa75"
var sdk 		= SDK({key: AppID, secret: AppSecert})
// console.log(sdk)

// // 用GET方法 获取出售中的商品列表
// sdk.get('kdt.items.onsale.get', {
//     page_size: 20,
//     ...
// }).then(function(data) {
//     // do some thing with data
// });

sdk.get('kdt.item.get', {
    num_iid: "58358083",
    fields: ""
}).then(function(data) {
    // make some thing
	if ( data ){		
		console.log(data.response.item)		
	}
});

