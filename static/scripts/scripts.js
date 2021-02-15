// check is the upload form filled
function submitUploadForm() {
    this.event.preventDefault();
    let form = document.forms["uploadItem"];
    let formElements = form.elements;
    if (formElements["title"].value == "") {
        alert("Please input item name");
        return false;
    } else if (formElements["daily_price"].value == "") {
        alert("Please input daily price");
        return false;
    } else if (formElements["daily_price"].value <= 0) {
        alert("Please input valid daily price");
        return false;
    } else if (formElements["weekly_price"].value == "") {
        alert("Please input weekly price");
        return false;
    } else if (formElements["weekly_price"].value <= 0) {
        alert("Please input valid weekly price");
        return false;
    } else if (formElements["monthly_price"].value == "") {
        alert("Please input monthly price");
        return false;
    } else if (formElements["monthly_price"].value <= 0) {
        alert("Please input valid monthly price");
        return false;
    } else if (formElements["description"].value == "") {
        alert("Please input description");
        return false;
    } else if (formElements["retail_price"].value == "") {
        alert("Please input retail price");
        return false;
    } else if (formElements["retail_price"].value <= 0) {
        alert("Please input valid retail price");
        return false;
    } else if (formElements["file"].files.length == 0) {
        alert("Please upload a photo for the item");
        return false;
    }
    saveItem('Item');
    return true;
}

//Saving Items
function saveItem(kind, id=undefined, result=undefined, price=undefined, period=undefined) {
    let params = {};
    // console.log(kind);
    if (kind == 'Item') {
        console.log("item saved");

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
        postAJAX('/save-item/' + kind, itemSaved, formData);
    } 
    else {
        console.log("rented item saved");
        result.period = period;
        console.log(result.period);
        var formData = new FormData();
        formData.append('retail_price', result.retail_price);
        formData.append('description', result.description);
        formData.append('monthly_price', price);   
        formData.append('title', result.title);
        formData.append('rentee', result.rentee);
        formData.append('period', period);
        formData.append('past_rented', result.past_rented);
        formData.append("id", id);
        postAJAX('/save-item/' + kind, rentedItemSaved, formData);
    }
    
}

//Loading Items
function loadItems(kind, history=false) { 
    if (kind == "item") {
        let url = '/query-items/' + 'all' + '/' + 'all' + '/' + 'any';
        getAJAX(url, displayList.bind(this, url));
    } else {
        let url = '/load-items/' + kind + '/' + history;
        getAJAX(url, displayList.bind(this, url));
    }
}

//Deleting Items
function deleteItem(id, kind) {
    var formData = new FormData();
    formData.append("id", id);
    postAJAX('/delete-item/' + kind, itemDeleted, formData);
}

//Setting Rent to Items
function changeItem(id, kind) {
    var formData = new FormData();
    formData.append("id", id);
    postAJAX('/change-item/' + kind, itemEdited, formData);
}

function showDetails(id, kind){
    getAJAX('/get-item/' + id + '/Item', itemLoaded);
}

function returnItem(id){
    console.log("returning item");

    var formData = new FormData();
    formData.append("id", id);
    postAJAX('/return-item/' + id + '/RentedItem', itemReturned, formData);
}

function queryItems(){
    this.event.preventDefault();
    let daily_price2 = document.getElementById("dailyprice2").value;
    let category = document.getElementById("category2").value;
    let location = document.getElementById("location2").value;
    let url = '/query-items/' + category + '/' + location + '/' + daily_price2;
    getAJAX(url, displayList.bind(this, url));
}

//Rent Items
function rentItem(id, price){
    console.log(price);
    fetch("/config")
    .then((result) => { return result.json(); })
    .then((data) => {
        // Initialize Stripe.js
        const stripe = Stripe(data.publicKey);

        // Get Checkout Session ID
        fetch("/create-checkout-session/" + id + "/RentedItem/" + price)
        .then((result) => { return result.json(); })
        .then((data) => {
        console.log(data);
        // Redirect to Stripe Checkout
        return stripe.redirectToCheckout({sessionId: data.sessionId})
        })
        .then((res) => {
        console.log(res);
        });
    });
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

// AJAX get request
function getAJAX(url, callback) {
    var xmlHttp = createXmlHttp();
    xmlHttp.open("GET", url, true); // async
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
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
            } else {
                console.log("[AJAX]: HTTP GET request failed! url: " + url);
            }
        }
    }
    xmlHttp.send();
}

// AJAX post request
function postAJAX(url, callback, data) {
    var xmlHttp = createXmlHttp();
    xmlHttp.open("POST", url, true); // async
    // xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
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
            } else {
                console.log("[AJAX]: HTTP POST request failed! url: " + url);
            }
        }
    }
    xmlHttp.send(data);
}

