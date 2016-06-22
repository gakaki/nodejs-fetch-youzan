# nodes-fetch-youzan
		记得一定要先下载 selenium-server-standalone-2.53.0.jar 放入本目录的根目录下。
		具体见package.json中的 scripts节点
		
		npm run start 运行
		使用nodejs cheeio 和 webdrive 调用selenium 抓取
		有赞的商品数据列表 最后写入rethinkdb数据库

		需求点： 其实就是为了取有赞的uv pv 他们没有提供api


		
		因为webdrive的原理就是调用 调用selenium 这个集成测试的 api
		cheeio在这里负责做 截图 html字符串的工作
		ps:由于此题需要进行登入所以只能在 ubuntu 桌面版 mac 和 windows上才能跑了
