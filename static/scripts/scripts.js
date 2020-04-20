//Saving Items
function saveItem(kind, result=undefined, price=undefined) {
    let params = {};
    console.log(kind);
    if (kind == 'Item') {
        console.log("item saved");
        /*params['location'] = document.getElementById("location").value;
        params['category'] = document.getElementById("category").value;
        params['retail_price'] = document.getElementById("retail_price").value;
        params['description'] = document.getElementById("description").value;
        params['monthly_price'] = document.getElementById("monthly_price").value;
        params['daily_price'] = document.getElementById("daily_price").value;
        params['weekly_price'] = document.getElementById("weekly_price").value;
        params['title'] = document.getElementById("title").value;*/
        var form = document.getElementById('form');
        var fileInput = document.getElementById('the-file');
        var file = fileInput.files[0];
        console.log(file)
        var formData = new FormData(form);
        formData.append('file', file);
        formData.append('test', 'test');
        formData.append('location', document.getElementById("location").value);
        formData.append('category', document.getElementById("category").value);
        formData.append('retail_price', document.getElementById("retail_price").value);
        formData.append('description', document.getElementById("description").value);
        formData.append('monthly_price', document.getElementById("monthly_price").value);
        formData.append('daily_price', document.getElementById("daily_price").value);
        formData.append('weekly_price', document.getElementById("weekly_price").value);
        formData.append('title', document.getElementById("title").value);

        //sendJsonRequest(formData, '/save-item/' + kind, itemSaved);
        var oReq = new XMLHttpRequest();
        oReq.open("POST", '/save-item/' + kind, true);
        oReq.send(formData);
    } 
    else {
        console.log("rented item saved");
        params['retail_price'] = result.retail_price;
        params['description'] = result.description;
        params['monthly_price'] = price;   
        params['title'] = result.title;
        params['rentee'] = result.rentee
        params['past_rented'] = result.past_rented
        sendJsonRequest(params, '/save-item/' + kind, rentedItemSaved);
    }
    
}

//Loading Items
function loadItems(kind, history=false) { 
    getData('/load-items/' + kind + '/' + history, displayList);
}

//Deleting Items
function deleteItem(id, kind) {
    let params = {"id": id};
    sendJsonRequest(params, '/delete-item/' + kind, itemDeleted);
}

//Setting Rent to Items
function changeItem(id, kind) {
    let params = {"id": id};
    sendJsonRequest(params, '/change-item/' + kind, itemEdited);
}

function showDetails(id, kind){
    getData('/get-item/' + id + '/Item', itemLoaded);
}

function returnItem(id){
    let params = {"id": id};
    console.log("returning item")
    sendJsonRequest(params, '/return-item/' + id + '/RentedItem', itemReturned);
}

function queryItems(){
    let daily_price2 = document.getElementById("dailyprice2").value;
    let category = document.getElementById("category2").value;
    let location = document.getElementById("location2").value;  
    getData('/query-items/' + category + '/' + location + '/' + daily_price2, displayList)
}



//Creating XmlHTTP
function createXmlHttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!(xmlhttp)) {
        alert("Your browser does not support AJAX!");
    }
    return xmlhttp;
}

//Getting JSON Responses
function getData(targetUrl, callbackFunction) {
    getAJAX(targetUrl, callbackFunction);
}

//Sending JSON Requests
function sendJsonRequest(parameterObject, targetUrl, callbackFunction) {
    console.log(targetUrl);
    console.log(parameterObject);
    postAJAX(targetUrl, callbackFunction, objectToParameters(parameterObject));
}

// AJAX get request
function getAJAX(url, callback) {
    var xmlHttp = createXmlHttp();
    xmlHttp.open("GET", url, true); // async
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            console.log("[AJAX]: HTTP GET request success. url: " + url);
            if (callback) {
                var obj = null;
                try {
                    console.log("arrived 1.75");
                    obj = JSON.parse(xmlHttp.responseText);
                    callback(obj, url);
                } catch (e) {
                    console.log("[AJAX]: JSON parse failed! ResponseText:" + xmlHttp.responseText);
                }
                if (obj !== null) callback(obj);
            }
        }
    }
    try {
        xmlHttp.send();
    } catch (e) {
        console.log("[AJAX]: HTTP GET request failed! url: " + url);
    }
}

