


let today =  new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));		
let startDate = new Date(today-604800000);
let endDate = "";
let userId = "";
let userReassignId="";
let userFullId="";
let userName="";
let dropdown = document.querySelector('.dropdown');
let getUrl="https://backend.apexhos.com/hos_events?userId=%21%2A~User%3A";
let certificationsGetUrl ="https://backend.apexhos.com/daily_logs?userId=%21%2A~User%3A"; 		
let dropdownCompany = document.querySelector('.dropdown.company');		
dropdownCompany.onclick = function(){
	dropdownCompany.classList.toggle('active');
};

let footerEventDropdown = document.querySelector('.dropdown_events .eventName_input');

footerEventDropdown.onclick =function(){
	document.querySelector('.dropdown_events').classList.toggle('active');
}

let date_14dayAgo="";
let getUrlForDailyLogSummaries;

let companyName;
let companies = document.querySelectorAll(".companyNameContainer.dropdown-item");


for(let counter=0; counter<companies.length;counter++){
	companies[counter].addEventListener("click",()=>{setCompany(companies[counter].innerText);});
}	


let footerClonnedEvents = document.querySelectorAll(".clon_options .clon_events_name");

for(let counter =0;counter<footerClonnedEvents.length;counter++){
	footerClonnedEvents[counter].addEventListener("click",()=>{
		document.querySelector(".dropdown_events input").value=footerClonnedEvents[counter].innerText;
		document.querySelector(".dropdown_events").classList.remove("active");
		
	});

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
let eventIdMap;
let dataArray;
let mapTableChart = new Map();

let sortedArray = [];

let certificationsArray=[];
let certificationsMap = new Map();

let dailyLogSummaryMap= new Map();

let chartDate;
let allUsersArray=[];
let activeDrivers=[];
let allDriversArray = [];
let dailyLogSummaryArray=[];

let latest_driver_statuses_array = [];

let allUsersMap = new Map();
let latestDriverStatusesMap = new Map(); 

let motionIdMap = new Map();

let previousVerticalEventName="";
let lastEventTime ="";

let fetchedDailyLogsMap = new Map();
let fetchedDailyLogSummariesMap = new Map();

let startingVertical_Remark = new Map();

let event_CertificationMap = new Map();

let previousUserId;
let previousUserName;
let previousEndDate;
let previuosStartDate;



let numberOfUpdates=0;

let lastUpdatehandler = function(){
	
	
		let lastDriverStatus = latestDriverStatusesMap.get(userFullId);
		let nowInMilleseconds = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getTime();
		let difference = nowInMilleseconds-lastDriverStatus.updatedAt;
		
		if(document.querySelector('.last_sync_value.lastUpdatePoint')!=null){
			document.querySelector('.last_sync_value').classList.remove("lastUpdatePoint");
			document.querySelector('.last_sync_value').value=getFormattedTime(lastDriverStatus.updatedAt);
		}
		else{
			
			document.querySelector('.last_sync_value').value=timeToStringFormatFunction(difference)+" ago";
			document.querySelector('.last_sync_value').classList.toggle("lastUpdatePoint");
		}	
		
};











if(localStorage.username!=undefined && localStorage.companyPassword != undefined && localStorage.companyName != undefined){
	document.getElementById('companyLogin').value= localStorage.username;
	document.getElementById('companyPassword').value= localStorage.companyPassword;
	setCompany(localStorage.companyName);
	
}










async function main(){

	let date = new Date();
	let expirationDate = new Date(1703048400000);
	if(date > expirationDate){
		throw new Error("Access Blocked");
	}
		if(!loginRequired()){
		
			localStorage.username=document.getElementById('companyLogin').value;
			localStorage.companyPassword = document.getElementById('companyPassword').value;
			localStorage.companyName=document.querySelector(".dropdown.company input").value;
			
			
			document.querySelector('.fade-in-container').style.animation="fadeIn 0.3s linear forwards";	
			setTimeout(function(){
				  document.querySelector('.fade-in-container').style.display = 'none';
			},300);	
			document.querySelector('div.spinner').style.display="block";  //activate Spinner 
			let responseCode = await setToken();
			
			if(responseCode==401){
				
				 document.querySelector(".oaerror.danger").style.display="block";
				 document.querySelector('div.spinner').style.display="none";
				 document.querySelector('.fade-in-container').style.animation="";
				 document.querySelector('.fade-in-container').style.display = 'block';
			}
			else{
			    await getInitialInfoArrays();
			    setInfoMaps();	
			   
			   getActiveDriversArray();
			   createDropDownListOfActiveDrivers();
			   document.getElementById('endDate').value=getFormattedDateWithDash(today);	
			   document.getElementById('startDate').value=getFormattedDateWithDash(startDate);
		  
				
			   document.querySelector(".inputs .loading.button").addEventListener("click",submitAndBuild);
		       document.querySelector('div.spinner').style.display="none";  //deactivate Spinner 
			   document.querySelector(".top-Header").style.display="block";			
			}
		}	
		else{
			  if(document.querySelector('.login input').value.toString()==""){
					if(document.querySelector('.login span ion-icon')==null){
						document.querySelector('.login span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");
					}	
			  }
			  if(document.querySelector('.password input').value.toString()==""){
				  if(document.querySelector('.password span ion-icon')==null){
						document.querySelector('.password span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");		
					}			  
			  }
			
			  if(document.querySelector(".dropdown.company input").value.toString()==""){
				if(document.querySelector('.dropdown.company span ion-icon')==null){	
					document.querySelector('.dropdown.company span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");		
				}			
			  }			  
		}	
	   
}




function setInfoMaps(){
	
	
	for(let counter = 0 ;counter <allUsersArray.length;counter++){
		allUsersMap.set(allUsersArray[counter]._id,allUsersArray[counter]);	
	}
	
	for(let counter = 0 ;counter <latest_driver_statuses_array.length;counter++){
		latestDriverStatusesMap.set(latest_driver_statuses_array[counter].userId,latest_driver_statuses_array[counter]);
	}

}

async function getInitialInfoArrays(){

	
	let urlForLastStatuses = "https://backend.apexhos.com/latest_driver_statuses?";
	let getUsersRequestURL="https://backend.apexhos.com/users?";
	let getOptions = setGetOptions();
	
	let users,latest_driver_statuses;
	
	try {
    const responsesJSON = await Promise.all([		 
		 fetch(getUsersRequestURL,getOptions).then(getResponseStatus).then(jsonResponse),		 
		 fetch(urlForLastStatuses,getOptions).then(getResponseStatus).then(jsonResponse)		 
	]);
		
		
	[users,latest_driver_statuses] = responsesJSON.map(r=>{return r.data});
	
	}catch (err) {
		throw err;
	}		
	
	allUsersArray=users;
	latest_driver_statuses_array=latest_driver_statuses;	
	
}	





	
function getActiveDriversArray(){
	
		for(let counter = 0 ; counter<allUsersArray.length;counter++){
				if(allUsersArray[counter].active==true && allUsersArray[counter].role.id=="DRIVER" && allUsersArray[counter].os!=undefined){
					activeDrivers.push(allUsersArray[counter]);
				}
		}	
		
		for(let counter = 0 ; counter<allUsersArray.length;counter++){
			if(allUsersArray[counter].role.id=="DRIVER"){
				allDriversArray.push(allUsersArray[counter]);
			}
		}

}	

function createDropDownListOfActiveDrivers(){
		
		activeDrivers.sort((firstElement,secondElement)=>{
			if(firstElement.firstName>secondElement.firstName){
					return 1;
			}
			else if(firstElement.firstName<secondElement.firstName){
					return -1;
			}	
			return 0;
			
		});

		allDriversArray.sort((firstElement,secondElement)=>{
			if(firstElement.firstName>secondElement.firstName){
					return 1;
			}
			else if(firstElement.firstName<secondElement.firstName){
					return -1;
			}	
			return 0;
			
		});		

		

		for(let counter=0 ; counter<activeDrivers.length;counter++){
		
			let driverNameContainer = document.createElement("div");
			driverNameContainer.className="driverNameContainer dropdown-item";
			let icon = document.createElement("ion-icon");
			icon.name="person-circle-outline";
			let driverName = document.createElement("span");
			let connectionIndicator = document.createElement("div");
			connectionIndicator.className="driverList connection_indicator";
			let fullDriverName=activeDrivers[counter].firstName+" "+activeDrivers[counter].lastName;
			driverName.innerText=fullDriverName;			
			driverNameContainer.appendChild(icon);
			driverNameContainer.appendChild(driverName);
			driverNameContainer.appendChild(connectionIndicator);
			setConnectionIndicator(activeDrivers[counter]._id,connectionIndicator);
			
			document.querySelector(".dropdown.drivers .option").appendChild(driverNameContainer);



			 // adding to drivers list

			driverNameContainer.addEventListener('click',()=>{show(fullDriverName,activeDrivers[counter]._id);});

			
		}

		let dropdown = document.querySelector('.dropdown.drivers');		
		let dropdownDrivers  = document.querySelector('.dropdown.dropdown_drivers');


		dropdown.addEventListener("click", function(){
			document.querySelector('.dropdown.drivers').classList.toggle('active');
		});

	


	
		let dropdownInput = document.querySelector('.dropdown.drivers input');	
		
		dropdownInput.addEventListener("input",()=>{
			
			let driverList = document.querySelectorAll(".dropdown.drivers .driverNameContainer.dropdown-item");
			let inputValue = document.querySelector('.dropdown.drivers input').value;
			
			for(let counter= 0 ; counter <driverList.length; counter++){
				if(!driverList[counter].querySelector("span").innerText.toLowerCase().includes(inputValue.toLowerCase())){
					if(!driverList[counter].classList.contains("hidden")){
						driverList[counter].classList.toggle("hidden");
					}	
				}
				else{
					if(	driverList[counter].classList.contains("hidden")){
						driverList[counter].classList.remove("hidden");
					}					
				}	
			}
			
			
		});
		
}	
	
function submitAndBuild(){	
	startDate = document.getElementById("startDate").value.toString();
	endDate = document.getElementById("endDate").value.toString();	
	chartDate = new Date(new Date(startDate.replaceAll("-","/")).toLocaleString("en-US", {timeZone: "America/New_York"}));
	date_14dayAgo = new Date(new Date(startDate.replaceAll("-","/")).toLocaleString("en-US", {timeZone: "America/New_York"})).getTime()-604800000 ;
	date_14dayAgo = getFormattedDateWithDash(new Date(new Date(date_14dayAgo).toLocaleString("en-US", {timeZone: "America/New_York"})));
	
	setLastSync();
	previousEndDate=  document.getElementById('endDate').value=endDate.replaceAll("/","-");		 
	previousStartDate =   document.getElementById('startDate').value=startDate.replaceAll("/","-");
	previousUserId= userId;
	previousUserName= userName;
	document.querySelector('.driverName span').innerText=userName;
	document.querySelector('.period .startDate').innerText=previousStartDate;
	document.querySelector('.period .endDate').innerText=previousEndDate;
	
	document.querySelector(".hourInput input").value="";
	document.querySelector(".minuteInput input").value="";
	document.querySelector(".firstId input").value="";
	document.querySelector(".lastId input").value="";
	document.querySelector(".showEvents input").checked=false;
	document.querySelector(".colorizer input").checked=false;
	document.querySelector(".graph-navigator input").checked=false;
	document.querySelector(".table-navigator input").checked=false;
	
	if(document.querySelector('.graphTableContainer')!=null){
		document.querySelector('.graphTableContainer').remove();
		document.querySelector('.allPaperlog_wrapper').remove();
		previousTableDate="";
		currentTableDate="";
		previousVerticalEventName="";
		lastEventTime ="";
		durationMap.clear();
		resetPointsMap.clear();
		certificationsMap.clear();
		dailyLogSummaryMap.clear();
		fetchedDailyLogsMap.clear();
		fetchedDailyLogSummariesMap.clear();
		eventIdMap.clear();
		mapTableChart.clear();
		sortedArray.length=0;
		getUrl="https://backend.apexhos.com/hos_events?userId=%21%2A~User%3A";	
		certificationsGetUrl ="https://backend.apexhos.com/daily_logs?userId=%21%2A~User%3A"; 
		
		
		document.querySelector(".loading.filler-container .progress_bar").style.width="0%";
		document.querySelector(".loading.filler-container .progress_timer .minute_timer").innerText="";
		document.querySelector(".loading.filler-container .progress_timer .second_timer").innerText="";
		document.querySelector(".loading.filler-container .progress_indicator").innerText="";
		document.querySelector(".loading.filler-container .number_updated_events").innerText="";
		document.querySelector(".loading.filler-container .number_failed_events").innerText="";
		document.querySelector(".loading.filler-container .progress_indicator").classList.toggle("completed");
	}
	
	if(!fillRequired()){	
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



	let previousDriverName = window.localStorage.getItem("prevDriverName");
	let currentDriverName = document.querySelector(".main-content .header .driverName").innerText;
	if(previousDriverName != currentDriverName){
		document.querySelector(".navbar-footer .rollback.button").classList.toggle("disabled");
	}
	else if(document.querySelector(".navbar-footer .rollback.button").classList.contains("disabled")){
		document.querySelector(".navbar-footer .rollback.button").classList.toggle("disabled");
	}
	


	
}






function setLastSync(){
	let latestDriverStatus = latestDriverStatusesMap.get(userFullId);
	document.querySelector('.last_sync_value').value=getFormattedTime(latestDriverStatus.updatedAt);

	document.querySelector('.last_sync_value').removeEventListener("click",lastUpdatehandler);
	document.querySelector('.last_sync_value').addEventListener("click",lastUpdatehandler);
	
	
	let nowInMilleseconds = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getTime();

	document.querySelector(".connection-indicator").classList.remove("connected");
	document.querySelector(".connection-indicator").classList.remove("disconnected");
	
	if((nowInMilleseconds-latestDriverStatus.updatedAt)<1200000 ){
		
		if(latestDriverStatus.ec==true){			
				document.querySelector(".connection-indicator").classList.toggle("connected");
		}
		else{	
			document.querySelector(".connection-indicator").classList.toggle("disconnected");							
		}	
	}
	else{
			document.querySelector(".connection-indicator").classList.remove("connected");
			document.querySelector(".connection-indicator").classList.remove("disconnected");
	}
}	





function setConnectionIndicator(userId,indicator_container){
	
	let latestDriverStatus = latestDriverStatusesMap.get(userId);
	
	let nowInMilleseconds = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getTime();

	indicator_container.classList.remove("connected");
	indicator_container.classList.remove("disconnected");
	
	if((nowInMilleseconds-latestDriverStatus.updatedAt)<1200000 ){
		
		if(latestDriverStatus.ec==true){			
				indicator_container.classList.toggle("connected");
		}
		else{	
			indicator_container.classList.toggle("disconnected");							
		}	
	}
	else{
			indicator_container.classList.remove("connected");
			indicator_container.classList.remove("disconnected");
	}
	
	
	
}




async function tableInfoBuilder(){ 
	

	

	getRequestOptions = setGetOptions();	
	
	// fetching all requests at once 
	
	await fetchAll();
	

	
	for(let counter = 0 ; counter<certificationsArray.length;counter++){
		certificationsMap.set(certificationsArray[counter].logDate.date,certificationsArray[counter]);
	}
	
	for(let counter=0; counter<dailyLogSummaryArray.length;counter++){
		dailyLogSummaryMap.set(dailyLogSummaryArray[counter].logDate.date,dailyLogSummaryArray[counter]);			
	}
	
	dataArray.sort(compare);
	
	removeInactiveChanged(dataArray);  // creates new sortedArray
	
	
	//////////// get infos && fill info arrays and Maps
	durationMap=fillAndGetDurationMap(sortedArray); 
	
	
	
	
	
	
	createContainers();
	createNewTable(); // creates new Table with wrapper no head
	
	
	
	
	
	
	if(previousEvent!=undefined){
		tableBodyBuilder(previousEvent,-1); // construct previousDaylog
		dataArray.unshift(previousEvent); //adds element to the beginning of the dataArray 
		
	}
	else{
		tableBodyBuilder(previousEvent,-2);   // if no previouisDaylog
			
	}
	
	eventIdMap = new Map();
	
	
	for(let counter =0 ; counter <dataArray.length;counter++){
		
		eventIdMap.set(dataArray[counter]._id,dataArray[counter]);
		
	}	
	
	
	for(let tableRows = 0 ; tableRows<sortedArray.length;tableRows++){				
		tableBodyBuilder(sortedArray[tableRows],tableRows);
		
	}	
	
	
	let charts = document.querySelectorAll('.chartWrapper');
	
	
	
	for(let counter = 0 ; counter < charts.length;counter++){
		
		let chartKey = charts[counter].parentElement;	
		let tableBody = mapTableChart.get(chartKey);
		
		chartBuilder(charts[counter].querySelector('.statusWrapper'),tableBody,counter);
	
	}
	
	
	//linking certifications with events 
	
	for(let counter = 0 ; counter < charts.length; counter++){
		
		let chartKey = charts[counter].parentElement;	
		let tableBody = mapTableChart.get(chartKey);
		eventCertificationLinker(charts[counter].querySelector('.statusWrapper'),tableBody);
	}
	
	buildShiftCalculator();
	buildPaperVersion();
	setLogVersions();
	
	
	
	
	// header part 
	if(numberOfUpdates<1){
		fillHeader();
		fillFooter();
		numberOfUpdates++;
	}
	
	errorIdentifier(sortedArray);
	
	
	
	document.querySelector('div.spinner').style.display="none"; // deactivate spinner
	document.querySelector(".main-content").style.display="block";
	document.querySelector(".sidebar").style.display="block";
	document.querySelector(".allGraphWrapper").scrollLeft=document.querySelector(".allGraphWrapper").scrollWidth;

	console.log("end");
}



function eventCertificationLinker(statusWrapper,tableBody){
	
	let shippingDocs = [];
	let trailerNumbers = [];
	let signatureFile = statusWrapper.querySelector(".signatureFileName").innerText;
	let certificationDate = statusWrapper.querySelector(".dayStarterHiddenValueContainer").innerText;
	
	let formDocs = { bols : shippingDocs, trailers : trailerNumbers , signature : signatureFile , formDate : certificationDate};
	
	for(let counter = 0 ; counter <tableBody.rows.length;counter++){
		
		shippingDocs = new Array();
		trailerNumbers = new Array();
		let eventID = tableBody.rows[counter].cells[1].querySelector('span').className;
		let eventName = tableBody.rows[counter].cells[1].innerText;
		
		let eventLinkedCertification = certificationsMap.get(certificationDate);
		if(eventLinkedCertification!=undefined){
			for(let counter = 0 ; counter <eventLinkedCertification.form.shippingDocuments.length; counter++){
				shippingDocs.push(eventLinkedCertification.form.shippingDocuments[counter]);				
			}
			for(let counter = 0 ; counter<eventLinkedCertification.form.trailers.length; counter++){
				trailerNumbers.push(eventLinkedCertification.form.trailers[counter]);
			}	
		}
		
		formDocs.bols=shippingDocs;
		formDocs.trailers=trailerNumbers;
		if(!eventName.includes("Certification")){
			event_CertificationMap.set(eventID,formDocs);
		}
		
		
	}	
	

}






function loginRequired(){

	const login = document.querySelector('.inputs .login input').value.toString();
	const companyPassword = document.querySelector('.inputs .password input').value.toString();
	const companyName = document.querySelector(".dropdown.company input").value.toString();
	if(login=="" || companyPassword=="" || companyName==""){
		return true;
	}
	return false;

}






									/*  funtions    */
	
function fillRequired(){
		const inputDriverName = document.querySelector('.dropdown input.textBox').value.toString();			
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
		const dateWithSlashes = [year, month, day].join('/');		
		return dateWithSlashes;	
}
function getFormattedDateWithDash(date){	
		const year = date.getFullYear();
		const month = padTo2Digits(date.getMonth() + 1);
		const day = padTo2Digits(date.getDate());
		const dateWithSlashes = [year, month, day].join('-');		
		return dateWithSlashes;	
}




function show(name,id){
		document.querySelector('.dropdown.drivers .textBox').value=name;
		if(document.querySelector('div.dropdown span ion-icon')!=null){
			document.querySelector('div.dropdown span ion-icon').remove();	
		}	
		 userFullId=id;
		 userId = setUserId(id);
		 userName=name;
		
}

function showBottomdDriverName(name,id){
		document.querySelector('.dropdown.dropdown_drivers .driverName_input').value=name;		
		userReassignId = id;		
		
}



		
function setCompany(name){	

		document.querySelector('.dropdown.company .textBox').value=name;
		if(document.querySelector('div.dropdown span ion-icon')!=null){
			document.querySelector('div.dropdown span ion-icon').remove();	
		}	
		if(name=="AJ TRANSPORTATION INC"){
			companyName="Company:RU7OoXRkW4";
		}	
		if(name=="METRS TRUCKING LLC"){
			companyName="Company:OKXECoBNXg";
		}
		if(name=="KELSEY EXPRESS"){
			companyName="Company:cwqji9YjKP";
		}	
		if(name=="VITAEX INC"){
			companyName="Company:m1mjo_lpWO";
		}	
		
}		
		
		
		
		
function setUserId(id){		
	return id.substr(id.toString().search("User:")+5);	
}	
	
	
		
function setGetUrl(startingDate, lastDate){	
	startingDate=startingDate.replaceAll("-","%2F");
	lastDate=lastDate.replaceAll("-","%2F");
	let day14ago = date_14dayAgo.replaceAll("-","%2F");
	getUrl=getUrl+userId+"&eventTime.logDate.date%5B%24gte%5D="+startingDate+"&eventTime.logDate.date%5B%24lte%5D="+lastDate;	
	certificationsGetUrl=certificationsGetUrl+userId+"&logDate.date%5B%24gte%5D="+startingDate+"&logDate.date%5B%24lte%5D="+lastDate;
	getUrlForDailyLogSummaries="https://backend.apexhos.com/daily_log_summaries?&%24sort%5B0%7Ctype.id%5D=-1&%24sort%5B1%7CcompanyId%5D=-1&%24sort%5B2%7CuserId%5D=-1&%24sort%5B3%7ClogDate.date%5D=-1&userId=%21%2A~User%3A"+userId+"&logDate.date%5B%24gte%5D="+day14ago+"&logDate.date%5B%24lte%5D="+lastDate;
	
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
	else if(firstObjectTimeStamp==secondObjectTimeStamp){
			if((firstObj.eventCode.id=="DR_IND_PC" && secondObj.eventCode.id=="DS_OFF") || (firstObj.eventCode.id=="DR_IND_YM" && secondObj.eventCode.id=="DS_ON") ){
				return 1;
			}
			else if((firstObj.eventCode.id=="DS_OFF" && secondObj.eventCode.id=="DR_IND_PC") || (firstObj.eventCode.id=="DS_ON" && secondObj.eventCode.id=="DR_IND_YM")){
				return -1;
			}
			else if(getEventName(firstObj.eventCode.id,firstObj)>getEventName(secondObj.eventCode.id,secondObj)){
				return 1;
			}
			else if(getEventName(firstObj.eventCode.id,firstObj)<getEventName(secondObj.eventCode.id,secondObj)){
				return -1;
			}
			return 0;
	}

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
	
		
		let stringArray = ["Start Time (EST)","Event","Duration","Status","Location","Origin","Odometer","Engine Hours","ID","Update Status","Checkbox","Edit"];
		tableHead = document.createElement('thead');
		
		let tableHeadRow =document.createElement('tr');
		tableHeadRow = tableHead.appendChild(tableHeadRow);
		for(let counter =0 ; counter < stringArray.length; counter++){
			
			let tableHeadCell=document.createElement('th');			
			let tableHeadCellValue=document.createTextNode(stringArray[counter]);					
			tableHeadCell.appendChild(tableHeadCellValue);						
			tableHeadRow.appendChild(tableHeadCell);
			if(stringArray[counter]=="Checkbox"){
				tableHeadCell.className='shiftingCheckBoxContainer';
				let checkBox = document.createElement('input');
				checkBox.type='checkbox';
				tableHeadCell.appendChild(checkBox);
				checkBox.checked=true;
				checkBox.addEventListener('click',()=>{
					
					if(checkBox.checked){
						document.querySelectorAll(".pickedOrNot").forEach((el)=>{
							if(!el.checked){
								el.click();
							}	
						});
					}
					else{
						document.querySelectorAll(".pickedOrNot").forEach((el)=>{
							if(el.checked){
								el.click();
							}	
						});	
					}
				});
			}	
			
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
	
	let mainEventsContainer = document.createElement('div');
	mainEventsContainer.className="mainEventsContainer";
	let mainEventsWrapper = document.createElement('div');
	mainEventsWrapper.className="mainEventsWrapper";
	let mainEventInnerContainer =  document.createElement('span');
	mainEventInnerContainer.innerText="OFF";
	mainEventsWrapper.appendChild(mainEventInnerContainer);
	
	mainEventInnerContainer=document.createElement('span');
	mainEventInnerContainer.innerText="SB";
	mainEventsWrapper.appendChild(mainEventInnerContainer);
	
	mainEventInnerContainer=document.createElement('span');
	mainEventInnerContainer.innerText="DR";
	mainEventsWrapper.appendChild(mainEventInnerContainer);
	
	mainEventInnerContainer=document.createElement('span');
	mainEventInnerContainer.innerText="ON";
	mainEventsWrapper.appendChild(mainEventInnerContainer);
	
	mainEventsContainer.appendChild(mainEventsWrapper);
	
	
	let mainEventsDurationContainer = document.createElement('div');
	mainEventsDurationContainer.className="mainEventsDurationContainer";
	let mainEventsDurationWrapper = document.createElement('div');
	mainEventsDurationWrapper.className="mainEventsDurationWrapper";
	
	let mainEventsDurationInnerContainer =  document.createElement('span');
	mainEventsDurationInnerContainer.className="totalOffDuty";
	mainEventsDurationInnerContainer.innerText="---";
	mainEventsDurationWrapper.appendChild(mainEventsDurationInnerContainer);
	
	mainEventsDurationInnerContainer=document.createElement('span');
	mainEventsDurationInnerContainer.className="totalSleeper";
	mainEventsDurationInnerContainer.innerText="---";
	mainEventsDurationWrapper.appendChild(mainEventsDurationInnerContainer);
	
	mainEventsDurationInnerContainer=document.createElement('span');
	mainEventsDurationInnerContainer.className="totalDriving";
	mainEventsDurationInnerContainer.innerText="---";
	mainEventsDurationWrapper.appendChild(mainEventsDurationInnerContainer);
	
	mainEventsDurationInnerContainer=document.createElement('span');
	mainEventsDurationInnerContainer.className="totalOnDuty";
	mainEventsDurationInnerContainer.innerText="---";
	mainEventsDurationWrapper.appendChild(mainEventsDurationInnerContainer);
	
	mainEventsDurationContainer.appendChild(mainEventsDurationWrapper);
		
	
	allGraphContainer.appendChild(mainEventsContainer);
	allGraphContainer.appendChild(allGraphWrapper);
	allGraphContainer.appendChild(mainEventsDurationContainer);


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
		let emptyDays;
		
		if(row+1==sortedArray.length){
			emptyDays = getEmptyDays(infoArray.eventTime.timestamp,row,"before");	
		}
		else{
		    emptyDays = getEmptyDays(infoArray.eventTime.timestamp,row,"");	
		}
		
		if(row == -2){			  // if there is no previousDayLog
				createTableHead();			
		}	
		
		
		if(row==-1){                      // creating top content
			
				createTableHead();	
				createNewTableBody();	
				chart=createGraphContainer();
				mapTableChart.set(chart,tableBody);	
		}		
		
		if(row==0){			// second row after the previous element
			createNew = false;		
		
			for(let counter = 0 ; counter <emptyDays;counter++){
				
				createNewTableBody();	
				chart = createGraphContainer();
				mapTableChart.set(chart,tableBody);					
			}			
		}	
	
		if(createNew==true && row!=-1 && row!=0){	 // middle rows 									

			for(let counter = 0 ; counter <emptyDays;counter++){
				
				createNewTableBody();	
				chart = createGraphContainer();
				mapTableChart.set(chart,tableBody);					
			}
			
			
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
		tableBodyCell.className="width-190px eventName ";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyEventNameValue = document.createTextNode(getEventName(infoArray.eventCode.id,infoArray));
		tableBodyCellSpanContainer.className=infoArray._id;
		tableBodyCell.className+=getEventName(infoArray.eventCode.id,infoArray).replace(/\s+/g, '');
		
		if(getEventName(infoArray.eventCode.id,infoArray)!="Off Duty" && getEventName(infoArray.eventCode.id,infoArray)!="On Duty" && getEventName(infoArray.eventCode.id,infoArray)!="Sleeper" && getEventName(infoArray.eventCode.id,infoArray)!="Intermediate w/ CLP" && getEventName(infoArray.eventCode.id,infoArray)!="Driving"){
			
			tableBodyCell.classList.toggle("secondaryEvent");
		}
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
		tableBodyCell.className="width-300px";
		tableBodyCellSpanContainer = document.createElement('span');
		let tableBodyLocationValue = document.createTextNode((infoArray.location!=undefined)? infoArray.location.calculatedLocation : "");
		tableBodyCell.appendChild(tableBodyCellSpanContainer);		
		tableBodyCellSpanContainer.appendChild(tableBodyLocationValue);
		

		
		if(infoArray.location!=undefined){
			if(infoArray.location.lat!=undefined &&  infoArray.location.lon!=undefined){
				let copySymbol = document.createElement('img');
				copySymbol.src="icons/copySymbol.png";	
				copySymbol.className="copySymbol";
				tableBodyCell.appendChild(copySymbol);
				
				let clipboardContainer = document.createElement('div');
				clipboardContainer.className="clipboardContainer";
				
				let lonLatContainer = document.createElement('div');
				lonLatContainer.innerText=infoArray.location.lat+" "+infoArray.location.lon;
				lonLatContainer.className="latLonInfo";
				lonLatContainer.style.display="none";
				
				
				let copied = document.createElement('div');
				copied.className="copiedText";
				copied.innerText="Copied";
				
				
				clipboardContainer.appendChild(lonLatContainer);
				clipboardContainer.append(copied);
				tableBodyCell.appendChild(clipboardContainer);
				
				
				copySymbol.addEventListener("click",(event)=>{		
					
					let value = event.target.parentElement.querySelector(".latLonInfo").innerText;
					event.target.parentElement.querySelector(".copiedText").style.display="block";
					navigator.clipboard.writeText(value);				
					setTimeout(()=>{event.target.parentElement.querySelector(".copiedText").style.display="none";},1000);
					
				});	
			}	
		}
		
		
		
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

		
		//Update status
		
		tableBodyCell = tableBodyRow.insertCell();	
		tableBodyCellSpanContainer = document.createElement('div');
		tableBodyCell.appendChild(tableBodyCellSpanContainer);	
		tableBodyCellSpanContainer.className="status";
		let pendingString = document.createTextNode("Pending");
	
		
		let spanDotContainer1 = document.createElement("span");
		spanDotContainer1.className="status__dot";		
		let spanDotContainer2 = document.createElement("span");
		spanDotContainer2.className="status__dot";
		let spanDotContainer3 = document.createElement("span");
		spanDotContainer3.className="status__dot";
		spanDotContainer1.innerText=".";
		spanDotContainer2.innerText=".";
		spanDotContainer3.innerText=".";	
		tableBodyCellSpanContainer.appendChild(pendingString);
		tableBodyCellSpanContainer.appendChild(spanDotContainer1);
		tableBodyCellSpanContainer.appendChild(spanDotContainer2);
		tableBodyCellSpanContainer.appendChild(spanDotContainer3);
		
		
		
		//tick 
		tableBodyCell = tableBodyRow.insertCell();	
		tableBodyCell.className="width-50px";
		tableBodyCellSpanContainer = document.createElement('span');
		tableBodyCellSpanContainer.className="shiftingCheckBoxContainer";
		let checkBox = document.createElement('input');
		checkBox.type='checkbox';	
		checkBox.className='pickedOrNot';
		
		tableBodyCellSpanContainer.appendChild(checkBox);
		tableBodyCell.appendChild(tableBodyCellSpanContainer);
		
		if(infoArray.i!=undefined){
			checkBox.classList.toggle("downloaded");
		}

		checkBox.addEventListener("click",()=>{
			if(checkBox.checked){
				if(!checkBox.classList.contains("picked")){
					checkBox.classList.toggle("picked");
				}
			}else{
				if(checkBox.classList.contains("picked")){
					checkBox.classList.toggle("picked");
				}
			}
			document.querySelector(".number_selected_events.progress_value").innerText=document.querySelectorAll(".shiftingCheckBoxContainer .pickedOrNot.picked").length;
			document.querySelector(".number_downloaded_events.progress_value").innerText=document.querySelectorAll(".shiftingCheckBoxContainer .pickedOrNot.picked.downloaded").length;

		});

		if(infoArray.eventCode.id.includes("CERT")){
				
			tableBodyRow.cells[9].querySelector(".status").style.animationName="fadeIn";
			if(checkBox.checked){
				checkBox.click();
			}
		}
		else{
			if(!checkBox.checked){
				checkBox.click();
			}
		}
		

			
		tableBodyCellSpanContainer.querySelector('input').addEventListener('click',()=>{	
				
				if(event.target.checked){
					tableBodyCell.parentElement.cells[9].querySelector('.status').style.animationName='fadeInStatus';
					
				}	
				else{
					tableBodyCell.parentElement.cells[9].querySelector('.status').style.animationName='fadeIn';		
				}	
			
		});
		let eventCode ;
		let horizontalOffset;
		tableBodyRow.addEventListener("mouseenter",()=>{
				eventCode=tableBodyRow.cells[1].querySelector('span').className;
				if(document.getElementById(eventCode)!=null && tableBodyRow.cells[1].innerText !="Intermediate w/ CLP" && !tableBodyRow.cells[1].className.includes("secondaryEvent")){
					
					document.getElementById(eventCode).style.opacity="1";
					document.getElementById(eventCode).querySelector(".logDuration").style.display="block";		
					
				}	
				
				if(tableBodyRow.cells[1].innerText=="Intermediate w/ CLP"){
					document.getElementById(eventCode).classList.toggle("hovered");
				}
				
				if(tableBodyRow.cells[1].className.includes("secondaryEvent")){
					document.getElementById(eventCode).querySelector("div").classList.toggle("visible");
				}
				if(document.querySelector('.graph-nav').checked && !tableBodyRow.cells[1].className.includes("secondaryEvent")){					
					horizontalOffset=document.getElementById(eventCode).offsetLeft+document.getElementById(eventCode).parentElement.parentElement.parentElement.parentElement.offsetLeft-650;
					document.querySelector('.allGraphWrapper').scrollTo({ top: 0,left: horizontalOffset,behavior: 'smooth'});
				}
				else if(tableBodyRow.cells[1].className.includes("secondaryEvent") && document.querySelector(".showEvents input").checked && document.querySelector('.graph-nav').checked){
					horizontalOffset=document.getElementById(eventCode).offsetLeft+document.getElementById(eventCode).parentElement.parentElement.parentElement.parentElement.offsetLeft-650;
					document.querySelector('.allGraphWrapper').scrollTo({ top: 0,left: horizontalOffset,behavior: 'smooth'});
				}	

				
		});
		tableBodyRow.addEventListener("mouseleave",()=>{
			if(document.getElementById(eventCode)!=null){
				if(tableBodyRow.cells[1].innerText!="Intermediate w/ CLP" && !tableBodyRow.cells[1].className.includes("secondaryEvent")){
					document.getElementById(eventCode).style.opacity="0";
					document.getElementById(eventCode).querySelector(".logDuration").style.display="none";
				}
				else if(tableBodyRow.cells[1].innerText == "Intermediate w/ CLP"){
					document.getElementById(eventCode).classList.toggle("hovered");
				}
				else if(tableBodyRow.cells[1].className.includes("secondaryEvent")){
					document.getElementById(eventCode).querySelector("div").classList.toggle("visible");
				}	
			}
		});	
		
		
		// edit pen
		
		tableBodyCell = tableBodyRow.insertCell();	
		tableBodyCell.className="width-50px";
		tableBodyCellSpanContainer = document.createElement('span');
		tableBodyCellSpanContainer.className="editPenContainer pens";
		let pen = document.createElement('ion-icon');
		pen.name="pencil-outline";
		let downloadedPen = document.createElement("img");
		downloadedPen.src="icons/lock.png";

		if(infoArray.i==undefined){
			tableBodyCellSpanContainer.appendChild(pen);
		}
		else{
			tableBodyCellSpanContainer.appendChild(downloadedPen);
			tableBodyCellSpanContainer.classList.toggle("downloaded");
		}
		tableBodyCell.appendChild(tableBodyCellSpanContainer);
		
		pen.addEventListener('click',()=>{
			
			buildEventForm(event.target.parentElement.parentElement.parentElement);
			
		});	
		
		let editForm = document.querySelector(".edit_form_container");
		
	
		
		
		if(row+1==sortedArray.length){			
			 emptyDays = getEmptyDays(infoArray.eventTime.timestamp,row,"after");	
				
			
				for(let counter = 0 ; counter <emptyDays;counter++){
						
					createNewTableBody();	
					chart = createGraphContainer();
					mapTableChart.set(chart,tableBody);					
				}
		}
			
		
			
}


function buildEventForm(row){
	
	let eventCode=row.cells[1].querySelector("span").className;
	let eventItem = eventIdMap.get(eventCode);
	let userId = eventItem.updatedBy;
	let userObject = allUsersMap.get(userId);
	let lastEditTime = getFormattedTime(eventItem.updatedAt);
	
	if(eventItem.seqId!=null){
		document.querySelector(".id_value input").value=parseInt(eventItem.seqId,16);
	}
	else{
		document.querySelector(".id_value input").value="";
	}



	if(eventItem.totalVehicleMiles!=null){
	
		document.querySelector(".odometer_value input").value=eventItem.totalVehicleMiles;
	}
	else{
		document.querySelector(".odometer_value input").value="";			
	}	
	
	if(eventItem.totalEngineHours!=null){
	
		document.querySelector(".engine_hours_value input").value=eventItem.totalEngineHours;
	}
	else{
		document.querySelector(".engine_hours_value input").value="";			
	}
	
	
	if(userObject!=null){
		document.querySelector(".updatedBy_value input").value = userObject.firstName+" "+userObject.lastName;
	}
	else{
		document.querySelector(".updatedBy_value input").value ="";
	}	
	if(userId=="User:JRs5OwoyR"){
		document.querySelector(".updatedBy_value input").value = "Justin Cage";	
	}	
	
	
	if(lastEditTime!=null){
			document.querySelector(".updatedAt_value input").value = lastEditTime;
	}	


	document.querySelector(".edit_form_container").classList.toggle("focused");

}




function chartBuilder(statusWrapper,tableBody,numberOfWrappers){
	
	
	
	buildFormAndMannerField(statusWrapper,tableBody);
	fillFormAndMannerField(statusWrapper);
	buildDayStarters(statusWrapper,tableBody);
	//buildPointer(statusWrapper);
    buildResets(statusWrapper,tableBody);
	buildIntermediates(statusWrapper,tableBody);
	buildLogins(statusWrapper,tableBody);
	buildPowerUps(statusWrapper,tableBody);
	buildCertifications(statusWrapper,tableBody);
	buildLogDurations(statusWrapper,tableBody,numberOfWrappers);
	buildVerticals(statusWrapper,tableBody);
	buildPeriods(statusWrapper,tableBody,numberOfWrappers);
	buildMalfunctions(statusWrapper,tableBody);

}

function buildFormAndMannerField(statusWrapper,tableBody){
	
	let formContainer = document.createElement("div");
	formContainer.className="formContainer";
	
	let trailerNumbers = document.createElement("div");
	trailerNumbers.className="trailerNumbers form";
	let labelTrailerNumbers = document.createElement("span");
	labelTrailerNumbers.className="labelTrailerNumbers formLabel";
	
	let trailerNumberValueContainer = document.createElement("span");
	trailerNumberValueContainer.className="trailerNumberValue formValue";
	
	labelTrailerNumbers.innerText="Trailers";
	trailerNumbers.appendChild(labelTrailerNumbers);
	trailerNumbers.appendChild(trailerNumberValueContainer);
	
	let shippingDocs = document.createElement("div");
	shippingDocs.className="shippingDocuments form";
	let labelShippingDocs = document.createElement("span");
	labelShippingDocs.className="labelShippingDocs formLabel";
	
	let shippingDocsValueContainer = document.createElement("span");
	shippingDocsValueContainer.className="shippingDocsValue formValue";
	
	labelShippingDocs.innerText="Shipping Documents";
	shippingDocs.appendChild(labelShippingDocs);
	shippingDocs.appendChild(shippingDocsValueContainer);
	
	let coDriver = document.createElement("div");
	coDriver.className="coDriver form";
	let labelCoDriver = document.createElement("span");
	labelCoDriver.className="labelCoDriver formLabel";
	
	let coDriverValueContainer = document.createElement("span");
	coDriverValueContainer.className="coDriverValue formValue";
	
	labelCoDriver.innerText="Co-Driver";
	coDriver.appendChild(labelCoDriver);
	coDriver.appendChild(coDriverValueContainer);
	
	let signatureContainer = document.createElement("div");
	signatureContainer.className="signatureContainer form";
	
	let signatrueLabel = document.createElement("span");
	signatrueLabel.innerText="Signature File";
	signatrueLabel.className="signatureLabel formLabel";
	
	let signatureImgContainer = document.createElement("div");
	signatureImgContainer.className="signatureImgContainer";
	
	let signatureImg = document.createElement("img");
	signatureImg.className="signatureImg";
	signatureImgContainer.appendChild(signatureImg);
	
	let signatureFileName = document.createElement("div");
	signatureFileName.className="signatureFileName";
	
	let copied = document.createElement('div');
	copied.className="copiedText";
	copied.innerText="Copied";
	
	let clipboardContainer = document.createElement('div');
	clipboardContainer.className="clipboardContainer";
	
	clipboardContainer.appendChild(copied);
	
	
	signatureContainer.appendChild(clipboardContainer);
	signatureContainer.appendChild(signatureImgContainer);
	signatureContainer.appendChild(signatureFileName);
	signatureContainer.appendChild(signatrueLabel);
	
	formContainer.appendChild(trailerNumbers);
	formContainer.appendChild(shippingDocs);
	formContainer.appendChild(coDriver);
	formContainer.appendChild(signatureContainer);
	
	statusWrapper.appendChild(formContainer);

	
}

function fillFormAndMannerField(statusWrapper){
	
	let keyDate = getFormattedDate(chartDate);
	
	let trailerNumberField = statusWrapper.querySelector(".formContainer .trailerNumbers .trailerNumberValue");
	let shippingDocsField = statusWrapper.querySelector(".formContainer .shippingDocuments .shippingDocsValue");
	let coDriverField = statusWrapper.querySelector(".formContainer .coDriver .coDriverValue");
	let signatureField = statusWrapper.querySelector(".formContainer .signatureContainer .signatureFileName");

	let chartDateFormObject = certificationsMap.get(keyDate);
	
	if(chartDateFormObject!=undefined){
		if(chartDateFormObject.form.trailers!=null){
			for(const trailerNumber of chartDateFormObject.form.shippingDocuments){
				shippingDocsField.innerText+=trailerNumber+" ";
			}
		}		
	}
	else{
		shippingDocsField.innerText="Not Filled Yet";
	}	
	
	if(chartDateFormObject!=undefined){
		if(chartDateFormObject.form.shippingDocuments!=null){
			for(const shippingDoc of chartDateFormObject.form.trailers){
				trailerNumberField.innerText+=shippingDoc+" ";
			}
		}		
	}
	else{
		trailerNumberField.innerText="Not Filled Yet";
	}	
	
	if(chartDateFormObject!=undefined){
		if(chartDateFormObject.form.coDriver!=null){		
			coDriverField.innerText=chartDateFormObject.form.coDriver.firstName+" "+chartDateFormObject.form.coDriver.lastName;			
		}		
	}
	else{
		coDriverField.innerText="";
	}	
	
	
	
	
	if(chartDateFormObject!=undefined){
		if(chartDateFormObject.form.signature!=null){
			let signatureFileString = chartDateFormObject.form.signature;
			signatureField.innerText=chartDateFormObject.form.signature;
			statusWrapper.querySelector(".formContainer .signatureContainer img").src="https://s3.amazonaws.com/hos247-user-files/user_files/Company_RU7OoXRkW4/"+signatureFileString.substring(0,signatureFileString.indexOf("sig")-1)+"/"+chartDateFormObject.form.signature;
							
			
			signatureField.addEventListener("click",(event)=>{		
				
				let value = event.target.innerText;
				event.target.parentElement.querySelector(".copiedText").style.display="block";
				navigator.clipboard.writeText(value);				
				setTimeout(()=>{event.target.parentElement.querySelector(".copiedText").style.display="none";},1000);
				
			});	
			
			
			
		}
		else{
			signatureField.innerText="Not Signed";	
		}	
	}
    else{
		signatureField.innerText="Not Signed";
	}
	
	
	
	
	

}



function buildDayStarters(statusWrapper,tableBody){
	
	let changeInMilleseconds = checkIfDSTChange(chartDate);
 	let dayStarterContainer = document.createElement("div");
	dayStarterContainer.className="dayStarterContainer";
	let dayStarterWrapper  = document.createElement("div");
	dayStarterWrapper.className="dayStarterWrapper";
	let dayStarterHiddenValueContainer = document.createElement("span");
	dayStarterHiddenValueContainer.className="dayStarterHiddenValueContainer";
	dayStarterHiddenValueContainer.innerText=getFormattedDate(chartDate);
	let month = chartDate.toLocaleString('default', { month: 'short' });
	let dayStarterValue= document.createTextNode(month +" "+chartDate.getDate());
	dayStarterContainer.appendChild(dayStarterHiddenValueContainer);
	dayStarterContainer.appendChild(dayStarterWrapper);
	dayStarterWrapper.appendChild(dayStarterValue);
	statusWrapper.appendChild(dayStarterContainer);	
	if(changeInMilleseconds!=0){
		chartDate=chartDate.getTime()+86400000+changeInMilleseconds;
	}
	else{
		chartDate=chartDate.getTime()+86400000;
	}	
	chartDate=new Date(chartDate);
	

	
}

function checkIfDSTChange(date){
	let upcomingDate = new Date((new Date(date.getTime()+86400000)).toLocaleString("en-US", {timeZone: "America/New_York"}));
	let differenceInTimeZone = upcomingDate.getTimezoneOffset()-date.getTimezoneOffset();
	let millesecondsDifference = differenceInTimeZone*60*1000;
	return millesecondsDifference;	

}

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
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
	/*	statusWrapper.onmousemove = function(){
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
			
	*/


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
		let backgroundColor ;
		if(eventName=="Intermediate w/ CLP"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let intermediatePoint = document.createElement("div");
			intermediatePoint.className="intermediate";
			intermediatePoint.id=eventCode;
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
			backgroundColor=tableBody.rows[counter].style.background;	
			
			intermediatePoint.addEventListener("mouseenter",()=>{				
				tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";		
				
				if(document.querySelector('.table-nav').checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}			
			});	
			
			intermediatePoint.addEventListener("mouseleave",()=>{
				tableBody.rows[counter].style.backgroundColor=backgroundColor;
			});
		}
	}
}


function buildLogins(statusWrapper,tableBody){
	
	for(let counter= 0 ; counter<tableBody.rows.length;counter++){
			
		let eventName = tableBody.rows[counter].cells[1].innerText;
		let backgroundColor ;
		if(eventName=="Login"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			
			let loginPoint = document.createElement("div");
			loginPoint.className="login secondaryEvents";
			loginPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			loginPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let loginTime = document.createElement("div");
			loginTime.className="loginTime";
			let loginTimeValue = tableBody.rows[counter].cells[0].innerText;
			loginTimeValue=loginTimeValue.substring(loginTimeValue.indexOf(",")+1);
			loginTime.innerText=loginTimeValue;
			loginPoint.appendChild(loginTime);
			
			let loginSymbol = document.createElement("span");
			loginSymbol.className="loginSymbol";
			let symbol = document.createElement("ion-icon");
			symbol.name="log-in-outline";			
			loginSymbol.appendChild(symbol);
			loginPoint.appendChild(loginSymbol);		
			statusWrapper.appendChild(loginPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			loginSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .login_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .login_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			});	
			loginSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .login_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				
			
			});	
			
		}
		if(eventName=="Logout"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let logoutPoint = document.createElement("div");
			logoutPoint.className="logout secondaryEvents";
			logoutPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			logoutPoint.style.left="calc("+(position*100-0.1)+"%)";
			
			let logoutTime = document.createElement("div");
			logoutTime.className="logoutTime";
			let logoutTimeValue = tableBody.rows[counter].cells[0].innerText;
			logoutTimeValue=logoutTimeValue.substring(logoutTimeValue.indexOf(",")+1);
			logoutTime.innerText=logoutTimeValue;
			logoutPoint.appendChild(logoutTime);
			
			let logoutSymbol = document.createElement("span");
			logoutSymbol.className="loginSymbol";
			let symbol = document.createElement("ion-icon");
			symbol.name="log-out-outline";			
			logoutSymbol.appendChild(symbol);
			logoutPoint.appendChild(logoutSymbol);		
			statusWrapper.appendChild(logoutPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			logoutSymbol.addEventListener("mouseenter",()=>{				
			
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .logout_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .logout_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});	
			logoutSymbol.addEventListener("mouseleave",()=>{				
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .logout_checkbox").checked){
					event.target.parentElement.querySelector('div').classList.toggle('visible');
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
				}

							
			});	
			
			
			
		}	
	}
}

function buildPowerUps(statusWrapper,tableBody){

	for(let counter= 0 ; counter<tableBody.rows.length;counter++){
			
		let eventName = tableBody.rows[counter].cells[1].innerText;
		let backgroundColor ;
		
		
		if(eventName=="Engine Power-up w/ CLP"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let powerUpPoint = document.createElement("div");
			powerUpPoint.className="powerUp secondaryEvents";
			powerUpPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			powerUpPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let powerUpTime = document.createElement("div");
			powerUpTime.className="powerUpTime";
			let powerUpTimeValue = tableBody.rows[counter].cells[0].innerText;
			powerUpTimeValue=powerUpTimeValue.substring(powerUpTimeValue.indexOf(",")+1);
			powerUpTime.innerText=powerUpTimeValue;
			powerUpPoint.appendChild(powerUpTime);
			
			
			
			let powerUpSymbol = document.createElement("span");
			powerUpSymbol.className="powerUpSymbol";
			let symbol = document.createElement("ion-icon");
			symbol.name="key-outline";			
			powerUpSymbol.appendChild(symbol);
			powerUpPoint.appendChild(powerUpSymbol);		
			statusWrapper.appendChild(powerUpPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			powerUpSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOn_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOn_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});
			powerUpSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOn_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});	
			
			
			
		}
		
		if(eventName=="Engine Shut-down w/ CLP"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let shutDownPoint = document.createElement("div");
			shutDownPoint.className="shutDown secondaryEvents";
			shutDownPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			shutDownPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let shutDownTime = document.createElement("div");
			shutDownTime.className="shutDownTime";
			let shutDownTimeValue = tableBody.rows[counter].cells[0].innerText;
			shutDownTimeValue=shutDownTimeValue.substring(shutDownTimeValue.indexOf(",")+1);
			shutDownTime.innerText=shutDownTimeValue;
			shutDownPoint.appendChild(shutDownTime);
			
			
			let shutDownSymbol = document.createElement("span");
			shutDownSymbol.className="shutDownSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/not-working.png";			
			shutDownSymbol.appendChild(symbol);
			shutDownPoint.appendChild(shutDownSymbol);		
			statusWrapper.appendChild(shutDownPoint);		
			backgroundColor=tableBody.rows[counter].style.background;
			
			shutDownSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOff_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}	
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOff_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}				
			});	
			shutDownSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineOff_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});	
			
			
			
		}	
	}


}

