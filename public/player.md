1	播放	play	UIKitDEMO.play()	all	url[string]：开始播放的ezopen协议地址
accessToken[string]：设备所在账号的token	Promiseresolve(true)reject(false)	seek回放功能依赖能力集[ort_seek_playback]
2	停止	stop	UIKitDEMO.stop()	all	/	/	
3	暂停	pause	UIKitDEMO.pause()	all（即将弃用）	/	Promiseresolve()reject(errorMsg)	
4	恢复播放	resume	UIKitDEMO.resume()	all（即将弃用）	time[string]：恢复播放的时间点，需保持‘yyyyMMddhhmmss’格式	Promiseresolve(true)reject(false)	
5	获取基准时间	getOSDTime	UIKitDEMO.getOSDTime(()=>{})	all	getOSDTimeCallback[function]：回调事件，用于接收获取的OSD时间	Promiseresolve({code:0,retcode:0,data:OSDData})reject({code:-1,retcode:-1,data:errorData})	
6	截图	capturePicture	UIKitDEMO.capturePicture()	all	name[string]：截图文件名称
callback[function]：截图回调事件	Promiseresolve({code:0,id:'',type:'capturePicture'})reject({code:-1,id:'',type:'capturePicture'})	
7	开始录制	startSave	UIKitDEMO.startSave({name:''})	all	*name[string]：录制文件名称	Promiseresolve({code:0,id:'',type:'startSave'})reject({code:-1,id:'',type:'startSave'})	
8	结束录制	stopSave	UIKitDEMO.stopSave()	all	/	Promiseresolve({code:0,id:'',type:'stopSave'})reject({code:-1,id:'',type:'stopSave'})	
9	开启声音	openSound	UIKitDEMO.openSound()	all	/	Promiseresolve({code:0,id:'',type:'openSound'})reject({code:-1,id:'',type:'openSound'})	
10	关闭声音	closeSound	UIKitDEMO.closeSound()	all	/	Promiseresolve({code:0,id:'',type:'closeSound'})reject({code:-1,id:'',type:'closeSound'})	
11	开启电子放大	Zoom.startZoom	UIKitDEMO.Zoom.startZoom()	8.0.5	/	/	
12	关闭电子放大	Zoom.stopZoom	UIKitDEMO.Zoom.stopZoom()	8.0.5	/	/	
13	电子放大执行放大	zoomAdd	UIKitDEMO.zoomAdd(1)	8.1.5	scale[number]：放大倍数	/	
14	电子放大执行缩小	zoomSub	UIKitDEMO.zoomSub(1)	8.1.5	scale[number]：缩小倍数	/	
15	开启3D定位	enable3DZoom	UIKitDEMO.enable3DZoom()	all（即将弃用）	/	Promise	依赖能力集[ort_zoomOut_maxTime]
16	关闭3D定位	close3DZoom	UIKitDEMO.close3DZoom()	all（即将弃用）	/	Promise	依赖能力集[ort_zoomOut_maxTime>]
17	设置播放器封面	setPoster	UIKitDEMO.setPoster('https://....')
配合抓图接口设置图片封面：https://open.ys7.com/help/1387	all	*url[string]：封面图片地址	/	
18	调整播放器尺寸	reSize	UIKitDEMO.reSize(600,400)	all	*width[number]：宽度
*height[number]：高度	/	
19	倍速	fast	UIKitDEMO.fast(2)	7.6.1	*next[number]：目标倍速（目前仅支持1倍、2倍、4倍）	Promiseresolve({code:0,data:{speed:1,result:''},})reject({code:-1,data:{speed:1,result:''}})	
20	全局全屏	fullScreen	UIKitDEMO.fullScreen()	all	/	{code:isFullScreen,id:'',type:'fullScreen'}	
21	退出全局全屏	cancelFullScreen	UIKitDEMO.cancelFullScreen()	all	/	/	
22	开启对讲	startTalk	UIKitDEMO.startTalk()	all	/	/	
23	关闭对讲	stopTalk	UIKitDEMO.stopTalk()	all	/	/	
24	获取当前清晰度	getDefinition	UIKitDEMO.getDefinition()	7.5.0~8.0.4	/	String'hd'	'sd'
25	切换清晰度	setDefinition	UIKitDEMO.setDefinition('hd')	7.5.0~8.0.4	*type[string]：目标清晰度，sd：标清，hd：高清	/	
26	获取当前设备支持的清晰度	getVideoLevelList	UIKitDEMO.getVideoLevelList()	8.0.5	/	array[object]	依赖设备报备清晰度能力集
27	获取当前清晰度	getVideoLevel	UIKitDEMO.getVideoLevel ()	8.0.5	/	number	/
28	切换清晰度	changeVideoLevel	UIKitDEMO.changeVideoLevel(level)	8.0.5	number	/	level为getVideoLevelList响应结果中任一对象的level字段
29	获取当前云台状态	getPtzStatus	UIKitDEMO.getPtzStatus()	7.5.0	/	Boolean	
30	开启云台	openPtz	UIKitDEMO.openPtz()	7.5.0	/	/	
31	关闭云台	closePtz	UIKitDEMO.closePtz()	7.5.0	/	/	
32	获取浏览器网页全屏状态	isBrowserFullscreen	UIKitDEMO.isBrowserFullscreen()	7.5.0 ~ 8.0.5	/	Boolean	
33	开启网页全屏	browserFullscreen	UIKitDEMO.browserFullscreen()	7.5.0	/	/	
34	退出网页全屏	exitBrowserFullscreen	UIKitDEMO.exitBrowserFullscreen()	7.5.0	/	/	
35	获取当前播放速率	getPlayRate	UIKitDEMO.getPlayRate()	7.5.0	/	{speed:1}	
36	切换播放地址	changePlayUrl	UIKitDEMO.changePlayUrl()	all	options[object]：切换播放地址配置项，包括：
        url[string]：开始播放的ezopen协议地址
        accessToken[string]：设备所在账号的token
        deviceSerial[string]：设备序列号