// AJAX post request
function postAJAX(url, callback, data) {
    var xmlHttp = createXmlHttp();
    xmlHttp.open("POST", url, true); // async
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            console.log("[AJAX]: HTTP POST request success. url: " + url);
            if (callback) {
                var obj = null;
                try {
                    obj = JSON.parse(xmlHttp.responseText);
                } catch (e) {
                    console.log("[AJAX]: JSON parse failed! ResponseText:" + xmlHttp.responseText);
                }
                if (obj !== null) callback(obj);
            }
        }
    }
    try {
        xmlHttp.send(data);
    } catch (e) {
        console.log("[AJAX]: HTTP POST request failed! url: " + url);
    }
}


function objectToParameters(obj) {
    var text = '';
    for (var i in obj) {
        // encodeURIComponent is a built-in function that escapes to URL-safe values
        text += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]) + '&';
    }
    return text;
}

//Loading Items Helper Methods
function displayList(result, targetUrl) {
    console.log(result);
    console.log(result.length)
        if (result && result.length) {
            if (result[0].kind == 'Item'){
                console.log("Items loaded");
                document.getElementById("ItemTable").innerHTML = '';
                let table = document.getElementById("ItemTable");
                for (var i = 0; i < result.length; i++) {
                    let row = table.insertRow();           
                    let cell = row.insertCell();
                    let text = document.createElement('a');
                    text.addEventListener ("click", function() {
                        console.log("test");
                        loadUserData("test");
                    });
                    text.href = "/profilepage"
                    let linkText = document.createTextNode(result[i].renter);
                    text.appendChild(linkText);
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode(result[i].title)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].daily_price)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].weekly_price)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].monthly_price)
                    cell.appendChild(text);

                    var button = document.createElement("button");
                    button.innerHTML = "View";
                    button.id = i;

                    button.addEventListener ("click", function() {
                        showDetails(String(result[this.id].id));
                    });
                    cell = row.insertCell();
                    cell.appendChild(button);
                }

            }
            else{
                if (result[0].past_rented == false){
                    document.getElementById("RentedTable").innerHTML = '';
                    console.log("Rented items loaded");
                    let table = document.getElementById("RentedTable");
                    for (var i = 0; i < result.length; i++) {
                        let row = table.insertRow();           
                        let cell = row.insertCell();
                        let text = document.createTextNode(result[i].title)
                        cell.appendChild(text);
                        cell = row.insertCell();
                        text = document.createTextNode("$" + result[i].monthly_price)
                        cell.appendChild(text);
                        cell = row.insertCell();
                        text = document.createTextNode("April 20, 2020")
                        cell.appendChild(text);

                        var button = document.createElement("button");
                        button.innerHTML = "Return";
                        button.id = i;

                        button.addEventListener ("click", function() {
                            console.log(String(result[this.id].id))
                            returnItem(String(result[this.id].id));
                        });
                        cell = row.insertCell();
                        cell.appendChild(button);
                    }
                }
                else{
                    document.getElementById("RentHistoryTable").innerHTML = '';
                    let table = document.getElementById("RentHistoryTable");
                    for (var i = 0; i < result.length; i++) {
                        let row = table.insertRow();           
                        let cell = row.insertCell();
                        let text = document.createTextNode(result[i].title)
                        cell.appendChild(text);
                        cell = row.insertCell();
                        text = document.createTextNode("$" + result[i].monthly_price)
                        cell.appendChild(text);

                        var button = document.createElement("button");
                        button.innerHTML = "Rent";
                        button.id = i;

                        button.addEventListener ("click", function() {
                            console.log(String(result[this.id].id))
                            returnItem(String(result[this.id].id));
                        });
                        cell = row.insertCell();
                        cell.appendChild(button);
                }

            } 

        }
        }
        else{
            if(targetUrl != undefined){
                if(targetUrl == "/load-items/RentedItem/true"){
                    document.getElementById("RentHistoryTable").innerHTML = 'No Renting History';
                }
                else if(targetUrl == "/load-items/RentedItem/false"){
                    document.getElementById("RentedTable").innerHTML = 'No Rented Items';
                }
                else if(targetUrl == "/load-items/Item/false"){
                    document.getElementById("ItemTable").innerHTML = 'No Items';
                }
                else{
                    document.getElementById("ItemTable").innerHTML = 'No Matches Found';
                }
            }
        }
}  