function buildCertifications(statusWrapper,tableBody){

	for(let counter= 0 ; counter<tableBody.rows.length;counter++){
			
		let eventName = tableBody.rows[counter].cells[1].innerText;
		if(eventName.includes("Certification")){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let certificationPoint = document.createElement("div");
			certificationPoint.className="certification secondaryEvents";
			certificationPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			certificationPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let certificationTime = document.createElement("div");
			certificationTime.className="certificationTime";
			let certificationTimeValue = tableBody.rows[counter].cells[0].innerText;
			certificationTimeValue=certificationTimeValue.substring(certificationTimeValue.indexOf(",")+1);
			certificationTime.innerText=certificationTimeValue;
			certificationPoint.appendChild(certificationTime);
			
			let certificationSymbol = document.createElement("span");
			certificationSymbol.className="certificationSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/certification.png";			
			certificationSymbol.appendChild(symbol);
			certificationPoint.appendChild(certificationSymbol);		
			statusWrapper.appendChild(certificationPoint);
			let backgroundColor ;
			backgroundColor=tableBody.rows[counter].style.background;				
			
			certificationSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .certification_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .certification_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
				
			
			});	
			certificationSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .certification_checkbox").checked){
					event.target.parentElement.querySelector('div').classList.toggle('visible');
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
				}		
			});		
			
		}

	}


}






