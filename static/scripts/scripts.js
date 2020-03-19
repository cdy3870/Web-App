//Saving Items
function saveItem(kind, result=undefined, price=undefined) {
    let params = {};
    console.log(kind);
    if (kind == 'Item') {
        console.log("item saved");
        params['retail_price'] = document.getElementById("retail_price").value;
        params['description'] = document.getElementById("description").value;
        params['monthly_price'] = document.getElementById("monthly_price").value;
        params['daily_price'] = document.getElementById("daily_price").value;
        params['weekly_price'] = document.getElementById("weekly_price").value;
        params['title'] = document.getElementById("title").value; 
        sendJsonRequest(params, '/save-item/' + kind, itemSaved);
    } 
    else {
        console.log("rented item saved");
        params['retail_price'] = result.retail_price;
        params['description'] = result.description;
        params['monthly_price'] = price;   
        params['title'] = result.title;
        params['rentee'] = result.rentee
        sendJsonRequest(params, '/save-item/' + kind, rentedItemSaved);
    }
    
}

//Loading Items
function loadItems(kind) { 
    getData('/load-items/' + kind, displayList);
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

function showDetails(id){
    getData('/get-item/' + id, itemLoaded);
}

function returnItem(id){
    getData('/get-item/' + id, itemReturned);
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
        if (result && result.length) {
            if (result[0].kind == 'Item'){
                console.log("Items loaded");
                document.getElementById("ItemTable").innerHTML = '';
                let table = document.getElementById("ItemTable");
                for (var i = 0; i < result.length; i++) {
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

        }
        else {
                document.getElementById("ItemTable").innerHTML = 'No list items.';
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



function clearItemForm(kind) {
    if(kind == 'Item'){
        document.getElementById("weekly_price").value = '';
        document.getElementById("title").value = '';
        document.getElementById("monthly_price").value = '';
        document.getElementById("daily_price").value = '';
        document.getElementById("description").value = '';
        document.getElementById("retail_price").value = '';
    }
}
 
function itemSaved(result) {
    if (result && result.ok) {
        console.log("Saved item.");
        //clearItemForm(result.kind);
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
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemReturned(result) {
    if (result && result.ok) {
        console.log("Returned item.");
        loadItems('Item');
        loadItems('RentedItem');
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