function itemLoaded(result, targetUrl) {
    console.log(result);
    document.getElementById('buttongroup').innerHTML = '';
    let text = '';
    //console.log(result.description);
    document.getElementById('details').innerHTML = result.description;
    document.getElementById('retail_price').innerHTML = "Retail Price: $" + result.retail_price;           
    //
    var dailyButton = document.createElement("button");
    dailyButton.innerHTML = "Daily Rent";
    var weeklyButton = document.createElement("button");
    weeklyButton.innerHTML = "Weekly Rent";
    var monthlyButton = document.createElement("button");
    monthlyButton.innerHTML = "Monthly Rent";

    document.getElementById("image").src = result.blob_url;

    
    
    dailyButton.addEventListener ("click", function() {
        addRentedItem(result, result.daily_price);
    });
    weeklyButton.addEventListener ("click", function() {
        addRentedItem(result, result.weekly_price);
    });
    monthlyButton.addEventListener ("click", function() {
        addRentedItem(result, result.monthly_price);
    });

    document.getElementById("buttongroup").append(dailyButton);
    document.getElementById("buttongroup").append(weeklyButton);
    document.getElementById("buttongroup").append(monthlyButton);



}



function clearItemForm() {
    document.getElementById("weekly_price").value = '';
    document.getElementById("title").value = '';
    document.getElementById("monthly_price").value = '';
    document.getElementById("daily_price").value = '';
    document.getElementById("description").value = '';
    document.getElementById("retail_price").value = '';
}
 
function itemSaved(result) {
    if (result && result.ok) {
        console.log("Saved item.");
        clearItemForm();
        loadItems('Item');
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function rentedItemSaved(result) {
    if (result && result.ok) {
        console.log("Saved item.");
        //clearItemForm(result.kind);
        loadItems('RentedItem');
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemDeleted(result) {
    if (result && result.ok) {
        console.log("Deleted item.");
        loadItems('Item');
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemEdited(result) {
    if (result && result.ok) {
        console.log("Edited item.");
        loadItems('Item');
        loadItems('RentedItem')
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemReturned(result) {
    if (result && result.ok) {
        console.log("Returned item.");
        loadItems('RentedItem');
        loadItems('RentedItem', true);
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function addRentedItem(result, price){
    /*let table = document.getElementById("RentedTable")
    let row = table.insertRow();
    let text = document.createTextNode(result.title)
    let cell = row.insertCell();
    cell.appendChild(text);
    text = document.createTextNode("$" + price)
    cell = row.insertCell();
    cell.appendChild(text);
    text = document.createTextNode("April 20, 2020")
    cell = row.insertCell();
    cell.appendChild(text);
    var returnButton = document.createElement("button");
    returnButton.innerHTML = "Return";
    returnButton.addEventListener ("click", function() {
    
    });
    cell = row.insertCell();
    cell.appendChild(returnButton);*/
    //deleteItem(String(result.id), result.kind);
    saveItem('RentedItem', result, price)
    changeItem(String(result.id), result.kind)
}

function loadUserData(username){
    let prof_username = document.getElementById("prof_username");
    prof_username.innerHTML = username;
}

function loadOwnData(){
    getData('/load-own-data/', displayUserData);
}

function displayUserData(result, targetUrl) {
    var first_name = "First Name:";
    var last_name = "Last Name:";
    var email = "Email:";
    console.log(result);
        if (result && result.length) {
            document.getElementById("first_name").innerHTML = first_name.bold() + " " + result[0].first_name;
            document.getElementById("last_name").innerHTML = last_name.bold() + " " + result[0].last_name;
            document.getElementById("email").innerHTML = email.bold() + " " + result[0].email;

            document.getElementById("UserItemTable").innerHTML = '';
                let table = document.getElementById("UserItemTable");
                for (var i = 1; i < result.length; i++) {
                    let row = table.insertRow();           
                    let cell = row.insertCell();
                    let text = document.createTextNode(result[i].title)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].daily_price)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].weekly_price)
                    cell.appendChild(text);
                    cell = row.insertCell();
                    text = document.createTextNode("$" + result[i].monthly_price)
                    cell.appendChild(text);
                }
        }
}