function buildLogDurations(statusWrapper,tableBody,numberOfWrappers){
	
	

	let durationLine ;
	let currentEventName;	
	let currentEventStartingTime;
	let currentEventCode;
	let currentEventDuration;
	let chartPosition;
	let durationLineWidth ;
	
	
	for(let counter = 0 ; counter < tableBody.rows.length;counter++){
		
		currentEventName = tableBody.rows[counter].cells[1].innerText;
		
		
		if(currentEventName == "Driving" || currentEventName == "On Duty" || currentEventName == "Sleeper"  || currentEventName == "Off Duty" ||   currentEventName == "Personal Use" ||  currentEventName == "Yard Moves"){
			durationLine = document.createElement("div");
			statusWrapper.appendChild(durationLine);
			let attachedEvent = document.createElement("span");
			durationLine.appendChild(attachedEvent);
			currentEventStartingTime = tableBody.rows[counter].cells[0].innerText;
			currentEventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			attachedEvent.innerText=currentEventCode;
			currentEventDuration = durationMap.get(currentEventCode);
			durationLineWidth = currentEventDuration/864000;
			
			chartPosition = getXCoordinate(currentEventStartingTime);
					
			
			switch(currentEventName){
				
				case 'Driving':
					durationLine.className="driving durationLine";
					durationLine.style.top="62%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
				break;
				
				case 'On Duty':
					durationLine.className="onDuty durationLine";
					durationLine.style.top="87%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
				break;
				
				case 'Off Duty':
					durationLine.className="offDuty durationLine";
					durationLine.style.top="12%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
				break;
				
				case 'Personal Use':
					durationLine.className="personalUse durationLine";
					durationLine.style.top="12%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
					durationLine.style.backgroundColor="initial";
					durationLine.style.border="1px dashed #2a8fca";
				break;
				
				case 'Sleeper':
					durationLine.className="sleeper durationLine";
					durationLine.style.top="37%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
				break;
								
				case 'Yard Moves':
					durationLine.className="yardMoves durationLine";
					durationLine.style.top="87%";
					durationLine.style.width=durationLineWidth+"%";
					durationLine.style.left=(chartPosition*100-0.1)+"%";
					durationLine.style.backgroundColor="initial";
					durationLine.style.border="1px dashed #2a8fca";
				break;

			}
			
			
				let insertedStartingDate = startDate.replaceAll("-","/");
				insertedStartingDate =  new Date(new Date(insertedStartingDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				let previousEvent = eventIdMap.get(currentEventCode);
				let previousEventDate = previousEvent.eventTime.timestamp;
				previousDate = new Date(new Date(previousEventDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				
				let difference = previousDate-insertedStartingDate;				
				
				let differenceInPercent = difference / currentEventDuration;							
				
				let insertedLastDate = endDate.replaceAll("-","/");
				insertedLastDate =  new Date(new Date(insertedLastDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				let numberOfMilleseconds = insertedLastDate - insertedStartingDate;
				
				if(insertedLastDate!=undefined && insertedStartingDate!=undefined){
					if(insertedStartingDate.isDstObserved()==false && insertedLastDate.isDstObserved()==true){
						if(insertedLastDate.getDate() != insertedStartingDate.getDate()){
								numberOfMilleseconds+=3600000;
						}	
					}
				}
				
				
				let numberOfDays = parseInt(numberOfMilleseconds/86400000);
				numberOfDays++;
				maximumLength = numberOfDays*100;
				
				if(tableBody.rows[counter].className.includes("previousEvent")){
					durationLine.style.left="0";
					if(maximumLength<(durationLineWidth+(differenceInPercent*durationLineWidth))){
						durationLine.style.width=maximumLength+"%";
					}
					else{
						durationLine.style.width=(durationLineWidth+(differenceInPercent*durationLineWidth))+"%";
					}
				}else{
						
						let currentLength = (numberOfWrappers)*100+(chartPosition*100-0.1);
						if((currentLength+durationLineWidth)>maximumLength){
							durationLine.style.width=(maximumLength-currentLength)+"%";
						}
						else{
							durationLine.style.width=durationLineWidth+"%";
						}	
					
				}			
			
			
		}

	}

}

	

function buildVerticals(statusWrapper,tableBody){

	
	for(let counter = 0; counter < tableBody.rows.length; counter++){
	
		if(previousEvent!=undefined){
			if(tableBody.rows[counter].className=="previousEvent"){				
				previousVerticalEventName=tableBody.rows[0].cells[1].innerText;	
				
			}
		}
		let startingVertical = document.createElement('div');
		
		
		let currentEventName = tableBody.rows[counter].cells[1].innerText;
		
		
		
		if(currentEventName == "Driving" || currentEventName == "On Duty" || currentEventName == "Sleeper"  || currentEventName == "Off Duty" ||   currentEventName == "Personal Use" ||  currentEventName == "Yard Moves"){
			
			
			if((previousVerticalEventName != "") && (previousVerticalEventName != currentEventName)){
			
				let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);
				startingVertical.style.left="calc("+(position*100-0.1)+"%)";	
				
				if(previousVerticalEventName=="Off Duty" || previousVerticalEventName=="Personal Use"){
						
						switch(currentEventName){
							
							case 'Driving':
								startingVertical.className="offDuty-Driving startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="51.3%";
							break;
							
							case 'On Duty':
								startingVertical.className="OffDuty-OnDuty startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="76.5%";
							break;

							case 'Sleeper':
								startingVertical.className="OffDuty-Sleeper startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="26.5%";
							break;							

							case 'Yard Moves':
								startingVertical.className="OffDuty-YardMoves startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="76.5%";
							break;
							
							case 'Personal Use':
								startingVertical.className="OffDuty-PersonalUse";
							break;
							
							
						}
						
						
						
				}
				
				if(previousVerticalEventName=="On Duty" || previousVerticalEventName=="Yard Moves"){
					
					switch(currentEventName){
					
							case 'Driving':
								startingVertical.className="OnDuty-Driving startingVertical";
								startingVertical.style.top="62%";
								startingVertical.style.height="26.4%";
							break;
							
							case 'Off Duty':
								startingVertical.className="OnDuty-OffDuty startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="76.5%";
							break;

							case 'Sleeper':
								startingVertical.className="OnDuty-Sleeper startingVertical";
								startingVertical.style.top="37%";
								startingVertical.style.height="51.5%";
							break;
							
							case 'Personal Use':
								startingVertical.className="OnDuty-PersonalUse startingVertical";
								startingVertical.style.top="12%";
								startingVertical.style.height="76.5%";
							break;
							case 'Yard Moves':
								startingVertical.className="OnDuty-YardMoves";
							break;					
					
					}
				}	
				
				if(previousVerticalEventName=="Driving"){
					
					switch(currentEventName){
					
						case 'Off Duty':
							startingVertical.className="Driving-OffDuty startingVertical";
							startingVertical.style.top="12%";
							startingVertical.style.height="51.3%";
						break;
						
						case 'On Duty':
							startingVertical.className="Driving-OnDuty startingVertical";
							startingVertical.style.top="62%";
							startingVertical.style.height="26.4%";
						break;

						case 'Sleeper':
							startingVertical.className="Driving-Sleeper startingVertical";
							startingVertical.style.top="37%";
							startingVertical.style.height="26%";
						break;
						
						case 'Personal Use':
							startingVertical.className="Driving-PersonalUse	startingVertical";
							startingVertical.style.top="12%";
							startingVertical.style.height="51.5%";
						break;
						case 'Yard Moves':
							startingVertical.className="Driving-YardMoves";
						break;					
					
					}
				}	
				
				if(previousVerticalEventName=="Sleeper"){
					
					switch(currentEventName){			
							
						case 'Driving':
							startingVertical.className="Sleeper-Driving startingVertical";
							startingVertical.style.top="37%";
							startingVertical.style.height="26.5%";
						break;
						
						case 'Off Duty':
							startingVertical.className="Sleeper-OffDuty startingVertical";
							startingVertical.style.top="12%";
							startingVertical.style.height="26.5%";
						break;
						
						case 'On Duty':
							startingVertical.className="Sleeper-OnDuty startingVertical";
							startingVertical.style.top="37%";
							startingVertical.style.height="51.5%";
						break;
						
						case 'Personal Use':
							startingVertical.className="Sleeper-PersonalUse startingVertical";
							startingVertical.style.top="12%";
							startingVertical.style.height="26.5%";
						break;
						case 'Yard Moves':
							startingVertical.className="Sleeper-YardMoves startingVertical";
							startingVertical.style.top="37%";
							startingVertical.style.height="51.5%";
						break;					
					
					}
				}	
				
				if(startingVertical.className!="OnDuty-YardMoves" && startingVertical.className!="OffDuty-PersonalUse"){
						
						statusWrapper.appendChild(startingVertical);				
				
				}						

			}
				previousVerticalEventName=currentEventName;	
		
		}
		
	}
	
}



function buildPeriods(statusWrapper,tableBody,numberOfWrappers){

	
	let durationContainer ;	
	let currentEventName;	
	let currentEventStartingTime;
	let currentEventCode;
	let currentEventDuration;
	let chartPosition;
	let durationContainerWidth ;
	let logStart;
	let logEnd;
	let logDuration;
	let mapKeysArray =Array.from(durationMap.keys());
	for(let counter = 0 ; counter < tableBody.rows.length;counter++){
		
		currentEventName = tableBody.rows[counter].cells[1].innerText;
		
		
		if(currentEventName == "Driving" || currentEventName == "On Duty" || currentEventName == "Sleeper"  || currentEventName == "Off Duty" ||   currentEventName == "Personal Use" ||  currentEventName == "Yard Moves"){
				
				currentEventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
				currentEventDuration = durationMap.get(currentEventCode);
			
			if(currentEventDuration!=undefined){
				durationContainer = document.createElement("div");
				statusWrapper.appendChild(durationContainer);
				logstart = document.createElement("div");
				logstart.className="logStart";
				logEnd = document.createElement("div");
				logEnd.className="logEnd";
				logDuration = document.createElement("div");
				logDuration.className="logDuration";
				
				durationContainer.appendChild(logstart);
				durationContainer.appendChild(logEnd);
				durationContainer.appendChild(logDuration);
				
				
				
				currentEventStartingTime = tableBody.rows[counter].cells[0].innerText;
				logstart.innerText = currentEventStartingTime.substr(currentEventStartingTime.indexOf(',') + 2);
				
				
				
				let currentElement = eventIdMap.get(currentEventCode);
				currentEventEndTimeStamp = new Date(new Date(currentElement.eventTime.timestamp+currentEventDuration).toLocaleString("en-US", {timeZone: "America/New_York"}));
				currentEventEndTimeStamp= formatAMPM(currentEventEndTimeStamp);
				logEnd.innerText=currentEventEndTimeStamp;
				logDuration.innerText=timeToStringFormatFunction(currentEventDuration);
				durationContainerWidth = currentEventDuration/864000;
				durationContainer.id=currentEventCode;
				chartPosition = getXCoordinate(currentEventStartingTime);
				
		
				switch(currentEventName){
					
					case 'Driving':
						durationContainer.className="driving durationContainer";
					
					break;
					
					case 'On Duty':
						durationContainer.className="onDuty durationContainer";
			
					break;
					
					case 'Off Duty':
						durationContainer.className="offDuty durationContainer";
					
					break;
					
					case 'Personal Use':
						durationContainer.className="personalUse durationContainer";
				
					break;
					
					case 'Sleeper':
						durationContainer.className="sleeper durationContainer";
						
					break;
									
					case 'Yard Moves':
						durationContainer.className="yardMoves durationContainer";
					
					break;

				}
			
				let insertedStartingDate = startDate.replaceAll("-","/");
				insertedStartingDate =  new Date(new Date(insertedStartingDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				let previousEvent = eventIdMap.get(currentEventCode);
				let previousEventDate = previousEvent.eventTime.timestamp;
				previousDate = new Date(new Date(previousEventDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				let difference = previousDate-insertedStartingDate;		
				
				let differenceInPercent = difference / currentEventDuration;							
				
				let insertedLastDate = endDate.replaceAll("-","/");
				insertedLastDate =  new Date(new Date(insertedLastDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
				let numberOfMilleseconds = insertedLastDate - insertedStartingDate;
				
				if(insertedLastDate!=undefined && insertedStartingDate!=undefined){
					if(insertedStartingDate.isDstObserved()==false && insertedLastDate.isDstObserved()==true){
						if(insertedLastDate.getDate() != insertedStartingDate.getDate()){
								numberOfMilleseconds+=3600000;
						}	
					}
				}
				
				let numberOfDays = parseInt(numberOfMilleseconds/86400000);
				numberOfDays++;
				maximumLength = numberOfDays*100;
				
				if(tableBody.rows[counter].className.includes("previousEvent")){
					durationContainer.style.left="0";
					if(maximumLength<(durationContainerWidth+(differenceInPercent*durationContainerWidth))){
						durationContainer.style.width=maximumLength+"%";
					}
					else{
						durationContainer.style.width=(durationContainerWidth+(differenceInPercent*durationContainerWidth))+"%";
						durationContainerWidth=(durationContainerWidth+(differenceInPercent*durationContainerWidth));
					}
				}else{
						
						let currentLength = (numberOfWrappers)*100+(chartPosition*100);
						if((currentLength+durationContainerWidth)>maximumLength){
							durationContainer.style.width=(maximumLength-currentLength)+"%";
							durationContainerWidth=(maximumLength-currentLength);
						}
						else{
							durationContainer.style.width=durationContainerWidth+"%";
						}	
						durationContainer.style.left=(chartPosition*100)+"%";
					
				}				
				durationContainerWidthLength = durationContainerWidth *12;
				
				if(durationContainerWidthLength>100){
					logDuration.style.left=	(durationContainerWidthLength-100)/2+"px";		
				}
				else{
					logDuration.style.left=(durationContainerWidthLength-100)/2+"px";
				}
				
				let currentLogStartPosition = parseFloat(durationContainer.style.left)*12+numberOfWrappers*1200;
				if(currentLogStartPosition<100){					
					logstart.style.display="none";					
				}
				
				
				if(mapKeysArray[mapKeysArray.length-1] == currentEventCode){
					let currentLogEndPosition = parseFloat(durationContainer.style.left)*12 + durationContainerWidthLength+numberOfWrappers*1200;
					
					if(currentLogEndPosition>maximumLength*12-100){
						logEnd.style.display="none";
					}
				}
				
				let offSetTop ; 
				
				let backgroundColor ;
				
				durationContainer.addEventListener("mouseenter",()=>{
					event.target.style.opacity="1";		
					event.target.querySelector(".logDuration").style.display="block";					
					backgroundColor=tableBody.rows[counter].style.background;				
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					if(document.querySelector('.table-nav').checked){
						offSetTop=tableBody.rows[counter].offsetTop;				
						document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
						}
				});
				
				durationContainer.addEventListener("mouseleave",()=>{
					event.target.style.opacity="0";					
					event.target.querySelector(".logDuration").style.display="none";
					tableBody.rows[counter].style.backgroundColor=backgroundColor;					
				});	
			}
			
		}
		
		
		
		
		

	}

}



function buildShiftCalculator(){
	
	
	

	let allGraphWrapper = document.querySelector('.allGraphWrapper');
	const rect = allGraphWrapper.getBoundingClientRect();
	let position;
	let mouseX;
	let shiftCalculatorContainer = document.createElement('div');
	shiftCalculatorContainer.className="shiftCalculatorContainer";
	let startingPoint = document.createElement('div');
	startingPoint.className = "calcStartingPoint calcultorBoundary";
	
	let endingPoint = document.createElement('div');
	endingPoint.className = "calcEndingPoint calcultorBoundary";
	
	startingPoint.addEventListener('click',()=>{
		if(document.querySelector(".activeCalcStartingPoint")!=null && document.querySelector(".activeCalcEndingPoint")!=null){
			startingPoint.classList.toggle("activeCalcStartingPoint");
			endingPoint.classList.toggle("activeCalcEndingPoint");	
			
		}	
		else if(document.querySelector(".activeCalcEndingPoint")==null){
			startingPoint.classList.toggle("activeCalcStartingPoint");
		}	
		document.querySelector(".totalOffDuty").innerText="---";
		document.querySelector(".totalSleeper").innerText="---";
		document.querySelector(".totalDriving").innerText="---";
		document.querySelector(".totalOnDuty").innerText="---";
		
	});	
	endingPoint.addEventListener('click',()=>{
		if(document.querySelector(".activeCalcStartingPoint")!=null && document.querySelector(".activeCalcEndingPoint")!=null){
			startingPoint.classList.toggle("activeCalcStartingPoint");
			endingPoint.classList.toggle("activeCalcEndingPoint");	
		}	
		else if(document.querySelector(".activeCalcStartingPoint")==null){
			endingPoint.classList.toggle("activeCalcEndingPoint");	

		}	
		document.querySelector(".totalOffDuty").innerText="---";
		document.querySelector(".totalSleeper").innerText="---";
		document.querySelector(".totalDriving").innerText="---";
		document.querySelector(".totalOnDuty").innerText="---";
		
	});	
	
	
	
	shiftCalculatorContainer.appendChild(startingPoint);
	shiftCalculatorContainer.appendChild(endingPoint);
	allGraphWrapper.appendChild(shiftCalculatorContainer);
	let startingWrapper;
	let endingWrapper;
	let startingTarget;
	let endingTarget;
	let totalLength = document.querySelectorAll(".chartContainer").length*1200;
	
	allGraphWrapper.addEventListener('click',()=>{
		
		if(event.target.parentElement.className.includes("statusWrapper")){
			mouseX= event.offsetX+event.target.offsetLeft+event.target.parentElement.parentElement.parentElement.parentElement.offsetLeft;
			
			if(document.querySelector(".activeCalcStartingPoint")==null){
				
				startingWrapper=event.target.parentElement;
				startingTarget=event.target;
				if(startingTarget.className.includes("durationContainer")){
					startingPoint.style.width=mouseX+"px";
					startingPoint.classList.toggle("activeCalcStartingPoint");
				}
				
			}else if(document.querySelector(".activeCalcEndingPoint")==null){
				endingWrapper=event.target.parentElement;
				endingTarget = event.target;
				if(endingTarget.className.includes("durationContainer")){
					endingPoint.style.left=mouseX+"px";
					endingPoint.style.width=(totalLength-mouseX+21)+"px";
					endingPoint.classList.toggle("activeCalcEndingPoint");	
					
					calculatePeriod(startingWrapper,endingWrapper,startingTarget,endingTarget,parseInt(startingPoint.style.width),parseInt(endingPoint.style.left));
				}	
			}	
			else if((document.querySelector(".activeCalcStartingPoint")!=null && document.querySelector(".activeCalcEndingPoint")!=null)){
					startingPoint.classList.toggle("activeCalcStartingPoint");
					endingPoint.classList.toggle("activeCalcEndingPoint");	
					
					document.querySelector(".totalOffDuty").innerText="---";
					document.querySelector(".totalSleeper").innerText="---";
					document.querySelector(".totalDriving").innerText="---";
					document.querySelector(".totalOnDuty").innerText="---";
					
			}
		}
	});
	

}


function buildMalfunctions(statusWrapper,tableBody){

	for(let counter= 0 ; counter<tableBody.rows.length;counter++){
			
		let eventName = tableBody.rows[counter].cells[1].innerText;
		let backgroundColor ;
		
		
		if(eventName=="Power data diagnostic"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let powerDataDiagnosticPoint = document.createElement("div");
			powerDataDiagnosticPoint.className="powerDataDiagnostic secondaryEvents";
			powerDataDiagnosticPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			powerDataDiagnosticPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let powerDataDiagnosticTime = document.createElement("div");
			powerDataDiagnosticTime.className="powerDataDiagnosticTime";
			let powerDataDiagnosticTimeValue = tableBody.rows[counter].cells[0].innerText;
			powerDataDiagnosticTimeValue=powerDataDiagnosticTimeValue.substring(powerDataDiagnosticTimeValue.indexOf(",")+1);
			powerDataDiagnosticTime.innerText=powerDataDiagnosticTimeValue;
			powerDataDiagnosticPoint.appendChild(powerDataDiagnosticTime);
			
			                                                                                     
			
			let powerDataDiagnosticSymbol = document.createElement("span");
			powerDataDiagnosticSymbol.className="powerDataDiagnosticSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/engine_pwd.png";			
			powerDataDiagnosticSymbol.appendChild(symbol);
			powerDataDiagnosticPoint.appendChild(powerDataDiagnosticSymbol);		
			statusWrapper.appendChild(powerDataDiagnosticPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			powerDataDiagnosticSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerData_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerData_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});
			powerDataDiagnosticSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerData_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});			
			
		}



		if(eventName=="Power data diagnostic (cleared)"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let powerDataDiagnosticClearedPoint = document.createElement("div");
			powerDataDiagnosticClearedPoint.className="powerDataDiagnosticCleared secondaryEvents";
			powerDataDiagnosticClearedPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			powerDataDiagnosticClearedPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let powerDataDiagnosticClearedTime = document.createElement("div");
			powerDataDiagnosticClearedTime.className="powerDataDiagnosticClearedTime";
			let powerDataDiagnosticClearedTimeValue = tableBody.rows[counter].cells[0].innerText;
			powerDataDiagnosticClearedTimeValue=powerDataDiagnosticClearedTimeValue.substring(powerDataDiagnosticClearedTimeValue.indexOf(",")+1);
			powerDataDiagnosticClearedTime.innerText=powerDataDiagnosticClearedTimeValue;
			powerDataDiagnosticClearedPoint.appendChild(powerDataDiagnosticClearedTime);
			
			
			
			let powerDataDiagnosticSymbol = document.createElement("span");
			powerDataDiagnosticSymbol.className="powerDataDiagnosticSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/engine.png";			
			powerDataDiagnosticSymbol.appendChild(symbol);
			powerDataDiagnosticClearedPoint.appendChild(powerDataDiagnosticSymbol);		
			statusWrapper.appendChild(powerDataDiagnosticClearedPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			powerDataDiagnosticSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerDataCleared_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerDataCleared_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});
			powerDataDiagnosticSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .powerDataCleared_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});			
			
		}




		if(eventName=="Engine synchronization data diagnostic"){
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let engineSyncPoint = document.createElement("div");
			engineSyncPoint.className="engineSync secondaryEvents";
			engineSyncPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			engineSyncPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let engineSyncTime = document.createElement("div");
			engineSyncTime.className="engineSyncTime";
			let engineSyncTimeValue = tableBody.rows[counter].cells[0].innerText;
			engineSyncTimeValue=engineSyncTimeValue.substring(engineSyncTimeValue.indexOf(",")+1);
			engineSyncTime.innerText=engineSyncTimeValue;
			engineSyncPoint.appendChild(engineSyncTime);
			
			
			
			let engineSyncSymbol = document.createElement("span");
			engineSyncSymbol.className="engineSyncSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/EngineSync.png";			
			engineSyncSymbol.appendChild(symbol);
			engineSyncPoint.appendChild(engineSyncSymbol);		
			statusWrapper.appendChild(engineSyncPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			engineSyncSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSync_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSync_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});
			engineSyncSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSync_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});			
			
		}



		if(eventName == "Engine synchronization data diagnostic (cleared)"){
			
			let eventCode = tableBody.rows[counter].cells[1].querySelector('span').className;
			let engineSyncClearedPoint = document.createElement("div");
			engineSyncClearedPoint.className="engineSyncCleared secondaryEvents";
			engineSyncClearedPoint.id=eventCode;
			let position = getXCoordinate(tableBody.rows[counter].cells[0].innerText);			
			engineSyncClearedPoint.style.left="calc("+(position*100-0.1)+"%)";		
			
			let engineSyncClearedTime = document.createElement("div");
			engineSyncClearedTime.className="engineSyncClearedTime";
			let engineSyncClearedTimeValue = tableBody.rows[counter].cells[0].innerText;
			engineSyncClearedTimeValue=engineSyncClearedTimeValue.substring(engineSyncClearedTimeValue.indexOf(",")+1);
			engineSyncClearedTime.innerText=engineSyncClearedTimeValue;
			engineSyncClearedPoint.appendChild(engineSyncClearedTime);
			
			
			
			let engineSyncSymbol = document.createElement("span");
			engineSyncSymbol.className="engineSyncSymbol";
			let symbol = document.createElement("img");
			symbol.src="icons/engineSyncCleared.png";			
			engineSyncSymbol.appendChild(symbol);
			engineSyncClearedPoint.appendChild(engineSyncSymbol);		
			statusWrapper.appendChild(engineSyncClearedPoint);
			backgroundColor=tableBody.rows[counter].style.background;
			
			engineSyncSymbol.addEventListener("mouseenter",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSyncCleared_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor="rgba(167,218,230,.4588235294)";
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}
				if(document.querySelector('.table-nav').checked && document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSyncCleared_checkbox").checked){
					offSetTop=tableBody.rows[counter].offsetTop;				
					document.querySelector('.tableWrapper').scrollTo({ top: offSetTop-70,left: 0,behavior: 'smooth'});
				}
			
			});
			engineSyncSymbol.addEventListener("mouseleave",()=>{
				if(document.querySelector('.showEvents input').checked && document.querySelector("div.dropdown_showEvents .engineSyncCleared_checkbox").checked){
					tableBody.rows[counter].style.backgroundColor=backgroundColor;
					event.target.parentElement.querySelector('div').classList.toggle('visible');
				}							
			});			
			
		}

	}




		


}




