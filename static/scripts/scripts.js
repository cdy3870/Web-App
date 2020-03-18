//Saving Items
function saveItem(kind) {
    let params = {};
    if (kind == 'Item') {
        params['retail_price'] = document.getElementById("retail_price").value;
        params['description'] = document.getElementById("description").value;
        params['monthly_price'] = document.getElementById("monthly_price").value;
        params['daily_price'] = document.getElementById("daily_price").value;
        params['weekly_price'] = document.getElementById("weekly_price").value;
        params['title'] = document.getElementById("title").value;
    } 
    /*else {
        params['retail_price'] = result.retail_price;
        params['description'] = result.description;
        params['monthly_price'] = result.monthly_price;
        params['daily_price'] = result.daily_price;
        params['weekly_price'] = result.weekly_price;
        params['title'] = result.title;
    }*/
    sendJsonRequest(params, '/save-item/' + kind, itemSaved);
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
    let xmlHttp = createXmlHttp();
    
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            // note that you can check xmlHttp.status here for the HTTP response code
            try {
                let myObject = JSON.parse(xmlHttp.responseText);
                callbackFunction(myObject, targetUrl);
            } catch (exc) {
                console.log("There was a problem at the server!");
            }
        }
    }
    xmlHttp.open("GET", targetUrl, true);
    xmlHttp.send();
}

//Sending JSON Requests
function sendJsonRequest(parameterObject, targetUrl, callbackFunction) {
    var xmlHttp = createXmlHttp();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            var myObject = JSON.parse(xmlHttp.responseText);
            callbackFunction(myObject, targetUrl, parameterObject);
        }
    }
    console.log(targetUrl);
    console.log(parameterObject);
    postParameters(xmlHttp, targetUrl, objectToParameters(parameterObject));
}

function postParameters(xmlHttp, target, parameters) {
    if (xmlHttp) {
        xmlHttp.open("POST", target, true); // XMLHttpRequest.open(method, url, async)
        var contentType = "application/x-www-form-urlencoded";
        xmlHttp.setRequestHeader("Content-type", contentType);
        xmlHttp.send(parameters);
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
    document.getElementById("ItemTable").innerHTML = '';
    if (result && result.length) {
        let text = '<ul>';
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

    } else {
        document.getElementById("ItemTable").innerHTML = 'No list items.';
    }

}

function showDetails(id){
    getData('/get-item/' + id, itemLoaded);
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
        //saveItem('rented', result)
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

//Saving Items Helper Methods
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
 
function itemSaved(result, targetUrl, params) {
    if (result && result.ok) {
        console.log("Saved item.");
        clearItemForm(result.kind);
        //loadItems(result.kind);
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemDeleted(result, targetUrl, params) {
    if (result && result.ok) {
        console.log("Deleted item.");
        loadItems('Item');
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function itemEdited(result, targetUrl, params) {
    if (result && result.ok) {
        console.log("Edited item.");
        loadItems('Item');
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function addRentedItem(result, price){
    let table = document.getElementById("RentedTable")
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
    cell.appendChild(returnButton);
    //deleteItem(String(result.id), result.kind);
    changeItem(String(result.id), result.kind)
}