c	Promise	
37	设置麦克风增益系数	setVolumeGain	UIKitDEMO.setVolumeGain(volume)	8.0.9	volume[number]：麦克风增益系数（0 ~ 10）	{ code:0, msg: xxx }	依赖能力集[support_talk]
38	获取麦克风权限	getMicrophonePermission	UIKitDEMO.getMicrophonePermission()	8.0.9	/	Promise.resolve({ code: 0, msg: xxx })	依赖能力集[support_talk]
39	获取麦克风列表	getMicrophonesList	UIKitDEMO.getMicrophonesList()	8.0.9	/	Promise.resolve({ code: 0, msg: xxx, res: [] })	依赖能力集[support_talk]
40	切换麦克风	setProfile	UIKitDEMO.setProfile({ microphoneId })	8.0.9	microphoneId[string]：麦克风的deviceId，从getMicrophonesList接口中获取	/	依赖能力集[support_talk]
41	水印叠加	setWaterMarkFont	UIKitDEMO.setWaterMarkFont({

fontString: ['watermark'],

startPos: { fX: 0.1), fY:  0.1},

fontColor: { fR: parseFloat(0 / 255).toFixed(3), fG: parseFloat(0 / 255).toFixed(3), fB: parseFloat(0 / 255).toFixed(3), fA: 1 },

fontSize: { nFontWidth:  16, nFontHeight: 16 },

fontRotate: { fRotateAngle: 0, fFillFullScreen: true},

fontFamily: 'Arial',

fontNumber: { nRowNumber: 4, nColNumber:  4},

space: 1

})	7.7.9	null:关闭水印
options[object]：水印参数，包括：
        fontString[string[]]：文本信息，数组元素间换行（必填）
        startPos[object]：文本位置{fX,fY}，原点为画面左上角，范围为0~1
        fontColor[object]：字体颜色{fR,fG,fB，fA}（0~255归一化处理，各子参数范围均为0~1）
fontSize[object]：字体大小{nFontWidth,nFontHeight}
fontRotate[object]：{fRotateAngle(字体旋转角度),fFillFullScreen(是否平铺)}
fontFamily[string]：字体
space[int]：行间距，默认为1
/	若希望初始化播放就展示水印，可以在初始化时传入的handleSuccess中调用该API，会在画面播放成功后立即叠加水印
42	镜像翻转	setMirrorFlip	UIKitDEMO.setMirrorFlip(2)	7.6.7	command[number]：翻转对称点，0-上下, 1-左右, 2-中心		需要设备支持
43	销毁	destroy	UIKitDEMO.destroy()	8.0.0	/		
44	展示码流信息	displayStreamInfo	UIKitDEMO.displayStreamInfo(false)	8.1.16	true / false		展示码流信息会消耗性能, 不同码流（主子码流）间切换之前的信息不会变