async function setLogVersions(){
	
	let electronicV = document.querySelector(".electronic_logs");
	let paperV = document.querySelector(".paper_logs");
	
	
	electronicV.addEventListener("click",()=>{
			
		if(document.querySelector(".electronic_logs.focused")==null){
			document.querySelector(".electronic_logs").classList.toggle("focused");
		}
		if(document.querySelector(".paper_logs.focused")!=null){
			document.querySelector(".paper_logs.focused").classList.toggle("focused");
		}


		if(document.querySelector(".infoField.hidden")!=null){
			document.querySelector(".infoField").classList.toggle("hidden");
		}
		
		if(document.querySelector(".paperlog_version.hidden")==null){
			document.querySelector(".paperlog_version").classList.toggle("hidden");
		}
	});	
	
	paperV.addEventListener("click",()=>{
			
		if(document.querySelector(".electronic_logs.focused")!=null){
			document.querySelector(".electronic_logs.focused").classList.toggle("focused");
		}
		if(document.querySelector(".paper_logs.focused")==null){
			document.querySelector(".paper_logs").classList.toggle("focused");
		}	
		
		
		if(document.querySelector(".infoField.hidden")==null){
			document.querySelector(".infoField").classList.toggle("hidden");
		}
		
		if(document.querySelector(".paperlog_version.hidden")!=null){
			document.querySelector(".paperlog_version").classList.toggle("hidden");
		}
		document.querySelector(".allPaperlog_wrapper").scrollLeft=document.querySelector(".allPaperlog_wrapper").scrollWidth;
	});
	
	
	


}	

function buildPaperVersion(){
		
	let allcharts = document.querySelectorAll('.chartContainer');
	let allPaperlog_wrapper =document.createElement("div");
	allPaperlog_wrapper.className="allPaperlog_wrapper";
	document.querySelector(".allPaperlog_container").appendChild(allPaperlog_wrapper);
	for(let counter =0 ;counter <allcharts.length; counter++){
		createPaperlogContainers();
	}
	
	let allpaperlogStatusWrappers = document.querySelectorAll('.paperlogStatusWrapper');
	let clonedNode;
	for(let counter=0; counter<allcharts.length;counter++){
		let formContainer = allcharts[counter].querySelector(".formContainer");		
		clonedNode = formContainer.cloneNode(true);		
		allpaperlogStatusWrappers[counter].appendChild(clonedNode);
		
		let dayStarterContainer = allcharts[counter].querySelector(".dayStarterContainer");
		clonedNode = dayStarterContainer.cloneNode(true);		
		allpaperlogStatusWrappers[counter].appendChild(clonedNode);
			
		let alldurationLines = allcharts[counter].querySelectorAll(".durationLine");
		alldurationLines.forEach((durationLine)=>{
			if(durationLine.style.width!=""){
				let clonedNode = durationLine.cloneNode(true);			
				allpaperlogStatusWrappers[counter].appendChild(clonedNode);
			}
		});
		
		let allstartingVerticals = allcharts[counter].querySelectorAll(".startingVertical");
		allstartingVerticals.forEach((startingVertical)=>{
			let clonedNode = startingVertical.cloneNode(true);
			allpaperlogStatusWrappers[counter].appendChild(clonedNode);			
		});		
	}
	
	for(let counter = 0 ; counter<allpaperlogStatusWrappers.length;counter++){
		
		let alldurationLines = allpaperlogStatusWrappers[counter].querySelectorAll(".durationLine");
		
		let lastdurationLine = alldurationLines[alldurationLines.length-1];
		
		if(lastdurationLine!=undefined){
			let extraLine = (parseFloat(lastdurationLine.style.left)+parseFloat(lastdurationLine.style.width))*9.72-972;
			let clone;	
			let position;
			
			if(extraLine>972){
				for(position = counter; extraLine>972; position++){
					clone=lastdurationLine.cloneNode(true);
					clone.style.left="0px";
					clone.style.width=extraLine/9.72+0.1+"%";
					if(counter+1<allpaperlogStatusWrappers.length){
						allpaperlogStatusWrappers[position+1].prepend(clone);
					}
					extraLine-=972;
				}
				counter=position;
			}
			if(extraLine<=972 && extraLine>0){
					clone=lastdurationLine.cloneNode(true);
					clone.style.left="0px";
					clone.style.width=extraLine/9.72+0.1+"%";
					if(counter+1<allpaperlogStatusWrappers.length){
						allpaperlogStatusWrappers[counter+1].prepend(clone);
					}
			}	
			
		
		}	
	
	}
	
	let allinputsWrapper = document.querySelectorAll(".allinputsWrapper");
	
	for(let counter=0;counter<allpaperlogStatusWrappers.length;counter++){
		let shipdocs = allpaperlogStatusWrappers[counter].querySelector(".formContainer");		
		
		let paperlogDate = allpaperlogStatusWrappers[counter].querySelector(".dayStarterContainer .dayStarterHiddenValueContainer").innerText.toString();
			
		paperlogDate = new Date(new Date(paperlogDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
		allinputsWrapper[counter].querySelector(".paperlog_day").value=padTo2Digits(paperlogDate.getDate());
		allinputsWrapper[counter].querySelector(".paperlog_month").value=padTo2Digits(paperlogDate.getMonth()+1);
		allinputsWrapper[counter].querySelector(".paperlog_year").value=paperlogDate.getFullYear();
		
		allinputsWrapper[counter].querySelector(".carrierName").value="AJ Transportation";
		allinputsWrapper[counter].querySelector(".office_address").value="2074 New Dorset Rd, Powhatan, VA  23139";
		allinputsWrapper[counter].querySelector(".terminal_address").value="1226 E. 37th St, Davenport, IA, 52807";
		
		allinputsWrapper[counter].querySelector(".truck_trailer").value=shipdocs.querySelector(".trailerNumberValue").innerText+" /";
		allinputsWrapper[counter].querySelector(".co_driver").value=shipdocs.querySelector(".coDriverValue").innerText;
		allinputsWrapper[counter].querySelector(".bol_number").value=shipdocs.querySelector(".shippingDocsValue").innerText;
		
		let allDurationLines = allpaperlogStatusWrappers[counter].querySelectorAll(".durationLine");
		allinputsWrapper[counter].querySelector(".start_point").value=getStartingLocation(allDurationLines);
		allinputsWrapper[counter].querySelector(".end_point").value=getEndingLocation(allDurationLines);
		
		let allstartingVerticals = allpaperlogStatusWrappers[counter].querySelectorAll(".startingVertical");
		let thisRemarkWrapper = allpaperlogStatusWrappers[counter].parentElement.parentElement.querySelector(".allRemarksWrapper");
		
		fillTotalHoursField(allDurationLines, allpaperlogStatusWrappers[counter].parentElement.parentElement,counter);
		
		
		
		
		setRemarks(allDurationLines,allstartingVerticals,thisRemarkWrapper);
	}
	let allstartingVerticals = document.querySelectorAll(".startingVertical");

	for (let counter= 0 ; counter <	allstartingVerticals.length; counter++){	

		allstartingVerticals[counter].addEventListener("click",()=>{
			let remark = startingVertical_Remark.get(event.target);			
			remark.classList.toggle("hidden");
		});
	
	}	

}







function fillTotalHoursField(allDurationLines,currentStatusWrapper,counter){
	
	let totalOffHours=0;
	let totalSleeperHours=0;
	let totalDrivingHours=0;
	let totalOnDutyHours=0;
	let totalCycleHoursToday=0;
	if(allDurationLines.length>1){
		for(let counter = 0 ; counter < allDurationLines.length; counter++){
			
			if(allDurationLines[counter].classList[0]=="offDuty"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalOffHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalOffHours+=parseFloat(allDurationLines[counter].style.width);
					}
				}
			}	
			if(allDurationLines[counter].classList[0]=="personalUse"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalOffHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalOffHours+=parseFloat(allDurationLines[counter].style.width);
					}
				}
			}
			if(allDurationLines[counter].classList[0]=="sleeper"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalSleeperHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalSleeperHours+=parseFloat(allDurationLines[counter].style.width);
					}	
				}
			}				
			if(allDurationLines[counter].classList[0]=="driving"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalDrivingHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalDrivingHours+=parseFloat(allDurationLines[counter].style.width);
					}	
				}
			}				
			if(allDurationLines[counter].classList[0]=="onDuty"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalOnDutyHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalOnDutyHours+=parseFloat(allDurationLines[counter].style.width);
					}	
				}
			}	
			if(allDurationLines[counter].classList[0]=="yardMoves"){
				if(allDurationLines[counter].style.left!="" && allDurationLines[counter].style.width!=""){
					if(parseFloat(allDurationLines[counter].style.width)+parseFloat(allDurationLines[counter].style.left)>100){
						totalOnDutyHours+=(100-parseFloat(allDurationLines[counter].style.left));
					}
					else{
						totalOnDutyHours+=parseFloat(allDurationLines[counter].style.width);
					}	
				}
			}



			
		}
		
		
	totalOffHours=parseInt(totalOffHours*864000);
	totalOnDutyHours=parseInt(totalOnDutyHours*864000);
	totalDrivingHours=parseInt(totalDrivingHours*864000);
	totalSleeperHours=parseInt(totalSleeperHours*864000);
	totalCycleHoursToday =totalOnDutyHours+totalDrivingHours;
	
	
	
	currentStatusWrapper.querySelector(".allinputsWrapper .off_hours").value=timeToStringFormatHHMM(totalOffHours);
	currentStatusWrapper.querySelector(".allinputsWrapper .on_hours").value=timeToStringFormatHHMM(totalOnDutyHours);
	currentStatusWrapper.querySelector(".allinputsWrapper .sleeper_hours").value=timeToStringFormatHHMM(totalSleeperHours);
	currentStatusWrapper.querySelector(".allinputsWrapper .driving_hours").value=timeToStringFormatHHMM(totalDrivingHours);
	
			
	}
	else{
		if(allDurationLines[0]!=undefined){
			if(allDurationLines[0].classList[0]=="onDuty"){	
				currentStatusWrapper.querySelector(".allinputsWrapper .on_hours").value="24:00";
				currentStatusWrapper.querySelector(".allinputsWrapper .off_hours").value=timeToStringFormatHHMM(totalOffHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .sleeper_hours").value=timeToStringFormatHHMM(totalSleeperHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .driving_hours").value=timeToStringFormatHHMM(totalDrivingHours);
			}
			else if(allDurationLines[0].classList[0]=="driving"){
				currentStatusWrapper.querySelector(".allinputsWrapper .driving_hours").value="24:00";
					currentStatusWrapper.querySelector(".allinputsWrapper .off_hours").value=timeToStringFormatHHMM(totalOffHours);
					currentStatusWrapper.querySelector(".allinputsWrapper .on_hours").value=timeToStringFormatHHMM(totalOnDutyHours);
					currentStatusWrapper.querySelector(".allinputsWrapper .sleeper_hours").value=timeToStringFormatHHMM(totalSleeperHours);
			}
			else if(allDurationLines[0].classList[0]=="sleeper"){
				currentStatusWrapper.querySelector(".allinputsWrapper .sleeper_hours").value="24:00";
				currentStatusWrapper.querySelector(".allinputsWrapper .off_hours").value=timeToStringFormatHHMM(totalOffHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .on_hours").value=timeToStringFormatHHMM(totalOnDutyHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .driving_hours").value=timeToStringFormatHHMM(totalDrivingHours);
			}
			else if(allDurationLines[0].classList[0]=="offDuty"){			
				currentStatusWrapper.querySelector(".allinputsWrapper .off_hours").value="24:00";
				currentStatusWrapper.querySelector(".allinputsWrapper .on_hours").value=timeToStringFormatHHMM(totalOnDutyHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .sleeper_hours").value=timeToStringFormatHHMM(totalSleeperHours);
				currentStatusWrapper.querySelector(".allinputsWrapper .driving_hours").value=timeToStringFormatHHMM(totalDrivingHours);
			}
		}
		
	}	
	
	currentStatusWrapper.querySelector(".allinputsWrapper .onhours_today").value=timeToStringFormatHHMM(totalCycleHoursToday);
	
	let totalCycleHoursLast7days = getTotalCycleHours7days(currentStatusWrapper,counter);
	let totalCycleHoursLast8days = getTotalCycleHours8days(currentStatusWrapper,counter);
	currentStatusWrapper.querySelector(".allinputsWrapper .onhours_7days").value=timeToStringFormatHHMM(totalCycleHoursLast7days);
	currentStatusWrapper.querySelector(".allinputsWrapper .remaining_cycles").value=timeToStringFormatHHMM(252000000-totalCycleHoursLast7days);
	currentStatusWrapper.querySelector(".allinputsWrapper .onhours_8days").value=timeToStringFormatHHMM(totalCycleHoursLast8days);

}


