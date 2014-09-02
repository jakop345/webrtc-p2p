var flag=0;
var mytype,para1,para2;
var res="";
var oldres="";
/*
�����¼�:	mytype=0
			para1=������
			para2=0(down)��1(up)
			
�������	mytype=1
			para1=0(left),1(middle),2(right)
			para2=0(down),1(up)
			
����ƶ���	mytype=2
			para1=x
			para2=y
			
��������	mytype=3
			para1=����ֵ
			para2=0
*/
//�ٶ��˿��ƶ˺��м䴫����̼�Ľӿں���Ϊ transData
function transData(data) 
{
    if(dc_rd)
        dc_rd.send(data);
		
	if(document.getElementById("mytestInfo"))
	{	document.getElementById("mytestInfo").innerHTML="oldinfo:"+oldres+"<br/>newinfo:"+data;}
	
	oldres=res;
}

function enableCatch(e){  
	//if(flag==0){
		//alert("enable");
	//}
	flag=1;
	stopBubbleEvent(e);
}
function disableCatch(e){
	//if(flag==1){
		//alert("disable");
	//}
	flag=0;
	stopBubbleEvent(e);
}
function stopDefaultEvent(e){
	//��ֹ�¼�Ĭ����Ϊ
	e=e?e:window.event;
    if (e.preventDefault) {
        e.preventDefault();			//DOM
     } else {
             e.returnValue = false;//IE
    c}
}
function stopBubbleEvent(e){
	//ȡ��ð���¼�
	e=e?e:window.event; 
    if (e.stopPropagation)
        e.stopPropagation();	//DOM
    else
        e.cancelBubble = true;	//IE
}  
function catchKeyDown(e) {
		if(flag==1){
			//var event = arguments.callee.caller.arguments[0] || window.event; //�������������
			e=e?e:window.event;
			mytype=0;//����
			para1=e.keyCode;//����
			para2=0;//down
			res=mytype+" "+para1+" "+para2;   
			transData(res);
			  
			stopDefaultEvent(e);
			stopBubbleEvent(e);
		}
} 

function catchKeyUp(e) {
		if(flag==1){
			//var event = arguments.callee.caller.arguments[0] || window.event; //�������������
			e=e?e:window.event;
			mytype=0;//����
			para1=e.keyCode;//����
			para2=1;//up
			res=mytype+" "+para1+" "+para2;
			transData(res);
			
			stopDefaultEvent(e);
			stopBubbleEvent(e);
		}
}

function catchMouseDown(e)
{
	if(flag==1){
		mytype=1;
		para1=e.button;//left,middle,right:0,1,2
		para2=0;
		res=mytype+" "+para1+" "+para2;	
		transData(res);
		
		stopDefaultEvent(e);
		stopBubbleEvent(e);
		//alert("in mousedown");
	}
}
function catchMouseUp(e)
{
	if(flag==1){
		mytype=1;
		para1=e.button;//left,middle,right:0,1,2
		para2=1;
		res=mytype+" "+para1+" "+para2;
		transData(res);
		
		stopDefaultEvent(e);
		stopBubbleEvent(e);
		
		//alert("in mouseup");
	}
}


//���»�ȡ�����Ե�ǰԪ�ص�λ��
function getOffsetTop(obj){
    var tmp = obj.offsetTop;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetTop;
        val = val.offsetParent;
    }
    return tmp;
}
function getOffsetLeft(obj){
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while(val != null){
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
}
function getMousePos(e,element){
	if(flag==1){
		mytype=2;//����ƶ�
		var objTop = getOffsetTop(element);//����xλ��
		var objLeft = getOffsetLeft(element);//����yλ��
		var mouseX = e.clientX+document.body.scrollLeft;//���xλ��
		var mouseY = e.clientY+document.body.scrollTop;//���yλ��
		
		//�����������λ��
		para1= mouseX-objLeft;
		para2= mouseY-objTop;
		para1=(para1<0)?0:parseInt(para1);
		para2=(para2<0)?0:parseInt(para2);
		
		res=mytype+" "+e.clientX+" "+e.clientY+" "+element.clientWidth+" "+element.clientHeight;
		
		transData(res);
		element.style.cursor="none";
		stopDefaultEvent(e);
		stopBubbleEvent(e);
	}
	else
		element.style.cursor="default";
}

function catchScroll(e){
	if(flag==1){
		mytype=3;//������
		para1=e.wheelDelta;//��������ֵ
		para2=0;//����˲�������֮Ϊ0
		res=mytype+" "+para1+" "+para2;
		transData(res);
		
		stopDefaultEvent(e);
		stopBubbleEvent(e);
	}
}
function stopRightMenu(e){ 
	if(flag==1){
		stopDefaultEvent(e);
	}
}
function launchFullScreen(element) {  
   if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}
function cancelFullScreen() {  
   if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
} 
function init_controller(element){
	element.tabindex="0";
	var body=document.getElementsByTagName("body")[0];	
    element.onclick = enableCatch;
	body.onclick = disableCatch;
	
	body.onkeydown = catchKeyDown;
    body.onkeyup=catchKeyUp;
    element.onmousedown = catchMouseDown;
    element.onmouseup = catchMouseUp;
    element.onmousemove=function(event){getMousePos(event,element);};
    element.onmousewheel = catchScroll;
	element.oncontextmenu=stopRightMenu;//�����Ҽ���
	
	
	var para=document.createElement("p");
	para.id="mytestInfo";
	//element.appendChild(para);
	element.parentNode.insertBefore(para,element);
	
	var fullScreenButton=document.createElement("input");
	fullScreenButton.type="button";
	fullScreenButton.value="����ȫ��";
	fullScreenButton.onclick=function(){
		launchFullScreen(element);
	};
	element.parentNode.insertBefore(fullScreenButton,element);
}