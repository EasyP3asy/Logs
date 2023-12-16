

let today =  new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));		
let startDate = new Date(today-604800000);
let endDate = "";
let userId = "";
let userName="";
let dropdown = document.querySelector('.dropdown');
let getUrl="https://backend.apexhos.com/hos_events?userId=%21%2A~User%3A";		
dropdown.onclick = function(){
		dropdown.classList.toggle('active');
}

/////// token/////////////////////

let token ="";




////////////////////////////////////

let getRequestOptions;


let previousEvent;
let previousTableDate="";
let currentTableDate="";



let infoField = document.querySelector(".infoField");
let table;
let tableHead;
let tableBody;

let chart;

let allGraphWrapper;
let allTableWrapper;

/////////////////INFO ARRAYs
let durationMap;
let resetPointsMap;


let mapTableChart = new Map();

let sortedArray = [];


document.getElementById('endDate').value=getFormattedDate(today);	
document.getElementById('startDate').value=getFormattedDate(startDate);



	
function submitAndBuild(){	
	startDate = document.getElementById("startDate").value.toString();
	endDate = document.getElementById("endDate").value.toString();
	
	if(!fillRequired()){
		
		document.querySelector('.fade-in-container').style.animation="fadeIn 0.3s linear forwards";
		setTimeout(function(){
		  document.querySelector('.fade-in-container').style.display = 'none';
		},300);	
		setGetUrl(startDate,endDate);
		setTimeout(tableInfoBuilder,300);
		document.querySelector('div.spinner').style.display="block"; // activate spinner
	}
	else{
		  if(document.querySelector('input.textBox').value.toString()==""){
				if(document.querySelector('div.dropdown span ion-icon')==null){
					document.querySelector('div.dropdown span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");
				}	
		  }
		  if(startDate>endDate){
			  if(document.querySelector('div.inputDate span ion-icon')==null){
					document.querySelector('div.inputDate span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");
					document.querySelector('div.inputDate2 span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");
		
				}			  
		  }
		  
		  
		  
	}
	
}



async function tableInfoBuilder(){ 
	

	
	await setToken();	
	getRequestOptions = setGetOptions();	
	previousEvent= await getPreviousEvent();
	
	
	document.querySelector("#infoCard").style.display="block";
	let jsonData = await fetch(getUrl,getRequestOptions).then(response => {
		
		if(response.status=200){
			return response.json();
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	 // parse to JSON 	
	
	
	
	
	let dataArray = jsonData.data;
	dataArray.sort(compare);
	
	removeInactiveChanged(dataArray);  // creates new sortedArray
	
	
	//////////// get infos && fill info arrays and Maps
	durationMap=fillAndGetDurationMap(sortedArray); 
	
	
	
	document.querySelector('div.spinner').style.display="none"; // deactivate spinner
	createContainers();
	createNewTable(); // creates new Table with wrapper no head
	
	
	
	
	
	
	if(previousEvent!=undefined){
		tableBodyBuilder(previousEvent,-1); // construct previousDaylog
		dataArray.unshift(previousEvent); //adds element to the beginning of the dataArray 		
	}
	
	
	
	
	
	for(let tableRows = 0 ; tableRows<sortedArray.length;tableRows++){				
		tableBodyBuilder(sortedArray[tableRows],tableRows);
	}	
	
	let charts = document.querySelectorAll('.chartWrapper');
	for(let counter = 0 ; counter < charts.length;counter++){
		let chartKey = charts[counter].parentElement;	
		let tableBody = mapTableChart.get(chartKey);
		
		chartBuilder(charts[counter].querySelector('.statusWrapper'),tableBody,previousEvent);
		
	}

	

	
}
























									/*  funtions    */
	
	function fillRequired(){
			const inputDriverName = document.querySelector('input.textBox').value.toString();			
			if(inputDriverName == "" || startDate>endDate){
				return true;
			}			
			return false;	
			
	}

	function padTo2Digits(num){
		return num.toString().padStart(2, '0');
	}


	function getFormattedDate(date){	
			const year = date.getFullYear();
			const month = padTo2Digits(date.getMonth() + 1);
			const day = padTo2Digits(date.getDate());
			const dateWithSlashes = [year, month, day].join('-');		
			return dateWithSlashes;	
	}


	function show(name,id){
			document.querySelector('.textBox').value=name;
			if(document.querySelector('div.dropdown span ion-icon')!=null){
				document.querySelector('div.dropdown span ion-icon').remove();	
			}	
			 userId = setUserId(id);
			 userName=name;
		}
		
	function setUserId(id){		
		return id.substr(id.toString().search("User:")+5);	
	}	
	
	
		
	function setGetUrl(startingDate, lastDate){	
		startingDate=startingDate.replaceAll("-","%2F");
		lastDate=lastDate.replaceAll("-","%2F");
		getUrl=getUrl+userId+"&eventTime.logDate.date%5B%24gte%5D="+startingDate+"&eventTime.logDate.date%5B%24lte%5D="+lastDate;	
	}
	
	
	function setPostUrl(){
		
		
		
		
	}
	
	
	function compare(firstObj,secondObj){

	let firstObjectTimeStamp = firstObj.eventTime.timestamp;
	let secondObjectTimeStamp = secondObj.eventTime.timestamp;
	if(firstObjectTimeStamp>secondObjectTimeStamp){
		return 1;
	}	
	else if(firstObjectTimeStamp<secondObjectTimeStamp){
		return -1;
	}
	return 0;

}



function createNewTable(){
	
	//creating table Container
	let tableContainer = document.createElement("div");
	tableContainer.className='tableContainer';
	
	let tableWrapper = document.createElement("div");
	tableWrapper.className="tableWrapper";
	
	tableContainer.appendChild(tableWrapper);
	
	
	//creating table
	table= document.createElement("table");
	table.className="main table ";	

	
	
	//appending table into its container
	
	tableWrapper.appendChild(table);	
	tableContainer.appendChild(tableWrapper);
	allTableWrapper.appendChild(tableContainer);
	
}


function createNewTableBody(){

	tableBody = document.createElement('tbody');
	table.appendChild(tableBody);
	return tableBody;
}


function createTableHead(){
	
		
		let stringArray = ["Time(ET)","Event","Duration","Status","Location","Origin","Odometer","Engine Hours","ID"];
		tableHead = document.createElement('thead');
		
		let tableHeadRow =document.createElement('tr');
		tableHeadRow = tableHead.appendChild(tableHeadRow);
		for(let counter =0 ; counter < stringArray.length; counter++){
			
			let tableHeadCell=document.createElement('th');			
			let tableHeadCellValue=document.createTextNode(stringArray[counter]);					
			tableHeadCell.appendChild(tableHeadCellValue);						
			tableHeadRow.appendChild(tableHeadCell);
			
			
		}	
		table.appendChild(tableHead);
		
		return stringArray.length;
	
	
	
}


function createContainers(){

	let graphTableContainer = document.createElement('div');
	graphTableContainer.className=('graphTableContainer');	
	
	let graphTableWrapper = document.createElement('div');
	graphTableWrapper.className='graphTableWrapper';
	
	graphTableContainer.append(graphTableWrapper);


	let allGraphContainer = document.createElement('div');
	allGraphContainer.className='allGraphContainer';
	
	allGraphWrapper = document.createElement('div');
	allGraphWrapper.className='allGraphWrapper';
	
	allGraphContainer.appendChild(allGraphWrapper);
	


	let allTableContainer=document.createElement('div');
	allTableContainer.className="allTableContainer";
	
	allTableWrapper = document.createElement('div');
	allTableWrapper.className='allTableWrapper';
	
	allTableContainer.appendChild(allTableWrapper);	
	
	graphTableWrapper.appendChild(allGraphContainer);
	graphTableWrapper.appendChild(allTableContainer);	
	
	infoField.appendChild(graphTableContainer);
	
}

function createGraphContainer(){
	
	let chartContainer =document.createElement("div");
	chartContainer.className='chartContainer';
	
	let chartWrapper = document.createElement("div");
	chartWrapper.className="chartWrapper";
	
	chartContainer.appendChild(chartWrapper);
	
	
	
	let img = document.createElement("img");
	img.src="images/chart.png";
	img.className="newChart_img";
	
	let statusContainer = document.createElement("div");
	statusContainer.className='statusContainer';
	
	let statusWrapper=document.createElement("div");
	statusWrapper.className='statusWrapper';
	
	statusContainer.appendChild(statusWrapper);
	
	chartWrapper.appendChild(img);
	chartWrapper.appendChild(statusContainer);
	
	allGraphWrapper.appendChild(chartContainer);
	
	
	return chartContainer;	
	
	

}






function tableBodyBuilder(infoArray,row){
	
		
					
			
		//// time 
	
	

		let tableBodyCellTimeValue = document.createTextNode(getFormattedTime(infoArray.eventTime.timestamp));
		
		let createNew = checkIfDayChanged(infoArray.eventTime.timestamp);
		
		if(row==0){			
			createNew = false;			
		}	
	
		if(createNew==true && row!=-1){	
			let emptyDays = getEmptyDays(infoArray.eventTime.timestamp);
			
			
				for(let counter = 0 ; counter <=emptyDays;counter++){				
					createNewTableBody();	
					chart = createGraphContainer();
					mapTableChart.set(chart,tableBody);					
				}
			
			
		}
		if(createNew==true && row==-1){
			createTableHead();	
			createNewTableBody();	
			chart=createGraphContainer();
			mapTableChart.set(chart,tableBody);	
								
		}
		
		let tableBodyRow=tableBody.insertRow();
		let tableBodyCell = tableBodyRow.insertCell();		
		if(row==-1)
		{
			tableBodyRow.className="previousEvent";
		}			
		tableBodyCell.className="timeCell dateCell";
		let tableBodyCellSpanContainer = document.createElement('span');		
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyCellTimeValue);
		
		// Event 
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-190px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyEventNameValue = document.createTextNode(getEventName(infoArray.eventCode.id,infoArray));
		tableBodyCellSpanContainer.className=infoArray._id;
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyEventNameValue);
		//duration
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-105px";
		tableBodyCellSpanContainer = document.createElement('span');		
		let tableBodyEventDurationValue = document.createTextNode(timeToStringFormatFunction(durationMap.get(infoArray._id)==undefined? "" : durationMap.get(infoArray._id)));
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyEventDurationValue);
		
		
		
		// Status
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCellSpanContainer = document.createElement('span');
		tableBodyCell.className="width-70px";
		let tableBodyStatusValue = document.createTextNode((infoArray.recordStatus!=undefined)? infoArray.recordStatus.id : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyStatusValue);	
		
		
		// Location 
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-120px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyLocationValue = document.createTextNode((infoArray.location!=undefined)? infoArray.location.calculatedLocation : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyLocationValue);
		//Origin 
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-85px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyOriginValue = document.createTextNode((infoArray.location!=undefined)? (infoArray.recordOrigin.id=="ELD" ? "Auto" : infoArray.recordOrigin.id) : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyOriginValue);	
		
		// Odometer 
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-115px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyOdometerValue = document.createTextNode((infoArray.totalVehicleMiles!=undefined)? infoArray.totalVehicleMiles : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyOdometerValue);
		
		// Engine Hours 
		tableBodyCell = tableBodyRow.insertCell();
		tableBodyCell.className="width-110px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyEngineHourValue = document.createTextNode((infoArray.totalEngineHours!=undefined)? infoArray.totalEngineHours : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyEngineHourValue);		
		
		// id
		tableBodyCell = tableBodyRow.insertCell();	
		tableBodyCell.className="width-50px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyEventId = ( infoArray.seqId!=undefined )? infoArray.seqId : "";
		tableBodyEventId = document.createTextNode(tableBodyEventId=parseInt(tableBodyEventId,16));
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.appendChild(tableBodyEventId);		
		
			
		
			
}



function chartBuilder(statusWrapper,tableBody,previousTableEvent){
	
	
	buildPointer(statusWrapper);
    buildResets(statusWrapper,tableBody);
	buildIntermediates(statusWrapper,tableBody);
//	buildLogDurations();
//	buildVerticals();
//	buildHorizontals();
	
	
	


}


function buildPointer(statusWrapper){

	
		let pointer = document.createElement("div");
		pointer.className="pointer";						
		statusWrapper.appendChild(pointer);
		let timeValueContainer = document.createElement("div");
		timeValueContainer.className="timeValue";
		pointer.appendChild(timeValueContainer);
		let position ;
		let getFormattedTime;
		const rect = statusWrapper.getBoundingClientRect();
		let mouseX;
		let mouseY;
		statusWrapper.onmousemove = function(){
			pointer.style.display="block";
		
			if(event.target==statusWrapper){
			
				mouseX=event.offsetX;
				pointer.style.left=(mouseX/12+0.05)+"%";
				position = mouseX/1200;
				getFormattedTime=getPointerTime(position);
				timeValueContainer.innerText = getFormattedTime;
			}
		}
		
		statusWrapper.addEventListener("mouseleave",()=>{pointer.style.display="none";});
			
	


}

function buildResets(statusWrapper,tableBody){

	
		
		
		for(let counter = 0 ; counter<tableBody.rows.length;counter++){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let resetPoint = resetPointsMap.get(eventCode);
		
			
			if(resetPoint!=undefined){
				let resetPointTimeStamp = resetPoint;
				let shiftResetPoint= document.createElement("div");
				shiftResetPoint.className="shiftResetPoint";	
				let position = getXCoordinate(resetPointTimeStamp);				
				statusWrapper.appendChild(shiftResetPoint);
				shiftResetPoint.style.left="calc("+position*100+"%)";
			}	
				
			
				
		}

}

function buildIntermediates(statusWrapper,tableBody){
	
	
	for(let counter= 0 ; counter<tableBody.rows.length;counter++){
		let eventName = tableBody.rows[counter].cells[1].innerText;
		if(eventName=="Intermediate w/ CLP"){
			let intermediatePoint = document.createElement("div");
			intermediatePoint.className="intermediate";
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			intermediatePoint.style.left="calc("+(position*100-0.25)+"%)";			
			let interTimeContainer = document.createElement("span");
			interTimeContainer.className="interTime";
			let interTimeValue = tableBody.rows[counter].cells[0].innerText;
			interTimeValue = interTimeValue.substring(interTimeValue.indexOf(",")+1);
			interTimeValue = document.createTextNode(interTimeValue);
			interTimeContainer.appendChild(interTimeValue);
			intermediatePoint.appendChild(interTimeContainer);
			statusWrapper.appendChild(intermediatePoint);
			
		}
	}
}




function getXCoordinate(timeStamp){
		
	
	let date = new Date(new Date(timeStamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	
	let totalSeconds = hours*3600+minutes*60+seconds;
	
	let position = totalSeconds/86400;
 
	return position;

}



function getFormattedTime(time){
	
	
		let date = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
		let month = date.toLocaleString('default', { month: 'short' });
		let fullFormattedTime ="";
		fullFormattedTime+=month;
		let dateNumber = date.getDate();
		fullFormattedTime+=" "+dateNumber+", ";
		fullFormattedTime+=formatAMPM(date);
		
		return fullFormattedTime;
		
		
}	


function formatAMPM(date){
	
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let ampm = hours >= 12 ? 'pm' : 'am';
	let seconds = date.getSeconds();
	hours= hours%12;
	hours = hours ? hours : 12;
	hours=padTo2Digits(hours);
	minutes=padTo2Digits(minutes);
	seconds=padTo2Digits(seconds);
	return hours+":"+minutes+":"+seconds+" "+ampm;
	
}

function getEventName(eventCode,infoSet){
	
	switch(eventCode){		
		case 'DR_LOGIN':
			return "Login";
		break;
		
		case 'DR_LOGOUT':
			return "Logout";
		break;
		
		case 'DS_OFF':
			return "Off Duty";
		break;
		
		case 'DS_D':
			return "Driving";
		break;
		
		case 'DS_ON':
			return "On Duty";
		break;
		
		case 'ENG_DOWN_NORMAL':
			return "Engine Shut-down w/ CLP";
		break;
		
		case 'DR_IND_YM':
			return "Yard Moves";
		break;
		
		case 'DS_SB':
			return "Sleeper";
		break;
		
		case 'ENG_UP_NORMAL':
			return "Engine Power-up w/ CLP";
		break;
		
		case 'DR_IND_PC':
			return "Personal Use";
		break;
		
		case 'LOG_NORMAL_PRECISION':
			return "Intermediate w/ CLP";
		break;
		
		case 'DR_CERT_1':
			return "Certification (1) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_2':
			return "Certification (2) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_3':
			return "Certification (3) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_4':
			return "Certification (4) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_5':
			return "Certification (5) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_6':
			return "Certification (6) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_7':
			return "Certification (7) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_8':
			return "Certification (8) "+infoSet.certifiedRecordLogDate.date;
		break;
		
		case 'DR_CERT_9':
			return "Certification (>=9) "+infoSet.certifiedRecordLogDate.date;
		break;
	}		
	
}	




async function setToken(){
	
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

let raw = JSON.stringify({
  "strategy": "local",
  "email": "jasavazov331@gmail.com",
  "password": "Jasur2027",
  "company": "Company:RU7OoXRkW4",
  "rCode": "alz"
});

let requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};
let jsonData;

await fetch("https://backend.apexhos.com/authentication", requestOptions)
  .then(response => response.json())
  .then(result => {jsonData=result})
  .catch(error => console.log('error', error));  

	token = jsonData.accessToken;	

	
}	


function setGetOptions(){
	
	return {
		method : 'GET',
		headers: {'Authorization': 'Bearer '+  token},
		muteHttpExceptions: true
	}; 
	
	
}	



function checkIfDayChanged(time){
	
	time = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	currentTableDate=getFormattedDate(time);
	
	if(currentTableDate==previousTableDate){
	
		previousTableDate=currentTableDate;
		return false;
	
	}
	else if(previousTableDate=="" || currentTableDate!=previousTableDate){				
		previousTableDate=currentTableDate;
		return true;
	}	
	
	
	
	
	
	
	
}


function getEmptyDays(time){
	
	let currentEventTime = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
	let previousEventTime = new Date(new Date(previousTableDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	let timeDifference = parseInt(currentEventTime-previousEventTime);

	let numberOfDays = timeDifference / 86400000;
	
	return Math.floor(numberOfDays);
	
	
}	




async function getPreviousEvent(){
	let startDate = document.getElementById("startDate").value.toString();
	startDate=startDate.replaceAll("-","%2F");
	
	let url = "https://backend.apexhos.com/hos_events?%24limit=1&%24sort%5B0%7CeventTime.logDate.date%5D=-1&%24sort%5B1%7CeventTime.timestamp%5D=-1&userId=%21%2A~User%3A";
	url=url+userId+"&eventTime.logDate.date%5B%24lt%5D=";
	url=url+startDate;
	
	let urlForPC = url+"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DR_IND_PC";
	let urlForOff = url+"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DS_OFF"
	let urlForOn = url+"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DS_ON";
	let urlForOffWT= url+"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DS_WT";
	let urlForYM = url+"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DR_IND_YM";
	let urlForSB = url +"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DS_SB";
	let urlForDr = url +"&recordStatus.id=%21%2A~ACTIVE&eventCode.id=%21%2A~DS_D";
	
	
	
	
	
	
	let getOptions = {
		method : 'GET',
		headers: {'Authorization': 'Bearer '+  token},
		muteHttpExceptions: true
	}; 
	
	let lastEventInfoArray=[];
	let lastPCEvent = await fetch(urlForPC,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastOffEvent = await fetch(urlForOff,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastOnEvent = await fetch(urlForOn,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastOffWT = await fetch(urlForOffWT,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastYMEvent = await fetch(urlForYM,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastSBEvent = await fetch(urlForSB,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data[0]!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	
	let lastDrEvent = await fetch(urlForDr,getRequestOptions).then(response => {
		
		if(response.status==200){
			return response.json().then(result=>{result.data!=undefined ? lastEventInfoArray.push(result.data[0]) : ""});
		}
		else {
			throw "Token is expired";
		}	
	
	});
	

	
	
	
	
	
	
	lastEventInfoArray.sort(compare);	

	
	
	return lastEventInfoArray[lastEventInfoArray.length-1];
	
	
}	

function removeInactiveChanged(infoArray){
	
		for(let counter = 0 ; counter < infoArray.length;counter++){
			if(infoArray[counter].recordStatus!=undefined){
				if(infoArray[counter].recordStatus.id != "INACTIVE_CHANGED"){					
					sortedArray.push(infoArray[counter]);					
				}
			}
		}	
	
}	


////////// getters and fillers

function fillAndGetDurationMap(infoArray){

	durationMap = new Map();
	resetPointsMap = new Map();
	let previousEventData = previousEvent;
	let previousEventId = previousEvent._id;
	let previousEventStartingTime = new Date(new Date(previousEvent.eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	
	
	for(let counter =0; counter<infoArray.length;counter++)
	{
		let currentEventName = infoArray[counter].eventCode.id;
		let currentEventStartingTime = new Date(new Date(infoArray[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));;
		if(currentEventName == "DR_IND_PC" ||  currentEventName=="DR_IND_YM" || currentEventName=="DS_SB" || currentEventName=="DS_ON" || currentEventName=="DS_D" || currentEventName=="DS_OFF" ){
			
			let duration = currentEventStartingTime-previousEventStartingTime;		
			
			if(duration>36000000 && (previousEventData.eventCode.id=="DS_OFF" || previousEventData.eventCode.id == "DS_SB")){
				resetPointsMap.set(infoArray[counter]._id,infoArray[counter].eventTime.timestamp);
			}
			durationMap.set(previousEventId,duration);
			previousEventId = infoArray[counter]._id;
			previousEventData = infoArray[counter];
			previousEventStartingTime = currentEventStartingTime;

		}

	}
	if(durationMap.get(previousEventId)==undefined){
			let now  = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
			let duration = (now-previousEventStartingTime);
			durationMap.set(previousEventId,duration);
	}	
	
	return durationMap;
	
}


function getPointerTime(position){

	let timeFormat ;
	let duration = parseInt(position*86400000);
	let hour = parseInt(duration / 3600000);
	let minute = duration %3600000;
	minute = parseInt(minute/60000);
	let second = duration%3600000%60000;
	second = parseInt(second/1000);
	
	
	if(position>=0.5){
		return hour+" : "+minute+" : "+second+" pm";
	}	
	
	return hour+" : "+minute+" : "+second+" am";




}





function timeToStringFormatFunction(duration){

	let timeFormat ;
	let hour = parseInt(duration / 3600000);
	let minute = duration %3600000;
	minute = parseInt(minute/60000);
	let second = duration%3600000%60000;
	second = parseInt(second/1000);
	
	if(hour==0 && minute==0 && second==0){
		timeFormat = ' ';
	}
	else if(hour == 0 && minute == 0 && second !=0){
		timeFormat = second+'s';	
	}
	else if(hour==0 && minute!= 0 && second != 0 ){
		timeFormat = minute+'m : '+second+'s';
	}else if (hour==0 && minute!=0 && second==0){
		timeFormat = minute+'m';
	}
	else if(hour!=0 && minute !=0 && second !=0){
		timeFormat = hour+'h:'+minute+'m:'+second+'s';
	}
	else if(hour!=0 && minute != 0 && second == 0){
		timeFormat  =  hour+'h:'+minute+'m';
	}
	else if(hour!=0 && minute == 0 && second != 0){
		timeFormat = hour+'h:'+second+'s';
	}
	else if(hour!=0 && minute==0 && second==0){
		timeFormat = hour+'h';
	}
		
	timeFormat=timeFormat;
	
	return timeFormat;
	
}






/*  dynamic CSS file
function loadCSS() { 
  
   
      
  
    let head = document.getElementsByTagName('head')[0]
      
    // Creating link element
    let style = document.createElement('link') 
    style.href = 'LogTableDesign.css'
    style.type = 'text/css'
    style.rel = 'stylesheet'
	style.id='afterStyles';
	if(document.querySelector('#afterStyles')==undefined){
		head.append(style);
	}
	else{
		document.querySelector('#afterStyles').remove();
		head.append(style);
	}	
    
	
	
	
}

*/