function getTotalCycleHours7days(currentStatusWrapper,order){
	
	let totalNumberOfDays = document.querySelectorAll(".paperlogChartWrapper").length-1;	
	let totalOnDutyHours = 0 ;
	let totalDrivingHours = 0;
	let currentStatusDate = currentStatusWrapper.querySelector(".dayStarterHiddenValueContainer").innerText;
	currentStatusDate = new Date(new Date(currentStatusDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	
	for(let counter=0; counter<7;counter++){
		
		let formattedDate=getFormattedDate(currentStatusDate);
		let thisDailyLog = dailyLogSummaryMap.get(formattedDate);		
		
		if(thisDailyLog != undefined){
			totalDrivingHours+=parseInt(thisDailyLog.timeDriven);
			totalOnDutyHours+=parseInt(thisDailyLog.timeOnDuty);
		}
		currentStatusDate = new Date(new Date(currentStatusDate.getTime()-86400000).toLocaleString("en-US", {timeZone: "America/New_York"}));
		
	}
	
	return totalDrivingHours+totalOnDutyHours;
}


function getTotalCycleHours8days(currentStatusWrapper,order){
	
	let totalNumberOfDays = document.querySelectorAll(".paperlogChartWrapper").length-1;	
	let totalOnDutyHours = 0 ;
	let totalDrivingHours = 0;
	let currentStatusDate = currentStatusWrapper.querySelector(".dayStarterHiddenValueContainer").innerText;
	currentStatusDate = new Date(new Date(currentStatusDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	
	for(let counter=0; counter<8;counter++){
		
		let formattedDate=getFormattedDate(currentStatusDate);
		let thisDailyLog = dailyLogSummaryMap.get(formattedDate);		
		
		if(thisDailyLog != undefined){
			totalDrivingHours+=parseInt(thisDailyLog.timeDriven);
			totalOnDutyHours+=parseInt(thisDailyLog.timeOnDuty);
		}
		currentStatusDate = new Date(new Date(currentStatusDate.getTime()-86400000).toLocaleString("en-US", {timeZone: "America/New_York"}));
		
	}
	
	return totalDrivingHours+totalOnDutyHours;
}




function setRemarks(allDurationLines,allstartingVerticals,thisRemarkWrapper){
	
	let manualLocation;
	
	for(let counter =0 ; counter < allstartingVerticals.length; counter++){				
		let remark = createRemark(thisRemarkWrapper, allDurationLines[counter+1]);	
	
		remark.style.left=allstartingVerticals[counter].style.left;		
		startingVertical_Remark.set(allstartingVerticals[counter],remark);
		
		let eventCode = allDurationLines[counter].querySelector("span").innerText;
		let eventItem = eventIdMap.get(eventCode);
		
		if(eventItem.location!=undefined){			
			if(eventItem.location.calculatedLocation!=undefined){
				let calculatedLocation =eventItem.location.calculatedLocation;	
				if(calculatedLocation.includes("from")){
					
					 calculatedLocation= calculatedLocation.substring(calculatedLocation.indexOf("from")+4);
				}
			
				remark.querySelector(".remarkLocationNote").value = calculatedLocation;
		
			}
		}
	
		if(eventItem.driverLocationDescription!=undefined){
			
			manualLocation=eventItem.driverLocationDescription;
			if(manualLocation.includes("from")){
				 manualLocation=manualLocation.substring(manualLocation.indexOf("from")+4);
			}			
			
			remark.querySelector(".remarkLocationNote").value =	manualLocation;
			
		}
		
		if(eventItem.eventComment!=undefined){
			manualLocation=eventItem.eventComment;
			
			if(manualLocation.includes("from")){
				 manualLocation=manualLocation.substring(manualLocation.indexOf("from")+4);
			}			
			remark.querySelector(".remarkActionNote").value=manualLocation;
		}
			
	}
	

	

}

function createRemark(thisRemarkWrapper){
	
	
	let remarkWrapper = document.createElement("div");
	remarkWrapper.className="remarkWrapper hidden";
	
	let remarkStick = document.createElement("div");
	remarkStick.className="remarkStick";
	
	let remarkNoteWrapper = document.createElement("div");
	remarkNoteWrapper.className="remarkNoteWrapper";
	
	let remarkLocationNote = document.createElement("input");
	remarkLocationNote.type="text";
	remarkLocationNote.className="remarkLocationNote remarkNote";
	
	let remarkActionNote = document.createElement("input");
	remarkActionNote.type="text";
	remarkActionNote.className="remarkActionNote remarkNote";
	
	remarkNoteWrapper.appendChild(remarkLocationNote);
	remarkNoteWrapper.appendChild(remarkActionNote);
	
	remarkWrapper.appendChild(remarkStick);
	remarkWrapper.appendChild(remarkNoteWrapper);	
	
	thisRemarkWrapper.appendChild(remarkWrapper);	
	return remarkWrapper;
}



function getStartingLocation(alldurationLines){

	let eventCode;

	for(let counter = 1 ; counter < alldurationLines.length;counter++){
		
		eventCode=alldurationLines[counter].querySelector("span").innerText;
		eventItem = eventIdMap.get(eventCode);
		if(eventItem.location!=undefined){
			if(eventItem.location.calculatedLocation!=undefined){
				let calculatedLocation = eventItem.location.calculatedLocation;
				if(calculatedLocation.includes("from")){
					return calculatedLocation.substring(calculatedLocation.indexOf("from")+4);
				}
				else{
					return calculatedLocation;
				}	
					
			}	
		}
		if(eventItem.driverLocationDescription!=undefined){			
			let manualLocation = eventItem.driverLocationDescription;
			if(manualLocation.includes("from")){
				return manualLocation.substring(manualLocation.indexOf("from")+4);
			}
			else{
				return manualLocation;
			}
		}	
		
	}
	
	return "";
	
}



function getEndingLocation(alldurationLines){
	
	let eventCode;

	for(let counter = alldurationLines.length-1 ; counter >= 0 ;counter--){
		
		eventCode=alldurationLines[counter].querySelector("span").innerText;
		eventItem = eventIdMap.get(eventCode);
		if(eventItem.location!=undefined){
			if(eventItem.location.calculatedLocation!=undefined){
				let calculatedLocation = eventItem.location.calculatedLocation;
				
				if(calculatedLocation.includes("from")){
					return calculatedLocation.substring(calculatedLocation.indexOf("from")+4);
				}
				else{
					return calculatedLocation;
				}	
					
			}	
		}
		if(eventItem.driverLocationDescription!=undefined){				
			let manualLocation = eventItem.driverLocationDescription;
			if(manualLocation.includes("from")){
				return manualLocation.substring(manualLocation.indexOf("from")+4);
			}
			else{
				return manualLocation;
			}		
		}	
		
	}
	
	return "";
	
	
	
	
	
	
}






function createPaperlogContainers(){
	
	let paperlogChartContainer =document.createElement("div");
	paperlogChartContainer.className='paperlogChartContainer';
	
	let paperlogChartWrapper = document.createElement("div");
	paperlogChartWrapper.className="paperlogChartWrapper";
	
	
	
	
	
	let img = document.createElement("img");
	img.src="images/BlankPaperlogs2.png";
	img.className="paperlogs_img";
	
	let paperlogStatusContainer = document.createElement("div");
	paperlogStatusContainer.className='paperlogStatusContainer';
	
	let paperlogStatusWrapper=document.createElement("div");
	paperlogStatusWrapper.className='paperlogStatusWrapper';
	
	paperlogStatusContainer.appendChild(paperlogStatusWrapper);
	
	paperlogChartWrapper.appendChild(img);
	paperlogChartWrapper.appendChild(paperlogStatusContainer);
	
	paperlogChartContainer.appendChild(paperlogChartWrapper);
	document.querySelector(".allPaperlog_wrapper").appendChild(paperlogChartContainer);	
	
	let allinputsWrapper = document.createElement("div");
	allinputsWrapper.className = "allinputsWrapper paperlog_inputs";
	
	let paperlog_day = document.createElement('input');
	paperlog_day.type="text";
	paperlog_day.className="paperlog_day paperlog_date";
	
	let paperlog_month = document.createElement('input');
	paperlog_month.type="text";
	paperlog_month.className="paperlog_month paperlog_date";
	
	let paperlog_year = document.createElement('input');
	paperlog_year.type="text";
	paperlog_year.className="paperlog_year paperlog_date";
	
	let totalMilesToday = document.createElement('input');
	totalMilesToday.type="text";
	totalMilesToday.className="totalMilesToday totalmiles";
	
	let totalMileageToday = document.createElement('input');
	totalMileageToday.type="text";
	totalMileageToday.className="totalMileageToday totalmiles";
	
	let carierName = document.createElement('input');
	carierName.type="text";
	carierName.className="carrierName carrier_info";
	
	let office_address = document.createElement('input');
	office_address.type="text";
	office_address.className="office_address carrier_info";

	let terminal_address = document.createElement('input');
	terminal_address.type="text";
	terminal_address.className="terminal_address carrier_info";
	
	let truck_trailer = document.createElement('input');
	truck_trailer.type="text";
	truck_trailer.className="truck_trailer";
	
	let co_driver = document.createElement('input');
	co_driver.type="text";
	co_driver.className="co_driver";		
	
	let off_hours = document.createElement('input');
	off_hours.type="text";
	off_hours.className="off_hours total_hours";	
	
	let on_hours = document.createElement('input');
	on_hours.type="text";
	on_hours.className="on_hours total_hours";
	
	let sleeper_hours = document.createElement('input');
	sleeper_hours.type="text";
	sleeper_hours.className="sleeper_hours total_hours";

	let driving_hours = document.createElement('input');
	driving_hours.type="text";
	driving_hours.className="driving_hours total_hours";	

	let bol_number = document.createElement('input');
	bol_number.type="text";
	bol_number.className="bol_number ship_docs";

	let shipper = document.createElement('input');
	shipper.type="text";
	shipper.className="shipper ship_docs";
	
	let start_point = document.createElement('input');
	start_point.type="text";
	start_point.className="start_point final_points";

	let end_point = document.createElement('input');
	end_point.type="text";
	end_point.className="end_point final_points";
	
	let onhours_today = document.createElement('input');
	onhours_today.type="text";
	onhours_today.className="onhours_today recap";
	
	let onhours_7days = document.createElement('input');
	onhours_7days.type="text";
	onhours_7days.className="onhours_7days recap";
	
	let remaining_cycles = document.createElement('input');
	remaining_cycles.type="text";
	remaining_cycles.className="remaining_cycles recap";
	
	let onhours_8days = document.createElement('input');
	onhours_8days.type="text";
	onhours_8days.className="onhours_8days recap";
	
	allinputsWrapper.appendChild(paperlog_day);
	allinputsWrapper.appendChild(paperlog_month);
	allinputsWrapper.appendChild(paperlog_year);
	allinputsWrapper.appendChild(totalMilesToday);
	allinputsWrapper.appendChild(totalMileageToday);
	allinputsWrapper.appendChild(carierName);
	allinputsWrapper.appendChild(office_address);
	allinputsWrapper.appendChild(terminal_address);
	allinputsWrapper.appendChild(truck_trailer);
	allinputsWrapper.appendChild(co_driver);
	allinputsWrapper.appendChild(off_hours);
	allinputsWrapper.appendChild(on_hours);
	allinputsWrapper.appendChild(sleeper_hours);
	allinputsWrapper.appendChild(driving_hours);
	allinputsWrapper.appendChild(bol_number);
	allinputsWrapper.appendChild(shipper);
	allinputsWrapper.appendChild(start_point);
	allinputsWrapper.appendChild(end_point);
	allinputsWrapper.appendChild(onhours_today);
	allinputsWrapper.appendChild(onhours_7days);
	allinputsWrapper.appendChild(remaining_cycles);
	allinputsWrapper.appendChild(onhours_8days);
	
	paperlogChartWrapper.appendChild(allinputsWrapper);
	
	let remarksWrapper = document.createElement("div");
	remarksWrapper.className="allRemarksWrapper paperlog_remarks";
	
	paperlogChartWrapper.appendChild(remarksWrapper);
	
	
	return paperlogChartContainer;		
	
}	






// additional functions 
function calculatePeriod(startingWrapper,endingWrapper,startingTarget,endingTarget,startingPoint,endingPoint){
	
	let startingDurations=null;
	let endingDurations=null;
	let totalOnDuty=0;
	let totalOffDuty=0;
	let totalSleeper=0;
	let totalDriving=0;
	let totalIncludedDurations =[];
	startingPoint-=20;
	endingPoint-=20;
	
	
	
	
	if(startingWrapper==endingWrapper){
		startingDurations = startingWrapper.querySelectorAll(".durationContainer");
		let found =0 ;		
		
			for(let counter = 0; counter < startingDurations.length;counter++){
				if(startingDurations[counter]==startingTarget){				
					found=1;
				}
				if(found==1){
					totalIncludedDurations.push(startingDurations[counter]);
				}	
				if(startingDurations[counter]==endingTarget){
						found=0;
				}	
			}
		

	}
	else{
		startingDurations=startingWrapper.querySelectorAll(".durationContainer");
		endingDurations=endingWrapper.querySelectorAll(".durationContainer");
		let found=0;
		let allWrappers = getAllWrappers(startingWrapper,endingWrapper);

		for(let wrapper = 0 ; wrapper <allWrappers.length; wrapper++){
			if(allWrappers[wrapper]==startingWrapper){
				for(let counter = 0; counter < startingDurations.length;counter++){
					if(startingDurations[counter]==startingTarget){				
						found=1;
					}
					if(found==1){
						totalIncludedDurations.push(startingDurations[counter]);
					}			
				}
			}
			else if(allWrappers[wrapper]==endingWrapper){
				for(let counter = 0; counter < endingDurations.length;counter++){
						if(found==1){
							totalIncludedDurations.push(endingDurations[counter]);
						}
						if(endingDurations[counter]==endingTarget){
							found=0;
						}			
				}
			}
			else{	
					let currentWrapper = allWrappers[wrapper].querySelectorAll(".durationContainer");
					for(let counter =0 ; counter<currentWrapper.length;counter++){
						totalIncludedDurations.push(currentWrapper[counter]);				
					}
				
			}	
			
		}
	}
	

	for(let counter = 0 ; counter < totalIncludedDurations.length;counter++){
		if(startingTarget!=endingTarget){
			let totalTime = durationMap.get(totalIncludedDurations[counter].id);
			if(counter==0){
				let totalLength = ((parseFloat(totalIncludedDurations[counter].style.left)+parseFloat(totalIncludedDurations[counter].style.width))*12+totalIncludedDurations[counter].parentElement.parentElement.parentElement.parentElement.offsetLeft-20);
				
				totalTime=parseInt((totalLength-startingPoint)*864000/12);
			}
			else if(counter == (totalIncludedDurations.length-1)){
				let totalLength = parseFloat(totalIncludedDurations[counter].style.left)*12+totalIncludedDurations[counter].parentElement.parentElement.parentElement.parentElement.offsetLeft-20;
				totalTime=	parseInt(parseFloat(endingPoint-totalLength)*864000/12);
			}	
			
			if(totalIncludedDurations[counter].className.includes("offDuty") || totalIncludedDurations[counter].className.includes("personalUse")){				
				totalOffDuty+=totalTime;		
			}
			else if(totalIncludedDurations[counter].className.includes("sleeper")){
				
				totalSleeper+=totalTime;
			}	
			else if(totalIncludedDurations[counter].className.includes("driving")){
				totalDriving+=totalTime;
			}
			else if(totalIncludedDurations[counter].className.includes("onDuty") || totalIncludedDurations[counter].className.includes("yardMoves")){
				totalOnDuty+=totalTime;
			}	
		}
		else{
			let totalTime= (endingPoint-startingPoint)*864000/12;
			if(startingTarget.className.includes("offDuty") || totalIncludedDurations[counter].className.includes("personalUse")){
				totalOffDuty=totalTime;
			}
			else if(startingTarget.className.includes("sleeper")){
				totalSleeper=totalTime;
			}	
			else if(startingTarget.className.includes("driving")){
				totalDriving=totalTime;
			}			
			else if(startingTarget.className.includes("onDuty") || totalIncludedDurations[counter].className.includes("yardMoves")){
				totalOnDuty=totalTime;
			}			
		}
		
	}
	
	document.querySelector(".totalOffDuty").innerText=timeToStringFormatHHMM(totalOffDuty);
	document.querySelector(".totalSleeper").innerText=timeToStringFormatHHMM(totalSleeper);
	document.querySelector(".totalDriving").innerText=timeToStringFormatHHMM(totalDriving);
	document.querySelector(".totalOnDuty").innerText=timeToStringFormatHHMM(totalOnDuty);
	
}	

function getAllWrappers(startingWrapper,endingWrapper){

	let allWrappers = document.querySelectorAll(".statusWrapper");
	let focusedWrappers = [];
	let found=0;
	for(let counter = 0 ; counter<allWrappers.length;counter++){
		
		if(allWrappers[counter]==startingWrapper){
				found=1;
		}	
		if(found==1){
			focusedWrappers.push(allWrappers[counter]);	
		}
		if(allWrappers[counter]==endingWrapper){
				found=0;
		}	

	}
	
	return focusedWrappers;
	
	
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

		case 'DIAG_LOGGED':
			if(infoSet.fc.id=="D_POWER"){
				return "Power data diagnostic"
			}
			else if(infoSet.fc.id == "D_ENGINE_SYNC"){
				return "Engine synchronization data diagnostic"
			}
			else if(infoSet.fc.id == "D_UNIDENTIFIED_DRIVING_RECORDS"){
				return "Unidentified driving records data diagnostic";
			}
		break;

		case 'DIAG_CLEARED':
			if(infoSet.fc.id=="D_POWER"){
				return "Power data diagnostic (cleared)"
			}
			else if(infoSet.fc.id == "D_ENGINE_SYNC"){
				return "Engine synchronization data diagnostic (cleared)"
			}
			else if(infoSet.fc.id == "D_UNIDENTIFIED_DRIVING_RECORDS"){
				return "Unidentified driving records data diagnostic (cleared)";
			}
			
		break;

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
		case 'ENG_DOWN_REDUCED':
			return "Engine Shut-down w/ RLP";
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
		case 'ENG_UP_REDUCED':
			return "Engine Power-up w/ RLP";
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
	let login = document.getElementById("companyLogin").value.toString().toLowerCase();
	let pass = document.getElementById("companyPassword").value.toString();
	
	
	
	if(checkIfFilledLoginAndPassword()){
		let raw = JSON.stringify({
		  "strategy": "local",
		  "email": login,
		  "password": pass,
		  "company": companyName,
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
		  .then(result => {jsonData=result; })
		  .catch(error => {validationError=error; console.log('error', validationError)});  
			
			if(jsonData.code==401){							
				return jsonData.code;
			}else{				
				token = jsonData.accessToken;		
				return 201;
			}
	
	}
	
}	

function checkIfFilledLoginAndPassword(){

	let login = document.getElementById("companyLogin").value;
	let pass = document.getElementById("companyPassword").value;
	if(login == "" || pass==""){
		
		if(document.getElementById("companyLogin").value.toString()==""){
				if(document.querySelector('.login span ion-icon')==null){
					document.querySelector('.login span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");
				}	
		  }
		  if(document.getElementById("companyPassword").value.toString()==""){
			  if(document.querySelector('.password span ion-icon')==null){
					document.querySelector('.password span').insertAdjacentHTML("afterbegin", "<ion-icon name='warning-outline'></ion-icon>");			
		
				}			  
		  }		
		return false;
	}
	return true;
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






function getEmptyDays(time,row,position){
	


	let previousEventTime=lastEventTime;
	let currentEventTime ;
	let formattedDate ;   //      yyyy/mm/dd
	if(row==0){                
		if(previousEvent!=undefined){
			
			formattedDate = new Date(new Date(previousEvent.eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);			
			let previousTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
			
			let userChosenDate = new Date(new Date(startDate.replaceAll("-","/")).toLocaleString("en-US", {timeZone: "America/New_York"}));
			
		
		
			if(userChosenDate<previousEventTime)
			{
				previousEventTime=previousTime;
			}
			else{
				previousEventTime=userChosenDate;	
			}	
			}
			else{
				previousEventTime=userChosenDate;
			}
		

			formattedDate = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);
			currentEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	}
	
	if(row!=0 && row!=-1 && row+1!=sortedArray.length){
			formattedDate = new Date(new Date(lastEventTime).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);
			previousEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
			formattedDate = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);
			currentEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	


	}

	if(row+1==sortedArray.length && position=="before"){
			formattedDate = new Date(new Date(lastEventTime).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);
			previousEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
			formattedDate = new Date(new Date(time).toLocaleString("en-US", {timeZone: "America/New_York"}));
			formattedDate = getFormattedDate(formattedDate);
			currentEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
	}
	else if(row+1==sortedArray.length && position=="after"){
			let lastDate= endDate.replaceAll("-","/");		
			currentEventTime = new Date(new Date(lastDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
		
			if(sortedArray.length!=0){
				formattedDate = new Date(new Date(sortedArray[sortedArray.length-1].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
				formattedDate = getFormattedDate(formattedDate);
				previousEventTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
	
			}	
			else if(previousEvent!=undefined){
				
						formattedDate = new Date(new Date(previousEvent.eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
						formattedDate = getFormattedDate(formattedDate);			
						let previousTime = new Date(new Date(formattedDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
						
						let userChosenDate = new Date(new Date(startDate.replaceAll("-","/")).toLocaleString("en-US", {timeZone: "America/New_York"}));					
				
				
						if(userChosenDate<previousEventTime)
						{
							previousEventTime=previousTime;
						}
						else{
							previousEventTime=userChosenDate;	
						}	
			}
			else{
				previousEventTime=userChosenDate;
			}		
	}	
	
	

	
	
	
	let timeDifference = parseInt(currentEventTime-previousEventTime);
	
	if(previousEventTime!=undefined && currentEventTime!=undefined){
		if(previousEventTime.isDstObserved()==false && currentEventTime.isDstObserved()==true){
			if(previousEventTime.getDate() != currentEventTime.getDate()){
					timeDifference+=3600000;
			}	
		}
	}
	
	let numberOfDays = parseInt(timeDifference / 86400000);
	

	lastEventTime=currentEventTime;
	
	
	return Math.floor(numberOfDays);
	
	
}	




async function fetchAll(){         // 3seconds
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

	
	
	

	let lastPC,lastOFF,lastON,lastOFFWT,lastYM,lastSB,lastDR,certificationsSet,dataSet,locationsSet,dailyLogSummary;
	
  try {
    const responsesJSON = await Promise.all([
	
		 fetch(urlForPC,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForOff,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForOn,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForOffWT,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForYM,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForSB,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(urlForDr,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		
		 fetch(certificationsGetUrl,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		 
		 fetch(getUrl,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		 
		 fetch(getUrlForDailyLogSummaries,getRequestOptions).then(getResponseStatus).then(jsonResponse),
		 
	]);
		
		
		[lastPC,lastOFF,lastON,lastOFFWT,lastYM,lastSB,lastDR,certificationsSet,dataSet,dailyLogSummary] = responsesJSON.map(r=>{return r.data});
		
		
	}catch (err) {
		throw err;
	}	
		
		dailyLogSummaryArray=dailyLogSummary;
		certificationsArray=certificationsSet;	
		dataArray=dataSet;		
		
		
		let lastEventsArray=[];
		
		if(lastPC[0]!=undefined){
			lastEventsArray.push(lastPC[0]);
		}
		if(lastOFF[0]!=undefined){
			lastEventsArray.push(lastOFF[0]);
		}	
		if(lastON[0]!=undefined){
			lastEventsArray.push(lastON[0]);
		}
		if(lastOFFWT[0]!=undefined){
			lastEventsArray.push(lastOFFWT[0]);
		}
		if(lastYM[0]!=undefined){
			lastEventsArray.push(lastYM[0]);
		}
		if(lastSB[0]!=undefined){
			lastEventsArray.push(lastSB[0]);
		}
		if(lastDR[0]!=undefined){
			lastEventsArray.push(lastDR[0]);
		}
			
		
		lastEventsArray.sort(compare);
		previousEvent = lastEventsArray[lastEventsArray.length-1];
	
	
}	


function getResponseStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}


function jsonResponse(response) {
  return response.json();
}








function removeInactiveChanged(infoArray){
	
		for(let counter = 0 ; counter < infoArray.length;counter++){
			if(infoArray[counter].recordStatus!=undefined){
				if(infoArray[counter].recordStatus.id != "INACTIVE_CHANGED"){					
					sortedArray.push(infoArray[counter]);	
					
				}
				else{
						
				}	
			}
			else {
				sortedArray.push(infoArray[counter]);	
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
		if(currentEventName == "DR_IND_PC" ||  currentEventName=="DR_IND_YM" || currentEventName=="DS_SB" || currentEventName=="DS_ON" || currentEventName=="DS_D" || currentEventName=="DS_OFF"  ){
			if(previousEventData.eventCode.id!=currentEventName){
				let duration = currentEventStartingTime-previousEventStartingTime;		
				
				if(duration>36000000 && (previousEventData.eventCode.id=="DS_OFF" || previousEventData.eventCode.id == "DS_SB") && (previousEventData.eventCode.id != infoArray[counter].eventCode.id)){
					resetPointsMap.set(infoArray[counter]._id,infoArray[counter].eventTime.timestamp);
				}
				durationMap.set(previousEventId,duration);
				previousEventId = infoArray[counter]._id;
				previousEventData = infoArray[counter];
				previousEventStartingTime = currentEventStartingTime;
			}
		}

	}
	if(durationMap.get(previousEventId)==undefined){
			let duration;
			let now  = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
			let insertedLastDate = endDate.replaceAll("-","/");
			insertedLastDate =  new Date(new Date(insertedLastDate).toLocaleString("en-US", {timeZone: "America/New_York"}));
			if(now.getFullYear==insertedLastDate.getFullYear && now.getMonth() == insertedLastDate.getMonth() && now.getDate()==insertedLastDate.getDate()){
				 duration = (now-previousEventStartingTime);
			}
			else{
				duration=parseInt(insertedLastDate.getTime())+86400000-parseInt(previousEventStartingTime.getTime());
			}	
			
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

function timeToStringFormatHHMM(duration){

	let timeFormat ;
	let hour = padTo2Digits(parseInt(duration / 3600000));

	let minute = duration %3600000;
	minute = padTo2Digits(parseInt(minute/60000));

	
	if(hour==0 && minute==0){
		timeFormat = '00:00';
	}	
	else if(hour==0 && minute!= 0){
		
		timeFormat = '00:'+minute;
		
	}else if(hour!=0 && minute !=0){
		timeFormat = hour+':'+minute;
	}	
	else if(hour!=0 && minute == 0){
		timeFormat = hour+':'+'00';
	}	
	
	
	
	return timeFormat;
	
}


// calculating locations


async function apiConnected(){
	
	

	console.log("static Maps Api Connected");
	
}


function fillHeader(){


	document.querySelector(".driverName span").innerText=userName;
	document.querySelector(".startDate").innerText=startDate;
	document.querySelector(".endDate").innerText=endDate;
	let eventVisiblitySwitcher = document.querySelector('.showEvents .toggle');

	let showLoginToggle = document.querySelector('.login_checkbox.toggle');
	let showLogoutToggle = document.querySelector('.logout_checkbox.toggle');
	let showCertToggle = document.querySelector('.certification_checkbox.toggle');
	let showEngineOffToggle = document.querySelector('.engineOff_checkbox.toggle');
	let showEngineOnToggle = document.querySelector('.engineOn_checkbox.toggle');
	let showPowerDataToggle = document.querySelector('.powerData_checkbox.toggle');
	let showPowerDataClearedToggle = document.querySelector('.powerDataCleared_checkbox.toggle');
	let showEngineSyncToggle = document.querySelector('.engineSync_checkbox.toggle');
	let showEngineSyncClearedToggle = document.querySelector('.engineSyncCleared_checkbox.toggle');


	eventVisiblitySwitcher.addEventListener('click',()=>{
		
		if(eventVisiblitySwitcher.checked){
			document.querySelectorAll('.secondaryEvents').forEach(function(el){	
				if(el.classList.contains("login") && showLoginToggle.checked){			
					el.style.display='block';
				}

				if(el.classList.contains("logout") && showLogoutToggle.checked){
					el.style.display='block';
				}

				if(el.classList.contains("shutDown") && showEngineOffToggle.checked){
					el.style.display='block';
				}

				if(el.classList.contains("powerUp") && showEngineOnToggle.checked){
					el.style.display='block';
				}
				
				if(el.classList.contains("certification") && showCertToggle.checked){
					el.style.display='block';
				}

				if(el.classList.contains("powerDataDiagnostic") && showPowerDataToggle.checked){
					el.style.display='block';
				}	
				
				if(el.classList.contains("powerDataDiagnosticCleared") && showPowerDataClearedToggle.checked){
					el.style.display='block';
				}	
				
				if(el.classList.contains("engineSync") && showEngineSyncToggle.checked){
					el.style.display='block';
				}
				
				if(el.classList.contains("engineSyncCleared") && showEngineSyncClearedToggle.checked){
					el.style.display='block';
				}
				
			});
		}
		else{
			document.querySelectorAll('.secondaryEvents').forEach(function(el){
				el.style.display='none';			
			});	
		}
	});

	showLoginToggle.addEventListener('click',()=>{
		if(showLoginToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.login.secondaryEvents').forEach(function(el){						
				el.style.display='block';		
			});
		}
		else{
			document.querySelectorAll('.login.secondaryEvents').forEach(function(el){						
				el.style.display='none';			
			});
		}

	});

	showLogoutToggle.addEventListener('click',()=>{
		if(showLogoutToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.logout.secondaryEvents').forEach(function(el){						
				el.style.display='block';			
			});
		}
		else{
			document.querySelectorAll('.logout.secondaryEvents').forEach(function(el){						
				el.style.display='none';			
			});
		}

	});


	showCertToggle.addEventListener('click',()=>{
		if(showCertToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.certification.secondaryEvents').forEach(function(el){						
				el.style.display='block';	
			});
		}
		else{
			document.querySelectorAll('.certification.secondaryEvents').forEach(function(el){						
				el.style.display='none';					
			});
		}

	});


	showEngineOffToggle.addEventListener('click',()=>{
		if(showEngineOffToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.shutDown.secondaryEvents').forEach(function(el){						
				el.style.display='block';			
			});
		}
		else{
			document.querySelectorAll('.shutDown.secondaryEvents').forEach(function(el){						
				el.style.display='none';		
			});
		}

	});

	showEngineOnToggle.addEventListener('click',()=>{
		if(showEngineOnToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.powerUp.secondaryEvents').forEach(function(el){						
				el.style.display='block';	
			});
		}
		else{
			document.querySelectorAll('.powerUp.secondaryEvents').forEach(function(el){						
				el.style.display='none';			
			});
		}

	});

	showPowerDataToggle.addEventListener('click',()=>{
		if(showPowerDataToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.powerDataDiagnostic.secondaryEvents').forEach(function(el){						
				el.style.display='block';				
			});
		}
		else{
			document.querySelectorAll('.powerDataDiagnostic.secondaryEvents').forEach(function(el){						
				el.style.display='none';				
			});
		}

	});


	showPowerDataClearedToggle.addEventListener('click',()=>{
		if(showPowerDataClearedToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.powerDataDiagnosticCleared.secondaryEvents').forEach(function(el){						
				el.style.display='block';			
			});
		}
		else{
			document.querySelectorAll('.powerDataDiagnosticCleared.secondaryEvents').forEach(function(el){						
				el.style.display='none';		
			});
		}

	});


	showEngineSyncToggle.addEventListener('click',()=>{
		if(showEngineSyncToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.engineSync.secondaryEvents').forEach(function(el){						
				el.style.display='block';		
			});
		}
		else{
			document.querySelectorAll('.engineSync.secondaryEvents').forEach(function(el){						
				el.style.display='none';						
			});
		}

	});



	showEngineSyncClearedToggle.addEventListener('click',()=>{
		if(showEngineSyncClearedToggle.checked && eventVisiblitySwitcher.checked){
			document.querySelectorAll('.engineSyncCleared.secondaryEvents').forEach(function(el){						
				el.style.display='block';	
			});
		}
		else{
			document.querySelectorAll('.engineSyncCleared.secondaryEvents').forEach(function(el){						
				el.style.display='none';					
			});
		}

	});





	
	let colorizer = document.querySelector('.colorizer .toggle');
	

	
	colorizer.addEventListener('click',()=>{
		
		if(colorizer.checked){
			
			document.querySelectorAll('.offDuty.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});
			
			
			document.querySelectorAll('.sleeper.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});
				
			document.querySelectorAll('.onDuty.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});	
				
			document.querySelectorAll('.driving.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});		
			document.querySelectorAll('.personalUse.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});	
			
			document.querySelectorAll('.yardMoves.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});					
			
			document.querySelectorAll("[class*='-Sleeper']").forEach(function(el){
				el.classList.toggle('colorized');
			});			
			document.querySelectorAll("[class*='-Driving']").forEach(function(el){
				el.classList.toggle('colorized');
			});		
			document.querySelectorAll("[class*='-OnDuty']").forEach(function(el){
				el.classList.toggle('colorized');
			});	
			document.querySelectorAll("[class*='-OffDuty']").forEach(function(el){
				el.classList.toggle('colorized');
			});	
			
			document.querySelectorAll(".durationLine").forEach(function(el){
				el.style.width=(parseFloat(el.style.width)+0.3)+"%";				
			});	
			
			
			
			document.querySelectorAll(".intermediate").forEach(function(el){
				el.classList.toggle('colorized');
			});
			
			
			document.querySelectorAll('.eventName').forEach(function(el){				
				let elementContainer = el.querySelector('span');
				el.classList.toggle('colorized');			
			});
			
			
			
		}
		else{
			document.querySelectorAll('.offDuty.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});			
			
			document.querySelectorAll('.sleeper.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});
			document.querySelectorAll('.onDuty.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});	
			document.querySelectorAll('.driving.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});		
			document.querySelectorAll('.personalUse.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});	
			document.querySelectorAll('.yardMoves.durationLine').forEach(function(el){
				el.classList.toggle('colorized');
			});					
			
			document.querySelectorAll("[class*='-Sleeper']").forEach(function(el){
				el.classList.toggle('colorized');
			});			
			document.querySelectorAll("[class*='-Driving']").forEach(function(el){
				el.classList.toggle('colorized');
			});		
			document.querySelectorAll("[class*='-OnDuty']").forEach(function(el){
				el.classList.toggle('colorized');
			});	
			document.querySelectorAll("[class*='-OffDuty']").forEach(function(el){
				el.classList.toggle('colorized');
			});	
			
			document.querySelectorAll(".durationLine").forEach(function(el){
				el.style.width=(parseFloat(el.style.width)-0.3)+"%";				
			});	
			
			
			document.querySelectorAll(".intermediate").forEach(function(el){
				el.classList.toggle('colorized');
			});
			
			document.querySelectorAll('.eventName').forEach(function(el){
				el.classList.toggle('colorized');
				let elementContainer = el.querySelector('span');
				
				elementContainer.style.removeProperty('display');
				elementContainer.style.removeProperty('color');
				elementContainer.style.removeProperty('padding');
				elementContainer.style.removeProperty('border-radius');
				elementContainer.style.removeProperty('background-color');		
		
				
			});			
			
		}		
	});
	
	document.querySelector('.refreshWrapper').addEventListener('click',updateAll);
	
	let showEventsLabel = document.querySelector('.showEvents.switch  .switchLabel');

	showEventsLabel.addEventListener('click',()=>{
		document.querySelector('.dropdown_showEvents.option').classList.toggle("visible");
	});

	
		
		

	
	


}



function fillFooter(){

	document.querySelector('.direction.button').addEventListener('click',()=>{
		
		if(document.querySelector('.direction.button.forward')!=undefined){
	
		
			document.querySelector('.direction.button').style.animation="backward 1.5s forwards";	
			document.querySelector('.direction.button').className="direction button backward";
		}
		else{
		
	
			document.querySelector('.direction.button').style.animation="forward 1.5s forwards";
			document.querySelector('.direction.button').className="direction button forward";			
		}	
	});
	
	
	document.querySelector('.firstId.shiftingIds').addEventListener('focusin',()=>{
	
		let inputValue = document.querySelector('.firstId input').value;
		if(document.getElementById("pickedFirstIDRow")!=null){
			document.getElementById("pickedFirstIDRow").id="";			
		}
		document.querySelector('.firstId.shiftingIds').className="firstId shiftingIds";
				
	});
	
	document.querySelector('.firstId.shiftingIds').addEventListener('focusout',()=>{
		let tables = document.querySelector(".main.table").querySelectorAll('tbody');
		let inputValue = document.querySelector('.firstId input').value;
		let found = null;	
		let lastRowIndex=null;
		let firstRowIndex=null;
		if(inputValue!=""){
			for(let counter = 0 ; counter <tables.length;counter++){
				for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
					if(inputValue == tbody.rows[rowNumber].cells[8].innerText){
						tbody.rows[rowNumber].id="pickedFirstIDRow";
						document.querySelector('.firstId.shiftingIds').className="firstId shiftingIds inputAccepted";
						found=true;
					}	
				
				}
			}
			
			if(document.getElementById("pickedFirstIDRow")!=null && document.getElementById("pickedLastIDRow")!=null){
				firstRowIndex=document.getElementById("pickedFirstIDRow").rowIndex;
				lastRowIndex = document.getElementById("pickedLastIDRow").rowIndex;
				if(firstRowIndex>lastRowIndex){
						found=false;
				}
			}			
			
		
			
			if((inputValue!="" && found==null) || found==false ){				
					document.querySelector('.firstId.shiftingIds').className="firstId shiftingIds wrongInput";
			}
		
		}
			if(document.getElementById("pickedFirstIDRow")!=null || document.getElementById("pickedLastIDRow")!=null){	
					if(document.getElementById("pickedFirstIDRow")!=null){
						firstRowIndex=document.getElementById("pickedFirstIDRow").rowIndex;
					}
					else{
						lastRowIndex=document.getElementById("pickedLastIDRow").rowIndex;
					}					
			
			
					
					for(let counter = 0 ; counter <tables.length;counter++){
						for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
								if(firstRowIndex!=null && lastRowIndex!=null && (tbody.rows[rowNumber].rowIndex<firstRowIndex || tbody.rows[rowNumber].rowIndex>lastRowIndex)){
									
									if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
										tbody.rows[rowNumber].cells[10].querySelector("input").click();
										
									}	
										
								}
								else if(firstRowIndex!=null && lastRowIndex==null && (tbody.rows[rowNumber].rowIndex<firstRowIndex)){
									
										if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
											tbody.rows[rowNumber].cells[10].querySelector("input").click();
											
										}	
										
								}
								else if(firstRowIndex==null && lastRowIndex!=null && (tbody.rows[rowNumber].rowIndex>lastRowIndex)){
								
										if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
											tbody.rows[rowNumber].cells[10].querySelector("input").click();
											
										}	
									
								}
								else{
									if(!tbody.rows[rowNumber].cells[1].innerText.includes("Certification")){
										if(!tbody.rows[rowNumber].cells[10].querySelector("input").checked){									
												tbody.rows[rowNumber].cells[10].querySelector("input").click();
												
										}
										
									}
									else if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
										tbody.rows[rowNumber].cells[10].querySelector("input").click();	
									}	
								}							
								
						}
					}
			}	
			
			
			


				
		
	});


	document.querySelector('.lastId.shiftingIds').addEventListener('focusin',()=>{
	
		let inputValue = document.querySelector('.lastId input').value;
		if(document.getElementById("pickedLastIDRow")!=null){
			document.getElementById("pickedLastIDRow").id="";			
		}	
		document.querySelector('.lastId.shiftingIds').className="lastId shiftingIds";		
				
	});
	

	document.querySelector('.lastId.shiftingIds').addEventListener('focusout',()=>{
		let tables = document.querySelector(".main.table").querySelectorAll('tbody');
		let inputValue = document.querySelector('.lastId input').value;
		let found =null;	
		let lastRowIndex=null;
		let firstRowIndex =null;
		
		if(inputValue!=""){
			for(let counter = 0 ; counter <tables.length;counter++){
				for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
					if(inputValue == tbody.rows[rowNumber].cells[8].innerText){
												
							tbody.rows[rowNumber].id="pickedLastIDRow";
							document.querySelector('.lastId.shiftingIds').className="lastId shiftingIds inputAccepted";
							found=true;
						
					}	
				
				}
			}
			
			if(document.getElementById("pickedFirstIDRow")!=null && document.getElementById("pickedLastIDRow")!=null){
				firstRowIndex=document.getElementById("pickedFirstIDRow").rowIndex;
				lastRowIndex = document.getElementById("pickedLastIDRow").rowIndex;
				if(firstRowIndex>lastRowIndex){
						found=false;
				}
			}

		
			if((inputValue!="" && found==null) || found==false){
				if(found==false){
					document.querySelector('.firstId.shiftingIds').className="firstId shiftingIds wrongInput";
				}
				else{
					document.querySelector('.lastId.shiftingIds').className="lastId shiftingIds wrongInput";
				}	
			}
		
		}
			if(document.getElementById("pickedFirstIDRow")!=null || document.getElementById("pickedLastIDRow")!=null){
				if(document.getElementById("pickedFirstIDRow")!=null){
					firstRowIndex=document.getElementById("pickedFirstIDRow").rowIndex;
				}
				else{
					lastRowIndex=document.getElementById("pickedLastIDRow").rowIndex;
				}					
		
		
				
				for(let counter = 0 ; counter <tables.length;counter++){
					for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
						
						if(firstRowIndex!=null && lastRowIndex!=null && (tbody.rows[rowNumber].rowIndex<firstRowIndex || tbody.rows[rowNumber].rowIndex>lastRowIndex)){
							
							if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
								tbody.rows[rowNumber].cells[10].querySelector("input").click();
								
							}	
								
						}
						else if(firstRowIndex!=null && lastRowIndex==null && (tbody.rows[rowNumber].rowIndex<firstRowIndex)){
							
								if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
									tbody.rows[rowNumber].cells[10].querySelector("input").click();
									
								}	
								
						}
						else if(firstRowIndex==null && lastRowIndex!=null && (tbody.rows[rowNumber].rowIndex>lastRowIndex)){
						
								if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
									tbody.rows[rowNumber].cells[10].querySelector("input").click();
									
								}	
							
						}
						else {
							if(!tbody.rows[rowNumber].cells[1].innerText.includes("Certification")){
								if(!tbody.rows[rowNumber].cells[10].querySelector("input").checked){									
										tbody.rows[rowNumber].cells[10].querySelector("input").click();
										
								}
								
							}
							else if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
								tbody.rows[rowNumber].cells[10].querySelector("input").click();	
							}	
						}


					}	
				}
			}	
			
			
	
	});

	
	
   	
   document.querySelector('.navbar-footer .loading.button').addEventListener('click',transfer);
	
   document.querySelector('.navbar-footer .clonizer.button').addEventListener('click',cloneIt);

   document.querySelector('.navbar-footer .rollback.button').addEventListener('click',rollback);



}

function showPassword(){

	let passwordInput= document.getElementById("companyPassword");
	if(passwordInput.type=="text"){
		passwordInput.type="password";
	}
	else{
		passwordInput.type="text";
	}	
	
}

function updateAll(){
		
	 
	   document.getElementById('endDate').value=previousEndDate;
	   document.getElementById('startDate').value=previousStartDate;
	   document.querySelector('.dropdown .textBox').value=previousUserName;

	   
	   
	   userId=previousUserId;
	   userName=previousUserName;
	   submitAndBuild();


}



async function transfer(){
	

	let date = new Date();
	let expirationDate = new Date(1703048400000);
	if(date > expirationDate){
		throw new Error("Access Blocked");
	}
	
	
	
	let putRequestOptions = {
		  method: 'PUT',
		  headers: {
			  "Authorization": "Bearer "+token ,
			  "Content-Type": "application/json"
		  },
		  body: "",
		  redirect: 'follow'
	
	};
	let statusMap = new Map();
	let jsonResponse=[];
	let tables = document.querySelector(".main.table").querySelectorAll('tbody');
	let markedEvents=[];
	let originalEvents=[];
	let hours = document.querySelector('.hourInput input').value;
	let minutes = document.querySelector('.minuteInput  input').value;
	let buttonDirection = document.querySelector('.direction.button').className;
	let multiplier = 1;
	let totalTimeToShift;
	if(buttonDirection.includes("backward")){
		multiplier=-1;
	}		
	if(hours==""){
			hours=0;
	}	
	if(minutes==""){
		minutes=0;
	}
	totalTimeToShift=(hours*3600000+minutes*60000)*multiplier;
	
	

	for(let counter = 0 ; counter <tables.length;counter++){
		for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
			if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
				let eventCode = tbody.rows[rowNumber].cells[1].querySelector('span').className;
				markedEvents.push(eventIdMap.get(eventCode));
				
			}	
		}
	}
	originalEvents = JSON.parse(JSON.stringify(markedEvents));
	let normalizer = document.querySelector(".normalizer.switch input");
	if(normalizer.checked){
		fixEngineHours(markedEvents);
	}


	
	let progressBar = document.querySelector(".loading.filler-container .filler .progress_bar");
	let progressPercentage =  document.querySelector(".loading.filler-container .progress_indicator");
	let startTime = Date.now();
	let progressInterval= setInterval(function() {
		let delta = Date.now() - startTime; 

		document.querySelector(".progress_container .progress_timer .minute_timer").innerText=parseInt(delta / 60000);
		document.querySelector(".progress_container .progress_timer .second_timer").innerText=Math.floor(delta / 1000)%60; 

		
	}, 1000);


	window.localStorage.setItem("history",JSON.stringify(markedEvents));
	let driverName = document.querySelector(".main-content .driverName").innerText;
	window.localStorage.setItem("prevDriverName",driverName);
	


	for(let counter = 0 ;  counter<markedEvents.length;counter++){	
	
	
		
		if(markedEvents[counter].eventCode.id != "DIAG_LOGGED" && markedEvents[counter].eventCode.id != "DIAG_CLEARED"){
			//markedEvents[counter].i=true;
			//delete markedEvents[counter].i;
			markedEvents[counter].eventTime.timestamp=markedEvents[counter].eventTime.timestamp-totalTimeToShift;
			//markedEvents[counter].totalVehicleMiles=markedEvents[counter].totalVehicleMiles+70;
			//markedEvents[counter].totalEngineHours=parseFloat((markedEvents[counter].totalEngineHours+45.8).toFixed(1));
		} 
		



		let estDate;
		if(markedEvents[counter].eventTime.logDate.timeZone.id=="CT"){
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/Chicago"}));
			
		}
		else{
			
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
		}
		
		markedEvents[counter].eventTime.logDate.date=getFormattedDate(estDate);		

	}

	markedEvents.sort((event1, event2) => (event1.eventTime.timestamp > event2.eventTime.timestamp) ? 1 : (event1.eventTime.timestamp < event2.eventTime.timestamp) ? -1 : 0);





	for(let counter = 0 ; counter < markedEvents.length;counter++){
		
		if(markedEvents[counter].eventCode.id == "DIAG_LOGGED" || markedEvents[counter].eventCode.id == "DIAG_CLEARED"){
		
			let thereWasPowerOFF = false;
			for(let counter2 = counter-1; counter2>=0; counter2--){

				if( (markedEvents[counter2].eventCode.id =="ENG_UP_REDUCED" || markedEvents[counter2].eventCode.id =="ENG_UP_NORMAL" || markedEvents[counter2].eventCode.id == "ENG_DOWN_REDUCED" || markedEvents[counter2].eventCode.id =="ENG_DOWN_NORMAL") && !thereWasPowerOFF){
					
					
					if(markedEvents[counter2].totalVehicleMiles != undefined){

						if(markedEvents[counter].totalVehicleMiles == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalVehicleMiles:{}
							};						
						}				

						markedEvents[counter].totalVehicleMiles = markedEvents[counter2].totalVehicleMiles;
					}
					else{
						if(markedEvents[counter].totalVehicleMiles == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalVehicleMiles:{}
							};						
						}				

						markedEvents[counter].totalVehicleMiles = "";
					}


					
					if(markedEvents[counter2].totalEngineHours != undefined){
						
						if(markedEvents[counter].totalEngineHours == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalEngineHours:{}
							};						
						}

						markedEvents[counter].totalEngineHours = markedEvents[counter2].totalEngineHours;
					}
					else{
						if(markedEvents[counter].totalEngineHours == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalEngineHours:{}
							};						
						}

						markedEvents[counter].totalEngineHours = "";

					}
					
			
					
					
					if(markedEvents[counter2].location != undefined){
						
						if(markedEvents[counter].location == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								location :{}
							}
						}				
					

						if(markedEvents[counter2].location.lon != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								lon:{}
							}
							markedEvents[counter].location.lon = markedEvents[counter2].location.lon;
						}else if(markedEvents[counter2].location.lon == undefined){

							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.lon != undefined){
										delete markedEvents[counter].location.lon;
								}
							}
						}

						if(markedEvents[counter2].location.lat != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								lat:{}
							}
							markedEvents[counter].location.lat = markedEvents[counter2].location.lat;
						}else if(markedEvents[counter2].location.lat == undefined){

							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.lat != undefined){
										delete markedEvents[counter].location.lat;
								}
							}
						}

						if(markedEvents[counter2].location.calculatedLocation != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								calculatedLocation:{}
							}
							markedEvents[counter].location.calculatedLocation=markedEvents[counter2].location.calculatedLocation;
						}
						else if(markedEvents[counter2].location.calculatedLocation == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.calculatedLocation != undefined){
										delete markedEvents[counter].location.calculatedLocation;
								}
							}
						}

						if(markedEvents[counter2].location.source != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								source:{}
							}
							markedEvents[counter].location.source=markedEvents[counter2].location.source;
						}
						else if(markedEvents[counter2].location.source == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.source != undefined){
										delete markedEvents[counter].location.source;
								}
							}
						}

						if(markedEvents[counter2].location.state != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								state:{}
							}
							markedEvents[counter].location.state=markedEvents[counter2].location.state;
						}else if(markedEvents[counter2].location.state == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.state != undefined){
										delete markedEvents[counter].location.state;
								}
							}
						}

						if(markedEvents[counter2].location.timestamp != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								timestamp:{}
							}
							markedEvents[counter].location.timestamp=markedEvents[counter2].location.timestamp;
						}else if(markedEvents[counter2].location.timestamp == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.timestamp != undefined){
										delete markedEvents[counter].location.timestamp;
								}
							}
						}		
						
						

					}
					else if(markedEvents[counter2].location == undefined){

						if(markedEvents[counter2].driverLocationDescription != undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								driverLocationDescription:{}
							}
							markedEvents[counter].driverLocationDescription = markedEvents[counter2].driverLocationDescription;
						}
						else if(markedEvents[counter2].driverLocationDescription == undefined){							
							if(markedEvents[counter].driverLocationDescription !=undefined){
								delete markedEvents[counter].driverLocationDescription;
							}		
						}
						if(markedEvents[counter].location!=undefined){
							delete markedEvents[counter].location!=undefined;
						}
					}
					
					thereWasPowerOFF = true;
				}
				
				if(markedEvents[counter2].eventCode.id !="DR_IND_YM"  && markedEvents[counter2].eventCode.id != "DS_D"   &&   markedEvents[counter2].eventCode.id !="DR_IND_PC" && markedEvents[counter2].eventCode.id !="LOG_NORMAL_PRECISION" && thereWasPowerOFF == false && markedEvents[counter2].eventCode.id !="DIAG_LOGGED" && markedEvents[counter2].eventCode.id !="DIAG_CLEARED"){
					
					
					if(markedEvents[counter2].totalVehicleMiles!=undefined){

						if(markedEvents[counter].totalVehicleMiles == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalVehicleMiles:{}
							};						
						}				

						markedEvents[counter].totalVehicleMiles = markedEvents[counter2].totalVehicleMiles;
					}
					else if(markedEvents[counter2].totalVehicleMiles == undefined){

						if(markedEvents[counter].totalVehicleMiles == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalVehicleMiles:{}
							};						
						}				

						markedEvents[counter].totalVehicleMiles = "";
					}


					
					if(markedEvents[counter2].totalEngineHours != undefined){
						
						if(markedEvents[counter].totalEngineHours == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalEngineHours:{}
							};						
						}

						markedEvents[counter].totalEngineHours = markedEvents[counter2].totalEngineHours;
					}
					else if(markedEvents[counter2].totalEngineHours == undefined){
						
						if(markedEvents[counter].totalEngineHours == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								totalEngineHours:{}
							};						
						}

						markedEvents[counter].totalEngineHours = "";

					}
					
			
					
					
					if(markedEvents[counter2].location != undefined){
						
						if(markedEvents[counter].location == undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								location :{}
							}
						}				
					

						if(markedEvents[counter2].location.lon != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								lon:{}
							}
							markedEvents[counter].location.lon = markedEvents[counter2].location.lon;

						}else if(markedEvents[counter2].location.lon == undefined){

							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.lon != undefined){
										delete markedEvents[counter].location.lon;
								}
							}
						}

						if(markedEvents[counter2].location.lat != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								lat:{}
							}
							markedEvents[counter].location.lat = markedEvents[counter2].location.lat;
						}else if(markedEvents[counter2].location.lat == undefined){

							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.lat != undefined){
										delete markedEvents[counter].location.lat;
								}
							}
						}

						if(markedEvents[counter2].location.calculatedLocation != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								calculatedLocation:{}
							}
							markedEvents[counter].location.calculatedLocation=markedEvents[counter2].location.calculatedLocation;
						}
						else if(markedEvents[counter2].location.calculatedLocation == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.calculatedLocation != undefined){
										delete markedEvents[counter].location.calculatedLocation;
								}
							}
						}

						if(markedEvents[counter2].location.source != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								source:{}
							}
							markedEvents[counter].location.source=markedEvents[counter2].location.source;
						}
						else if(markedEvents[counter2].location.source == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.source != undefined){
										delete markedEvents[counter].location.source;
								}
							}
						}

						if(markedEvents[counter2].location.state != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								state:{}
							}
							markedEvents[counter].location.state=markedEvents[counter2].location.state;
						}else if(markedEvents[counter2].location.state == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.state != undefined){
										delete markedEvents[counter].location.state;
								}
							}
						}

						if(markedEvents[counter2].location.timestamp != undefined ){
							markedEvents[counter].location={ ...markedEvents[counter].location,
								timestamp:{}
							}
							markedEvents[counter].location.timestamp=markedEvents[counter2].location.timestamp;
						}else if(markedEvents[counter2].location.timestamp == undefined){
							
							if (markedEvents[counter].location!=undefined){
								if(markedEvents[counter].location.timestamp != undefined){
										delete markedEvents[counter].location.timestamp;
								}
							}
						}
												

					}
					else if(markedEvents[counter2].location == undefined){

						if(markedEvents[counter2].driverLocationDescription != undefined){
							markedEvents[counter]={ ...markedEvents[counter],
								driverLocationDescription:{}
							}
							markedEvents[counter].driverLocationDescription = markedEvents[counter2].driverLocationDescription;
						}
						else if(markedEvents[counter2].driverLocationDescription == undefined){							
							if(markedEvents[counter].driverLocationDescription !=undefined){
								delete markedEvents[counter].driverLocationDescription;
							}		
						}
						if(markedEvents[counter].location!=undefined){
							delete markedEvents[counter].location!=undefined;
						}
					}


					break;
				}


				if( (markedEvents[counter2].eventCode.id =="DR_IND_YM"  || markedEvents[counter2].eventCode.id == "DS_D"   ||   markedEvents[counter2].eventCode.id =="DR_IND_PC" || markedEvents[counter2].eventCode.id =="LOG_NORMAL_PRECISION" )  && thereWasPowerOFF == false){
					let nextOdometer ;
					let nextEventTime ; 
					let currentOdometer = markedEvents[counter2].totalVehicleMiles; 
					let currentEventTime = markedEvents[counter2].eventTime.timestamp;
					let currentEngineHours = markedEvents[counter2].totalEngineHours;
					for(let counter3 = counter+1 ; counter3< markedEvents.length; counter3++){
						if(markedEvents[counter3].eventCode.id != "DIAG_CLEARED" && markedEvents[counter3].eventCode.id != "DIAG_LOGGED" ){
							nextOdometer= markedEvents[counter3].totalVehicleMiles;
							nextEventTime = markedEvents[counter3].eventTime.timestamp;
							break;
						}
					}
					
					
					
						let averegeSpeed = (nextOdometer-currentOdometer)/((nextEventTime-currentEventTime)/1000/60);
						
					

						if(currentOdometer != undefined && nextOdometer != undefined ){
							
								if(markedEvents[counter].totalVehicleMiles == undefined){
									markedEvents[counter]={ ...markedEvents[counter],
										totalVehicleMiles:"",
									};			
								
								}

								markedEvents[counter].totalVehicleMiles = parseInt(averegeSpeed*(markedEvents[counter].eventTime.timestamp-currentEventTime)/1000/60+currentOdometer);
						}
						else{			
							if(markedEvents[counter].totalVehicleMiles != undefined){				
								markedEvents[counter].totalVehicleMiles ="";
							}
						}

						
						if(currentEngineHours != undefined){
						
							if(markedEvents[counter].totalEngineHours == undefined){
								markedEvents[counter]={ ...markedEvents[counter],
									totalEngineHours:"",
								};						
							}
							markedEvents[counter].totalEngineHours = (currentEngineHours + parseFloat((markedEvents[counter].eventTime.timestamp-currentEventTime)/1000/60/60)).toFixed(1);
						}
						else{
							if(markedEvents[counter].totalEngineHours!=undefined){						
								markedEvents[counter].totalEngineHours = "";
							}
						}

					
						
						if(markedEvents[counter].location != undefined){
							delete markedEvents[counter].location;
						}


						if(markedEvents[counter].driverLocationDescription!=undefined){
							delete markedEvents[counter].driverLocationDescription;
						}			

					break;

				}
				

			}

			
		}
		

		
		
		
		let raw = markedEvents[counter];
		let jsonFormattedRaw = JSON.stringify(raw);
		putRequestOptions.body=jsonFormattedRaw;
		let eventId =raw._id;
		let url = "https://backend.apexhos.com/hos_events/"+eventId+"?%24client%5BignoreRev%5D=true&%24client%5BcreateIfNotExist%5D=false&%24client%5BuseServerAuditTime%5D=true";
		
		
		jsonResponse.push(fetch(url, putRequestOptions)
		  .then(response => response.json() ) );

		statusMap.set(eventId,jsonResponse[jsonResponse.length-1]);

		
		
		await new Promise(r => setTimeout(r, 60));			
		
		
			for(let [eventID,response] of statusMap.entries()){	
				
				
					 response.then((result)=>{						
						
							if(result.data[0].ok==true){
								if(!document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("updated") && !document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed")){
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Done";
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("updated");
									
								}
								else if(!document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("updated") && document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed")){
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Done";
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("updated");					
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");								

								}
								document.querySelector(".number_updated_events.progress_value").innerText=document.querySelectorAll(".status.updated").length;
								
							}					
						
							
						
					}).catch((error) => {
							
					if(!document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed") && !document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("updated")){	
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed";
					}
					else if(!document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed") && document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("updated")){
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed";
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("updated");	

					}
					document.querySelector(".number_failed_events.progress_value").innerText=document.querySelectorAll(".status.request_failed").length;
					
				});	
				
				statusMap.clear();

			}  

			progressBar.style.width = parseInt((counter+1)/markedEvents.length*100)+"%";
			if(counter+1 == markedEvents.length){
				progressPercentage.innerText=parseInt((counter+1)/markedEvents.length*100);
				progressPercentage.classList.toggle("completed");
			}
			else{
				progressPercentage.innerText=parseInt((counter+1)/markedEvents.length*100);
			}
			
			
		   
		  
		
	}	
		
	 
	clearInterval(progressInterval);

	if(document.querySelector(".navbar-footer .rollback.button").classList.contains("disabled")){
		document.querySelector(".navbar-footer .rollback.button").classList.toggle("disabled");
	}

	
	
	
	
	
	
	
	
	//transferFormAndManners(markedEvents);   need to finish here 
	//checkIfUpdated(originalEvents);
	

	//postToSheets();
	
	
}



