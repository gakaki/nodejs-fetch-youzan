function get_brand_name(data){
  var reg = /【.*】/
  var res = data.match(reg)
  console.log(res)
  res     = res[0]
  return res
}

console.log(get_brand_name("	MARIPOSA 蝴蝶百合墙饰（一套装）【umbra】"));