//Loading Items Helper Methods
function displayList(targetUrl, result) {
        if (result && result.length) {
            if (result[0].kind == 'Item'){
                console.log("Items loaded");
                document.getElementById("ItemTable").innerHTML = '';
                let table = document.getElementById("ItemTable");
                for (var i = 0; i < result.length; i++) {
                    let tokens = targetUrl.split("/");
                    let priceFilter = tokens.pop();
                    switch(priceFilter) {
                        case "any":
                        break;

                        case "$0-$10":
                            if (result[i].retail_price > 10) continue;
                        break;

                        case "$10-$50":
                            if (result[i].retail_price < 10 || result[i].retail_price > 50) continue;
                        break;

                        case "$50-$200":
                            if (result[i].retail_price < 50 || result[i].retail_price > 200) continue;
                        break;

                        case ">$200":
                            if (result[i].retail_price < 200) continue;
                        break;
                    }

                    let row = table.insertRow();           
                    let cell = row.insertCell();
                    let text = document.createElement('a');
                    text.addEventListener ("click", function() {
                        loadRenteeData(result[i].renter);
                    });
                    text.href = "/renteeprofilepage"
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
                    console.log(result[0])
                    let table = document.getElementById("RentedTable");
                    for (var i = 0; i < result.length; i++) {
                        // Name, price, period
                        let row = table.insertRow();           
                        let cell = row.insertCell();
                        let text = document.createTextNode(result[i].title)
                        cell.appendChild(text);
                        cell = row.insertCell();
                        text = document.createTextNode("$" + result[i].monthly_price)
                        cell.appendChild(text);
                        cell = row.insertCell();
                        text = document.createTextNode(result[i].period);
                        cell.appendChild(text);


                        // Period dropdown
                        let uuid = Date.now();
                        let price_id = "" + uuid + result[i].monthly_price
                        let mask = 19;
                        let mask2 = 6;
                        let periodDropdown = document.createElement("select");
                        periodDropdown.setAttribute("id", "select" + price_id);
                        let num = 0;
                        if(result[i].period == "Daily") num = 7;
                        else if(result[i].period == "Weekly") num = 4;
                        else num = 12;
                        for(let j = 0; j < num; j++){
                            periodDropdown.appendChild(new Option(j + 1));
                        }
                        cell = row.insertCell();
                        cell.appendChild(periodDropdown); 
                        // console.log(periodDropdown.getAttribute("id"));

                        document.getElementById("select" + price_id).onchange = function(){
                            // console.log("total" + this.getAttribute("id").slice(mask2));
                            document.getElementById("total" + this.getAttribute("id").slice(mask2)).innerHTML = "$" + parseInt(this.getAttribute("id").slice(mask)) * this.value;
                        }

                        // Total
                        let total = document.createElement("total");
                        total.setAttribute("id", "total" + price_id); 
                        total.innerHTML = "$" + result[i].monthly_price; 
                        cell = row.insertCell();
                        cell.appendChild(total);
                    
                        // Rent button
                        let button = document.createElement("button");
                        let mask3 = 13;
                        button.innerHTML = "Rent";
                        button.id = price_id;
                        button.name = i;
                        
                        button.addEventListener ("click", function() {
                            // console.log(document.getElementById("total" + this.getAttribute("id")).innerHTML);
                            rentItem(String(result[this.name].id), document.getElementById("total" + this.getAttribute("id")).innerHTML.slice(1));
                            //returnItem(String(result[this.id].id));
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
                            showDetails(String(result[this.id].id));
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

function changeTotal(){
    var changedTotal = document.getElementById('total');
}

function itemLoaded(result) {
    // console.log(result);
    showElement(document.getElementById('buttongroup'));

    document.getElementById('details').innerHTML = result.description;
    document.getElementById('retail_price').innerHTML = "Retail Price: $" + result.retail_price;

    var dailyButton = document.getElementById("DailyRentButton");
    var weeklyButton = document.getElementById("WeeklyRentButton");
    var monthlyButton = document.getElementById("MonthlyRentButton");

    document.getElementById("image").src = result.blob_url;

    dailyButton.onclick = addRentedItem.bind(dailyButton, result, result.daily_price, "Daily");
    weeklyButton.onclick = addRentedItem.bind(dailyButton, result, result.weekly_price, "Weekly");
    monthlyButton.onclick = addRentedItem.bind(dailyButton, result, result.monthly_price, "Monthly");
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
    if (result.error) {
        console.log("Upload failed. Received error: " + result.error);
        alert("Upload failed. Received error: " + result.error);
        return;
    }
    console.log("Item uploaded.");
    alert("Upload success.");
    location.reload();
}

function rentedItemSaved(result) {
    if (result.error) {
        console.log("rentedItemSaved() Received error: " + result.error);
        return;
    }
    console.log("Saved item.");
    loadItems('RentedItem');
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

function itemRented(result) {
    if (result && result.ok) {
        console.log("Returned item.");
    
    } else {
        console.log("Received error: " + result.error);
        //showError(result.error);
    }
}

function addRentedItem(result, price, period){
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
    saveItem('RentedItem', String(result.id), result, price, period)
    changeItem(String(result.id), result.kind)
    hideElement(document.getElementById('buttongroup'));
    document.getElementById('details').innerHTML = "Select on view to look at the description and the retail price of the item.";
    document.getElementById('retail_price').innerHTML = "";
    document.getElementById("image").src = "/static/images/pitt.png";
}

function loadUserData(username){
    let prof_username = document.getElementById("prof_username");
    prof_username.innerHTML = username;
}

function loadOwnData(){
    getAJAX('/load-own-data/own', displayUserData);
}

function loadRenteeData(username){
    getAJAX('/load-own-data/username', displayUserData);
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



function hideElement(element) {
    if (!element instanceof Element) return;
    if (element.className.indexOf("hidden") < 0) {
        element.className = element.className+" hidden";
    }
}

function showElement(element) {
    if (!element instanceof Element) return;
    element.className = element.className.replace(" hidden","");
}