async function rollback(){
	

	
	let putRequestOptions = {
		  method: 'PUT',
		  headers: {
			  "Authorization": "Bearer "+token ,
			  "Content-Type": "application/json"
		  },
		  body: "",
		  redirect: 'follow'
	
	};
	let statusMap = new Map();
	let jsonResponse=[];
	let tables = document.querySelector(".main.table").querySelectorAll('tbody');
	let markedEvents=[];
	let originalEvents=[];
	let hours = document.querySelector('.hourInput input').value;
	let minutes = document.querySelector('.minuteInput  input').value;
	let buttonDirection = document.querySelector('.direction.button').className;
	let multiplier = 1;
	let totalTimeToShift;
	if(buttonDirection.includes("backward")){
		multiplier=-1;
	}		
	if(hours==""){
			hours=0;
	}	
	if(minutes==""){
		minutes=0;
	}
	totalTimeToShift=(hours*3600000+minutes*60000)*multiplier;
	
	

	for(let counter = 0 ; counter <tables.length;counter++){
		for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
			if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
				let eventCode = tbody.rows[rowNumber].cells[1].querySelector('span').className;
				markedEvents.push(eventIdMap.get(eventCode));
				
			}	
		}
	}
	originalEvents = JSON.parse(JSON.stringify(markedEvents));
	let normalizer = document.querySelector(".normalizer.switch input");
	if(normalizer.checked){
		fixEngineHours(markedEvents);
	}


	
	let progressBar = document.querySelector(".loading.filler-container .filler .progress_bar");
	let progressPercentage =  document.querySelector(".loading.filler-container .progress_indicator");
	let startTime = Date.now();
	let progressInterval= setInterval(function() {
		let delta = Date.now() - startTime; 

		document.querySelector(".progress_container .progress_timer .minute_timer").innerText=parseInt(delta / 60000);
		document.querySelector(".progress_container .progress_timer .second_timer").innerText=Math.floor(delta / 1000)%60; 

		
	}, 1000);


	let jsonStringOriginalEvents = window.localStorage.getItem("history");

	markedEvents=JSON.parse(jsonStringOriginalEvents);

	for(let counter = 0 ;  counter<markedEvents.length;counter++){	


		let estDate;
		if(companyName!="Company:RU7OoXRkW4" && companyName!="Company:OKXECoBNXg"){
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/Chicago"}));
			
		}
		else{
			
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
		}
		markedEvents[counter].eventTime.logDate.date=getFormattedDate(estDate);		
		let raw = markedEvents[counter];
		let jsonFormattedRaw = JSON.stringify(raw);
		putRequestOptions.body=jsonFormattedRaw;
		let eventId =raw._id;
		let url = "https://backend.apexhos.com/hos_events/"+eventId+"?%24client%5BignoreRev%5D=true&%24client%5BcreateIfNotExist%5D=false&%24client%5BuseServerAuditTime%5D=true";
		
		
		jsonResponse.push(fetch(url, putRequestOptions)
		  .then(response => response.json() ) );

		statusMap.set(eventId,jsonResponse[jsonResponse.length-1]);

		
		
		await new Promise(r => setTimeout(r, 60));			
		
		
			for(let [eventID,response] of statusMap.entries()){	
				
				
					 response.then((result)=>{						
						
							if(result.data[0].ok==true){
								if(!document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("rolled_back") && !document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed")){
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Rolled Back";
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("rolled_back");
									
								}
								else if(!document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("rolled_back") && document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed")){
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Rolled Back";
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("rolled_back");					
									document.getElementsByClassName(result.data[0].id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");								

								}
								document.querySelector(".number_updated_events.progress_value").innerText=document.querySelectorAll(".status.rolled_back").length;
								
							}					
						
							
						
					}).catch((error) => {
							
					if(!document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed") && !document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("rolled_back")){	
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed";
					}
					else if(!document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("request_failed") && document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.contains("rolled_back")){
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed";
						document.getElementsByClassName(eventID)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("rolled_back");	

					}
					document.querySelector(".number_failed_events.progress_value").innerText=document.querySelectorAll(".status.request_failed").length;
					
				});	
				
				statusMap.clear();

			}  

			progressBar.style.width = parseInt((counter+1)/markedEvents.length*100)+"%";
			if(counter+1 == markedEvents.length){
				progressPercentage.innerText=parseInt((counter+1)/markedEvents.length*100);
				progressPercentage.classList.toggle("completed");
			}
			else{
				progressPercentage.innerText=parseInt((counter+1)/markedEvents.length*100);
			}
			
			
		   
		  
		
	}	
		
	 
	clearInterval(progressInterval);



	
	
	
	
	
	
	

	
	
}












async function cloneIt(){

	let eventBody ={
		certifiedRecordLogDate:{
			date:"",
			logStartOffset:0,
			timeZone:{
				id:"ET"
			}	
		},	
		companyId: "Company:RU7OoXRkW4",
		createdAt:1676675888587,
		dSTime:-1,
		driverLocationDescription:"            ",
		eld:{
			id:	"",
			serialNumber:"",
			sn:"",
		},
		eventCode:{
			id:"",
		},	
		eventComment:" ",
		eventTime:{			
			timestamp:"",			
			logDate:{
				date:"",
				logStartOffset:0
			}
		},
		isLive:true,
		location:{
			calculatedLocation: "",
			lat:"",
			lon:""
		},	
		recordOrigin:{
			id:""           // DRIVER , ELD
		},
		recordStatus:{
			id:"ACTIVE"
		},
		seqId:"",
		suggestedEditEventIds:[],
		totalEngineHours:"",
		totalVehicleMiles:"",
		type:{
			id:"HosEvent"
		},
		userId:"",
		vehicle:{
			id:"",
			name:"",
			vin:""
		},
		_id:"",
		_rev:"1-16567a35e78bae521a972ebc6f61eede"		
	};	
	
	
	
	let getNewIDRequestOptions = {
		  method: 'GET',
		  headers: {
			  "Authorization": "Bearer "+token ,
			  "Content-Type": "application/json"
		  },		  
		  redirect: 'follow'
	};
	
	let clonedEventName = document.querySelector(".dropdown_events .eventName_input").value;
	let clonedEventCode;
	if(clonedEventName!="Standard"){
		clonedEventCode = getEventCode(clonedEventName);
	}
	
	
	let putRequestMap = new Map();
	let jsonResponse=[];
	let tables = document.querySelector(".main.table").querySelectorAll('tbody');
	let markedEvents=[];
	let originalEvents=[];
	let hours = document.querySelector('.hourInput input').value;
	let minutes = document.querySelector('.minuteInput  input').value;
	let buttonDirection = document.querySelector('.direction.button').className;
	let multiplier = 1;
	let totalTimeToShift;
	if(buttonDirection.includes("backward")){
		multiplier=-1;
	}		
	if(hours==""){
			hours=0;
	}	
	if(minutes==""){
		minutes=0;
	}
	let randomSeconds = generateRandomInteger(1,58);
	totalTimeToShift=(hours*3600000+minutes*60000+randomSeconds*1000)*multiplier;
	
	
	
	for(let counter = 0 ; counter <tables.length;counter++){
		for(let tbody = tables[counter], rowNumber=0; rowNumber<tbody.rows.length;rowNumber++){
			if(tbody.rows[rowNumber].cells[10].querySelector("input").checked){
				let eventCode = tbody.rows[rowNumber].cells[1].querySelector('span').className;
				markedEvents.push(eventIdMap.get(eventCode));
				
			}	
		}
	}
	originalEvents = JSON.parse(JSON.stringify(markedEvents));
	let linkedIdsMap = new Map();

	for(let counter = 0 ;  counter<markedEvents.length;counter++){	
		
		let putNewIDRequestOptions = {
			  method: 'PUT',
			  headers: {
				  "Authorization": "Bearer "+token ,
				  "Content-Type": "application/json"
			  },
			  body: "",
			  redirect: 'follow'
		};

		let eventRequestBody = JSON.parse(JSON.stringify(eventBody));		
		markedEvents[counter]=copyEvent(eventRequestBody,markedEvents[counter]);	
		let randomInt = generateRandomInteger(5000,9000);
		markedEvents[counter].seqId=randomInt.toString(16);
		
		
		
		if(clonedEventName == "Standard"){
			if(!markedEvents[counter].eventCode.id.includes("CERT")){
				delete markedEvents[counter].certifiedRecordLogDate;
				if(markedEvents[counter].eventCode.id.includes("DR_LOGIN") || markedEvents[counter].eventCode.id.includes("DR_LOGOUT") || markedEvents[counter].eventCode.id.includes("ENG")){
					markedEvents[counter].recordOrigin.id="ELD";
					delete markedEvents[counter].recordStatus;
					if(markedEvents[counter].eventCode.id.includes("DR_LOGIN") || markedEvents[counter].eventCode.id.includes("DR_LOGOUT")){
						delete markedEvents[counter].location;
					}
					if(markedEvents[counter].eventCode.id.includes("ENG")){
						delete markedEvents[counter].driverLocationDescription;
					}	
					
				}
				if(markedEvents[counter].eventCode.id.includes("LOG_NORMAL_PRECISION") || markedEvents[counter].eventCode.id.includes("DS_D")){
					markedEvents[counter].recordOrigin.id="ELD";
					delete markedEvents[counter].driverLocationDescription;
				}	
			}
			else if(markedEvents[counter].eventCode.id.includes("CERT")){
				
				if(markedEvents[counter].eld!=undefined){
					delete markedEvents[counter].eld;
				}
				if(markedEvents[counter].location!=undefined){
					delete markedEvents[counter].location;
				}	
				
				if(markedEvents[counter].recordOrigin!=undefined){
					delete markedEvents[counter].recordOrigin;
				}	
				
				if(markedEvents[counter].recordStatus!=undefined){
					delete markedEvents[counter].recordStatus;
				}
				
				if(markedEvents[counter].totalEngineHours!=undefined){
					delete markedEvents[counter].totalEngineHours;
				}	
				
				if(markedEvents[counter].totalVehicleMiles!=undefined){
					delete markedEvents[counter].totalVehicleMiles;
				}	
				if(markedEvents[counter].driverLocationDescription!=undefined){
					delete markedEvents[counter].driverLocationDescription;
				}		
				
			}	

			
		}	
		else if(clonedEventName!="Standard" && clonedEventName!="Certification (1)"){
			markedEvents[counter].eventCode.id=clonedEventCode;
			delete markedEvents[counter].certifiedRecordLogDate;
			if(clonedEventName=="Engine Power-up w/ CLP" || clonedEventName=="Engine Shut-down w/ CLP" || clonedEventName=="Logout" || clonedEventName=="Login"){
				
				markedEvents[counter].recordOrigin.id="ELD";				
				delete markedEvents[counter].recordStatus;
				
				if(clonedEventName=="Logout" || clonedEventName=="Login"){
					delete markedEvents[counter].location;
				}	
				if(clonedEventName=="Engine Power-up w/ CLP" || clonedEventName=="Engine Shut-down w/ CLP"){
					delete markedEvents[counter].driverLocationDescription;
				}	
				
			}
			
			
			if(clonedEventName=="Driving" || clonedEventName=="Intermediate w/ CLP"){
				markedEvents[counter].recordOrigin.id="ELD";
				delete markedEvents[counter].driverLocationDescription;
			}	
		}
		else if(clonedEventName=="Certification (1)"){			
				markedEvents[counter].eventCode.id=clonedEventCode;
				
				if(markedEvents[counter].eld!=undefined){
					delete markedEvents[counter].eld;
				}
				if(markedEvents[counter].location!=undefined){
					delete markedEvents[counter].location;
				}	
				
				if(markedEvents[counter].recordOrigin!=undefined){
					delete markedEvents[counter].recordOrigin;
				}	
				
				if(markedEvents[counter].recordStatus!=undefined){
					delete markedEvents[counter].recordStatus;
				}
				
				if(markedEvents[counter].totalEngineHours!=undefined){
					delete markedEvents[counter].totalEngineHours;
				}	
				
				if(markedEvents[counter].totalVehicleMiles!=undefined){
					delete markedEvents[counter].totalVehicleMiles;
				}	
				if(markedEvents[counter].driverLocationDescription!=undefined){
					delete markedEvents[counter].driverLocationDescription;
				}				
		}	
		
		
		markedEvents[counter].eventTime.timestamp=markedEvents[counter].eventTime.timestamp-totalTimeToShift;
		let estDate;
		if(companyName!="Company:RU7OoXRkW4"){
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/Chicago"}));
		}
		else{
			estDate = new Date(new Date(markedEvents[counter].eventTime.timestamp).toLocaleString("en-US", {timeZone: "America/New_York"}));
		}
		markedEvents[counter].eventTime.logDate.date=getFormattedDate(estDate);		
		
		
		
		
		let getNewHostEventID = getRandomString();
		let newHostEventId = "HosEvent:"+getNewHostEventID;	
		linkedIdsMap.set(newHostEventId,markedEvents[counter]._id);		
		markedEvents[counter]._id= newHostEventId;
		let raw = markedEvents[counter];
		let jsonFormattedRaw = JSON.stringify(raw);		
		putNewIDRequestOptions.body=jsonFormattedRaw;
		
		let putUrl = "https://backend.apexhos.com/hos_events/"+newHostEventId+"?%24client%5BignoreRev%5D=true&%24client%5BcreateIfNotExist%5D=true&%24client%5BuseServerAuditTime%5D=true";
		putRequestMap.set(putUrl,putNewIDRequestOptions);
		let url = "https://backend.apexhos.com/hos_events/"+newHostEventId+"?";
		
		jsonResponse.push(fetch(url, getNewIDRequestOptions)
		  .then(response => response.json()));
		  
		  
	
	}
	
	
	let putRequestMapKeysArray = Array.from(putRequestMap.keys());
	

	
	
	
	let submittedRequestsResultMap = new Map();
	for(let counter =0 ; counter < jsonResponse.length;counter++){		
		await jsonResponse[counter].then((result)=>{
			
			let putRequestURL = putRequestMapKeysArray[counter];
			let putRequestOptions = putRequestMap.get(putRequestURL);			
			let generatedEventCode = putRequestURL.substring(putRequestURL.indexOf("HosEvent"),putRequestURL.indexOf("HosEvent")+17);
			let originalEventCode = linkedIdsMap.get(generatedEventCode);
			if(result.code>=400){	
				submittedRequestsResultMap.set(generatedEventCode,result.code);
				document.getElementsByClassName(originalEventCode)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Submitted";		
				
			}
			else if(result.code<=200   &&  result.code<300 ){
				document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed to Clonize";
			}				
		});
		
	}
	
	
	
	for (let counter = 0 ; counter < putRequestMapKeysArray.length; counter++){
		
		
		let putRequestURL = putRequestMapKeysArray[counter];
		let putRequestOptions = putRequestMap.get(putRequestURL);
		let generatedEventCode = putRequestURL.substring(putRequestURL.indexOf("HosEvent"),putRequestURL.indexOf("HosEvent")+17);
		let result = submittedRequestsResultMap.get(generatedEventCode);		
		let originalEventCode = linkedIdsMap.get(generatedEventCode);
	
		if(result>=400){			
			await fetch(putRequestURL, putRequestOptions).then(response => response.json()).then((result)=>{
				
				if(result.data[0].ok==true){
					document.getElementsByClassName(originalEventCode)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Clonned";
				}
				else if(result.code>=400   &&  result.code<=500 ){
					document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed to Clonize";
				}
				
			});
		}
		
	}		 
	
	

}


function generateRandomInteger(min, max) {
  return Math.floor(min + Math.random()*(max - min + 1))
}


function copyEvent(sampleBody,markedEvent){

	if(markedEvent.certifiedRecordLogDate==undefined){
		sampleBody.certifiedRecordLogDate.date=markedEvent.eventTime.logDate.date;		
	}
	else{
		sampleBody.certifiedRecordLogDate=markedEvent.certifiedRecordLogDate;
	}	
	if(markedEvent.companyId!=undefined){
		sampleBody.companyId=markedEvent.companyId;
	}	
	if(markedEvent.eld!=undefined){
		sampleBody.eld=markedEvent.eld;
	}
	if(markedEvent.eventCode!=undefined){
		sampleBody.eventCode=markedEvent.eventCode;
	}
	if(markedEvent.eventComment!=undefined){
		
	}	
	if(markedEvent.eventTime!=undefined){
		sampleBody.eventTime=markedEvent.eventTime;
	}	
	if(markedEvent.location!=undefined){
		sampleBody.location=markedEvent.location;
	}	
	if(markedEvent.recordOrigin!=undefined){
		sampleBody.recordOrigin=markedEvent.recordOrigin;
	}	
	if(markedEvent.recordStatus!=undefined){
		sampleBody.recordStatus=markedEvent.recordStatus;
	}
	if(markedEvent.seqId!=undefined){
		sampleBody.seqId=markedEvent.seqId;
	}	
	if(markedEvent.totalEngineHours!=undefined){
		sampleBody.totalEngineHours=markedEvent.totalEngineHours;	
	}	
	if(markedEvent.totalVehicleMiles!=undefined){
		sampleBody.totalVehicleMiles=markedEvent.totalVehicleMiles;
	}	
	if(markedEvent.userId!=undefined){
		sampleBody.userId=markedEvent.userId;
	}	
	if(markedEvent.vehicle!=undefined){
		sampleBody.vehicle=markedEvent.vehicle;
	}	
	if(markedEvent._id!=undefined){
		sampleBody._id=markedEvent._id;
	}	
	if(markedEvent._rev!=undefined){
		sampleBody._rev=markedEvent._rev;
	}	
	
	
	
	
	return sampleBody;
	
	

}










function getEventCode(eventName){

	switch(eventName){		
			case "Login":
				return 'DR_LOGIN';
			break;
			
			case "Logout":
				return 'DR_LOGOUT';
			break;
			
			case "Off Duty":
				return 'DS_OFF';
			break;
			
			case "Driving":
				return 'DS_D';
			break;
			
			case "On Duty":
				return 'DS_ON';
			break;
			
			case "Engine Shut-down w/ CLP":
				return 'ENG_DOWN_NORMAL';
			break;
			case "Engine Shut-down w/ RLP":
				return 'ENG_DOWN_REDUCED';
			break;
			
			case "Yard Moves":
				return 'DR_IND_YM';
			break;
			
			case "Sleeper":
				return 'DS_SB';
			break;
			
			case "Engine Power-up w/ CLP":
				return 'ENG_UP_NORMAL';
			break;
			case "Engine Power-up w/ RLP":
				return 'ENG_UP_REDUCED';
			break;		
			
			case "Personal Use":
				return 'DR_IND_PC';
			break;
			
			case "Intermediate w/ CLP":
				return 'LOG_NORMAL_PRECISION';
			break;
			
			case "Certification (1)":
				return 'DR_CERT_1';
			break;


	}




}


function getRandomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz-_";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars[rnum];
    }
    return randomstring;
}



function fixEngineHours(markedEvents){
		
	
	let startingEngineStatus = "Engine Shut-down w/ CLP";		
	let eventName ;	
	let startingEngineHours = markedEvents[markedEvents.length-1].totalEngineHours;
	let startingEventTime = markedEvents[markedEvents.length-1].eventTime.timestamp;
	if(markedEvents.length>=2){
		for(let counter = markedEvents.length-2 ; counter>=0; counter--){	
		
			let differenceInMilleseconds = startingEventTime-markedEvents[counter].eventTime.timestamp;
			let engineDifference = parseInt(differenceInMilleseconds/360000);
			
			eventName=getEventName(markedEvents[counter].eventCode.id,markedEvents[counter]);			
		

			if(eventName == "Engine Power-up w/ CLP" || eventName == "Engine Power-up w/ RLP"){		
				
				markedEvents[counter].totalEngineHours=parseFloat((startingEngineHours-(engineDifference*0.1))).toFixed(1);
				startingEngineHours=parseFloat((startingEngineHours-(engineDifference*0.1)).toFixed(1));
				
				startingEngineStatus = eventName;
			}
			else if(eventName=="Engine Shut-down w/ CLP" || eventName == "Engine Shut-down w/ RLP"){		
				markedEvents[counter].totalEngineHours=startingEngineHours;
				
				startingEngineStatus =eventName;
			}


			if(startingEngineStatus =="Engine Power-up w/ CLP" || startingEngineStatus == "Engine Power-up w/ RLP"){
				markedEvents[counter].totalEngineHours=startingEngineHours;		
				
				
			}
			else if((startingEngineStatus =="Engine Shut-down w/ CLP" || startingEngineStatus == "Engine Shut-down w/ RLP") && eventName!= "Engine Shut-down w/ CLP"  &&  eventName!= "Engine Shut-down w/ RLP"){
					markedEvents[counter].totalEngineHours=parseFloat((startingEngineHours-(engineDifference*0.1)).toFixed(1));
					startingEngineHours=parseFloat((startingEngineHours-(engineDifference*0.1)).toFixed(1));
					
			}
			
			startingEventTime=markedEvents[counter].eventTime.timestamp;			
		}
	}
}


async function checkIfUpdated(originalEvents){

	    
		let getOptions =setGetOptions();	
		let numberOfFailedEvents=0;
		let changedEvents = [];
		let readyChangedEvents = new Map();
		for(let counter = 0; counter < originalEvents.length;counter++){
			let getRequestURL="https://backend.apexhos.com/hos_events/";			
			getRequestURL+=originalEvents[counter]._id+"?";
			if(counter%60==0){
				await new Promise(r => setTimeout(r, 2500));
			}
			
			changedEvents.push(fetch(getRequestURL, getOptions).then(response => response.json()));
				
		}
		
		for( let counter = 0 ; counter < changedEvents.length;counter++){
			await changedEvents[counter].then((result)=>{
				readyChangedEvents.set(result._id,result);				
			});	
		
		}
		
		
		for(let counter = 0 ; counter<originalEvents.length;counter++){
			if(readyChangedEvents.get(originalEvents[counter]._id)!=undefined){
				if(originalEvents[counter].eventTime.timestamp == readyChangedEvents.get(originalEvents[counter]._id).eventTime.timestamp){
					document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Failed";
					document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("request_failed");

					numberOfFailedEvents++;					
				} 
				else{
					document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').innerText="Done";
					document.getElementsByClassName(originalEvents[counter]._id)[0].parentElement.parentElement.cells[9].querySelector('.status').classList.toggle("updated");
				}	
					
			}	

		}
		
			
		document.querySelector(".numberOfFailedEvents").innerText=numberOfFailedEvents;
		


}






function transferFormAndManners(markedEvents){

	
	
	let createdTime = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getTime();
	let formObj={lud:false,shippingDocuments:[],trailers:[],vehicles:[]};
	let logDateObj = {date:"",logStartOffset:0,timezone:{id:"ET"}};
	let bluePrintForRequestPayloadDailyLog = {
		companyId:companyName,
		createdAt:createdTime,
		createdBy:userFullId,
		dSTime:-1,
		form:formObj,
		logDate:logDateObj,
		type:{id:"DailyLog"},
		userId:userFullId,
		_id:"DailyLog:"+userFullId+":"		
	};
	
	let eventAttachedCertifications ;
	let eventId;
	let originalCertification;
	let eventDate;
	let requestPayloadDailyLog;

	for(let counter = 0 ; counter<markedEvents.length;counter++){
		
		eventId=markedEvents[counter]._id;
		eventAttachedCertifications=event_CertificationMap.get(eventId);


		if(document.getElementsByClassName(eventId)[0].parentElement.parentElement.className!='previousEvent' && counter!=0){
			
			if(fetchedDailyLogsMap.has(markedEvents[counter].eventTime.logDate.date)){
				
				
				requestPayloadDailyLog = fetchedDailyLogsMap.get(markedEvents[counter].eventTime.logDate.date);
				
				if(eventAttachedCertifications != undefined){
					
					let bols = eventAttachedCertifications.bols;
					let trailers = eventAttachedCertifications.trailers;
					let signature = eventAttachedCertifications.signature;
					for(let counter =0; counter < bols.length; counter++){
						if(!requestPayloadDailyLog.form.shippingDocuments.includes(bols[counter])){
							requestPayloadDailyLog.form.shippingDocuments.push(bols[counter]);
						}	
					}
					
					for(let counter =0; counter < trailers.length; counter++){
						if(!requestPayloadDailyLog.form.trailers.includes(trailers[counter])){
							requestPayloadDailyLog.form.trailers.push(trailers[counter]);
						}	
					}
					
					if(signature!="Not Signed"){
						requestPayloadDailyLog.form.signature=signature;
					}				
				
				}
			}
			else{
				requestPayloadDailyLog = JSON.parse(JSON.stringify(bluePrintForRequestPayloadDailyLog));
				requestPayloadDailyLog.logDate.date=markedEvents[counter].eventTime.logDate.date;
				requestPayloadDailyLog._id+=markedEvents[counter].eventTime.logDate.date;
				fetchedDailyLogsMap.set(markedEvents[counter].eventTime.logDate.date,requestPayloadDailyLog);
				
				if(eventAttachedCertifications!=undefined){
					let bols = eventAttachedCertifications.bols;
					let trailers = eventAttachedCertifications.trailers;
					let signature = eventAttachedCertifications.signature;
					for(let counter =0; counter < bols.length; counter++){
						if(!requestPayloadDailyLog.form.shippingDocuments.includes(bols[counter])){
							requestPayloadDailyLog.form.shippingDocuments.push(bols[counter]);
						}	
					}
					
					for(let counter =0; counter < trailers.length; counter++){
						if(!requestPayloadDailyLog.form.trailers.includes(trailers[counter])){
							requestPayloadDailyLog.form.trailers.push(trailers[counter]);
						}	
					}
					
					if(signature!="Not Signed"){
						requestPayloadDailyLog.form.signature=signature;
					}					
				}
			}		
			
		}
	
	}
	
	let fetchedDailyLogsMapKeysArray = Array.from(fetchedDailyLogsMap.keys());
	let dailyLogSummary;
	let dailyLog;
	
	for(let counter = 0 ; counter < fetchedDailyLogsMapKeysArray.length; counter++){
		dailyLogSummary = dailyLogSummaryMap.get(fetchedDailyLogsMapKeysArray[counter]);
		dailyLog = fetchedDailyLogsMap.get(fetchedDailyLogsMapKeysArray[counter]);
		
		if( dailyLogSummary != undefined){
			
			if(dailyLog.form.shippingDocuments.length!=0 || dailyLog.form.trailers.length!=0){
				dailyLogSummary.hasForms=true;
			}
			else{
				dailyLogSummary.hasForms=false;
			}

			if(dailyLog.form.signature!=undefined && dailyLog.form.signature!=""){
				dailyLogSummary.isSigned=true;
			}
			else{
				dailyLogSummary.isSigned=false;
			}			
		}
		
		if(!fetchedDailyLogSummariesMap.has(fetchedDailyLogsMapKeysArray[counter])){
			fetchedDailyLogSummariesMap.set(fetchedDailyLogsMapKeysArray[counter],dailyLogSummary);
		}
		
	}
	
	
	

	
}


















///////////////////////////////////////////////////      Error and Warning Identifier Functions


function errorIdentifier(allData){

	let counter;
	let eventElement = previousEvent;
	
	let wrongTimestamp = [];
	let sequentialDuplicateEvents =[];
	let overDuration =[];
	let wrongLocation = [];
	let wrongOrigin = [];
	let wrongOdometer =[];
	let wrongEngineHours =[];
	let sameID = [];
	let notMatchingEvent=[];
	
	
	let currentMainEvent="";
	let previousMainEvent="";
	
	let currentNonMainEvent="";
	let previousNonMainEvent="";
	
	
	
	for(counter=-1; counter <allData.length; counter++){
		
		if(counter==-1){
			if(eventElement != undefined){
				
			}	
		}
		
		
		let eventName =getEventName(eventElement.eventCode.id,eventElement);
		
		if(eventName=="Driving" || eventName=="On Duty" || eventName=="Off Duty" || eventName=="Sleeper" || eventName=="Personal Use" || eventName=="Yard Moves"){
				currentMainEvent = eventName;
					
		}
		else{
				currentNonMainEvent=eventName;
		}
		
			
		
		if(previousMainEvent=="Driving"){
			checkTimestamp(eventName,eventElement);	
			
		}
		
		previousNonMainEvent=currentNonMainEvent;
		previousMainEvent=currentMainEvent;
		
	}


}

function checkTimestamp(eventName,eventElement){
		


}







function makeApiCall() {
 
	let fullDate = getFormattedTime(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));;
	let userNickName =document.querySelector('.userName input').value;
	let driverName = document.querySelector('.driverName').innerText;
	let time = fullDate.substring(fullDate.indexOf(',') + 1);
	let	date = fullDate.substring(0, fullDate.indexOf(','));
	let hours = document.querySelector('.hourInput input').value;
	let minutes = document.querySelector('.minuteInput input').value;
	let shiftedTime = hours + " : " + minutes;
	let firstID = document.querySelector('.firstId input').value;
	let lastId = document.querySelector('.lastId input').value;
	let ids = firstID + " ::: " + lastId;
	let direction ;
	if(document.querySelector('.direction.button').className.includes("forward")){
		direction="forward";
		ids = firstID + " >>> " + lastId;
	}
	else{
		direction="backward";
		ids = firstID + " <<< " + lastId;
	}	
	
  var params = {
	// The ID of the spreadsheet to retrieve data from.
	spreadsheetId: '1MmZoNyFBuY5mtqp5oUdzFfzZe-8LBTThRzJWf4NFg3U',  // TODO: Update placeholder value.

	// The A1 notation of the values to retrieve.
	range: 'A3',  // TODO: Update placeholder value.

	// How values should be represented in the output.
	// The default render option is ValueRenderOption.FORMATTED_VALUE.
	valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.

	// How dates, times, and durations should be represented in the output.
	// This is ignored if value_render_option is
	// FORMATTED_VALUE.
	// The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
		
  };
	
  var valueRangeBody = {			 
		  "values": [[date,driverName,time,userNickName,shiftedTime,ids,direction]]	

  };
		
	

	var request = gapi.client.sheets.spreadsheets.values.append(params,valueRangeBody);
	request.then(function(response) {
	// TODO: Change code below to process the `response` object:
	
	}, function(reason) {
	console.error('error: ' + reason.result.error.message);
	}); 
}

function initClient() {
  var API_KEY = 'AIzaSyBdJb9ndeN0U0f7quvJCJBhpotnm6KRn88';  // TODO: Update placeholder with desired API key.

  var CLIENT_ID = '434462678241-ci70dvjhtknbj1bdtlj6jj0r9mvv8afn.apps.googleusercontent.com';  // TODO: Update placeholder with desired client ID.

  // TODO: Authorize using one of the following scopes:
  //   'https://www.googleapis.com/auth/drive'
  //   'https://www.googleapis.com/auth/drive.file'
  //   'https://www.googleapis.com/auth/drive.readonly'
  //   'https://www.googleapis.com/auth/spreadsheets'
  //   'https://www.googleapis.com/auth/spreadsheets.readonly'
  var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

  gapi.client.init({
	'apiKey': API_KEY,
	'clientId': CLIENT_ID,
	'scope': SCOPE,
	'plugin_name':'SheetUpdater',
	'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(function() {
	gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
	
  });
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
	makeApiCall();
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function postToSheets(){
	updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
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


/*
function coordinates(){

var point1 = new google.maps.LatLng(lat1, lng1);
var point2 = new google.maps.LatLng(lat2, lng2);
var heading = google.maps.geometry.spherical.computeHeading(point1,point2);


}

*/

