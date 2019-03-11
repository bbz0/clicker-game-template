var dataBase = (function() {

	var resources = [
		{
			name: 'seed'
		},
	];

	var buildings = [
		{
			name: 'plant',
			production: 1,
			initCost: 10,
			resource: 'seed'
		},
		{
			name: 'tree',
			production: 5,
			initCost: 25,
			resource: 'seed'
		}
	];

	var data = {
		resources: [],
		buildings: []
	};

	return {

		getResources: function() {
			return resources;
		},

		getBuildings: function() {
			return buildings;
		},

		getData: function() {
			return data;
		},

		getSingleData: function(name, type) {
			for(var i = 0; i < data[type].length; i++) {
				if(data[type][i].name === name) {
					return data[type][i];
				}
			}
		},

	};

})();


var dataController = (function(db) {

	var Resource = function(params) {
		this.num = params.num || 0;
		this.name = params.name;
		this.totalProd = params.totalProd || 0;
		db.getData().resources.push(this);
		// db.getData().resources.shift();
	};

	Resource.prototype.increment = function() {
		this.num++;
	};

	Resource.prototype.calcProd = function(prod) {
		this.totalProd += prod;
	};

	Resource.prototype.produce = function() {
		this.num += (this.totalProd / 100);
	};

	var Building = function(params) {
		this.name = params.name;
		this.production = params.production;
		this.resource = params.resource;
		this.initCost = params.initCost;
		this.cost = params.cost || params.initCost;
		this.num = params.num || 0;
		db.getData().buildings.push(this);
		// db.getData().buildings.shift();
	};

	Building.prototype.calculateCost = function() {
		this.cost = Math.floor(this.initCost * Math.pow(1.1, this.num));
	};

	return {

		instantiateResources: function() {
			var newResource, resources;
			
			resources = db.getResources();

			for(var i = 0; i < resources.length; i++) {
				newResource = new Resource(resources[i]);
			}
		},

		instantiateBuildings: function() {
			var newBuilding, buildings;

			buildings = db.getBuildings();

			for(var i = 0; i < buildings.length; i++) {
				newBuilding = new Building(buildings[i]);
			}
		},

		checkPrices: function(building) {
			var data = db.getData();

			for(var x = 0; x < data.resources.length; x++) {
				if(building.resource === data.resources[x].name) {
					if(data.resources[x].num >= building.cost) {
						return true;
					} else {
						return false;
					}
				}
			}
		},

		prodResources: function() {
			var data = db.getData();

			for(var i = 0; i < data.resources.length; i++) {
				data.resources[i].produce();
			}
		},

		incResource: function(resource) {
			resource.increment();
			return resource.num;
		},

		buyBuilding: function(building, resource) {
			if(resource.num >= building.cost) {
				resource.num -= building.cost;
				building.num++;
				resource.calcProd(building.production);
				building.calculateCost();
				return {
					building: building,
					resource: resource
				}
			} else {
				return 'Not enough resources!';
			}
		},

		saveData: function() {
			localStorage.setItem('save', JSON.stringify(db.getData()));
		},

		loadData: function() {
			var loadedData, loadedResource, loadedBuilding;

			if(localStorage.getItem('save') !== null) {
				loadedData = JSON.parse(localStorage.getItem('save'));

				for(var i = 0; i < loadedData.resources.length; i++) {
					loadedResource = loadedData.resources[i];

					loadedResource = new Resource({
						name: loadedResource.name,
						totalProd: loadedResource.totalProd,
						num: loadedResource.num
					});
					db.getData().resources.shift();
				}

				for(var i = 0; i < loadedData.buildings.length; i++) {
					loadedBuilding = loadedData.buildings[i];

					loadedBuilding = new Building({
						name: loadedBuilding.name,
						production: loadedBuilding.production,
						resource: loadedBuilding.resource,
						initCost: loadedBuilding.initCost,
						cost: loadedBuilding.cost,
						num: loadedBuilding.num
					});
					db.getData().buildings.shift();
				}
			}
		},

		deleteData: function() {
			localStorage.removeItem('save');
		}
	};

})(dataBase);


var UIController = (function() {

	var messageUI = '<div class="alert alert-%type%" id="%name%--message">%message%</div>';

	var resourceStatUI = '<div class="col-md-2"><div class="card"><div class="card-body text-center"><h5>%listName%s:</h5><h1 id="%id%--listnum">%num%</h1><h6>(<span id="%idprod%--prod">%prod%</span> / s)</h6></div></div></div>';

	var buildingStatUI = '<div class="col-md-2"><div class="card"><div class="card-body text-center"><h5>%listName%s:</h5><h1 id="%id%--listnum">%num%</h1></div></div></div>';

	var resourceUI = '<div class="col-md-3"><div class="card"><div class="card-body"><h5 class="card-title">%name%s</h5><button class="btn btn-primary" id="%id%--getbtn">Get</button></div></div></div>';

	var buildingUI = '<div class="col-md-3"><div class="card"><div class="card-body"><h5 class="card-title">%name%s</h5><p class="card-text">Production: %production%<br>Cost: <span id="%idcost%--cost">%cost%</span> %resource%s</p><button class="btn btn-primary" id="%id%--getbtn">Buy</button></div></div></div>';

	return {
		generateUI: function(data, type) {
			var cardHtml, listHTML, dataName, dataNameUpper;

			dataName = data.name;
			dataNameUpper = dataName[0].toUpperCase() + dataName.substr(1);

			if(type === 'resource') {
				listHTML = resourceStatUI.replace('%listName%', dataNameUpper);
				listHTML = listHTML.replace('%id%', dataName);
				listHTML = listHTML.replace('%num%', data.num);
				listHTML = listHTML.replace('%idprod%', dataName);
				listHTML = listHTML.replace('%prod%', data.totalProd);

				cardHtml = resourceUI.replace('%name%', dataNameUpper);
				cardHtml = cardHtml.replace('%id%', dataName);

				document.querySelector('#resources--container').insertAdjacentHTML('beforeend', cardHtml);
				document.querySelector('#resources--list').insertAdjacentHTML('beforeend', listHTML);

			} else {
				listHTML = buildingStatUI.replace('%listName%', dataNameUpper);
				listHTML = listHTML.replace('%id%', dataName);
				listHTML = listHTML.replace('%num%', data.num);

				cardHtml = buildingUI.replace('%name%', dataNameUpper);
				cardHtml = cardHtml.replace('%id%', dataName);
				cardHtml = cardHtml.replace('%production%', data.production);
				cardHtml = cardHtml.replace('%idcost%', dataName);
				cardHtml = cardHtml.replace('%cost%', data.cost);
				cardHtml = cardHtml.replace('%resource%', data.resource);

				document.querySelector('#buildings--container').insertAdjacentHTML('beforeend', cardHtml);
				document.querySelector('#buildings--list').insertAdjacentHTML('beforeend', listHTML);	
			}
		},

		updateResourceUI: function(resource) {
			document.querySelector('#' + resource.name + '--listnum').innerHTML = Math.floor(resource.num);
			document.querySelector('#' + resource.name + '--prod').innerHTML = Math.floor(resource.totalProd);
		},

		updateBuildingUI: function(building) {
			document.querySelector('#' + building.name + '--listnum').innerHTML = building.num;
			document.querySelector('#' + building.name + '--cost').innerHTML = building.cost;
		},

		buildingAvailability: function(building, isAffordable) {
			if(isAffordable) {
				document.querySelector('#' + building.name + '--getbtn').removeAttribute('disabled', '');
			} else {
				document.querySelector('#' + building.name + '--getbtn').setAttribute('disabled', '');
			}
		},

		generateMessage: function(type, message, name) {
			var msgHtml;

			msgHtml = messageUI.replace('%type%', type);
			msgHtml = msgHtml.replace('%name%', name);
			msgHtml = msgHtml.replace('%message%', message);

			document.querySelector('#message--container').insertAdjacentHTML('afterbegin', msgHtml);

			setTimeout(function() {
				document.querySelector('#message--container').removeChild(document.querySelector('#' + name + '--message'));
			}, 3000);
		}
	};

})();


var mainController = (function(dataCtrl, UICtrl, db) {

	// INITIALIZATION FUNCTIONS

	// Instantiate data from the 'database'
	var instantiateData = function() {
		dataCtrl.instantiateResources();
		dataCtrl.instantiateBuildings();
	};

	// Set Event Listeners for non-dynamic buttons
	var setEventListener = function() {

		// manual save button
		document.querySelector('#save--btn').addEventListener('click', saveGame);

		// delete save button
		document.querySelector('#delete--btn').addEventListener('click', deleteGame);
	};

	var saveGame = function() {
		dataCtrl.saveData();
		UICtrl.generateMessage('success', 'Game saved.', 'save');
	};

	var deleteGame = function() {
		dataCtrl.deleteData();
		UICtrl.generateMessage('danger', 'Saved game deleted.', 'delete');
	}

	// load data from local storage
	var loadGame = function() {
		try {
			dataCtrl.loadData();
		}
		catch(e) {
			console.log(e);
		}
	};

	// load and generate building data
	var loadBuildingsData = function() {
		var buildings;

		// 1. Get Buildings Data
		buildings = db.getData().buildings;

		for(var i = 0; i < buildings.length; i++) {

			// 2. Generate UI
			UICtrl.generateUI(buildings[i], 'building');

			// 3. Set Event Listeners
			document.querySelector('#' + buildings[i].name + '--getbtn').addEventListener('click', buyBuilding); 
		}
	};

	// load and generate resources data
	var loadResourcesData = function() {
		var resources;

		// 1. Get Resources Data
		resources = db.getData().resources;

		for(var i = 0; i < resources.length; i++) {

			// 2. Generate Resource UI
			UICtrl.generateUI(resources[i], 'resource');

			// 3. Set Event Listeners
			document.querySelector('#' + resources[i].name + '--getbtn').addEventListener('click', incrementResource);
		}	
	};

	// set the game loop
	var setLoop = function() {
		var resources, buildings, isAffordable, totalSec;

		resources = db.getData().resources;
		buildings = db.getData().buildings;
		totalSec = 0;

		window.setInterval(function() {
			totalSec += 10;

			// increment all resources depending on total production every sec
			dataCtrl.prodResources();

			//update UI
			for(var i = 0; i < resources.length; i++) {
				UICtrl.updateResourceUI(resources[i]);
			}

			// constantly check for prices, enable building button if price is met
			for(var i = 0; i < buildings.length; i++) {
				isAffordable = dataCtrl.checkPrices(buildings[i]);
				UICtrl.buildingAvailability(buildings[i], isAffordable);
			}

			// autosave every minute
			if(totalSec === 60000) {
				saveGame();
				totalSec = 0;
			}

		}, 10);
	};

	// GAME FUNCTIONS

	// helper function to for parsing listener events
	var parseEvent = function(event) {
		var name;

		name = event.originalTarget.attributes.id.textContent;
		name = name.replace('--getbtn', '');
		return name;
	};

	// for incrementing resources
	var incrementResource = function(event) {
		var resourceName, resource, currNum;

		resourceName = parseEvent(event);
		resource = db.getSingleData(resourceName, 'resources');

		// 1. Add 1 to current number of resource
		currNum = dataCtrl.incResource(resource);

		// 2. Update UI
		UICtrl.updateResourceUI(resource);
	};

	// for buying buildings
	var buyBuilding = function(event) {
		var buildingName, building, resource, result;

		// parse event to determine specific building
		buildingName = parseEvent(event);

		// get single building data from event
		building = db.getSingleData(buildingName, 'buildings');

		// get the required resource data
		resource = db.getSingleData(building.resource, 'resources');

		// building buying process(calculation of costs, recalculations, etc.)
		result = dataCtrl.buyBuilding(building, resource);

		// update UI
		UICtrl.updateResourceUI(result.resource);
		UICtrl.updateBuildingUI(result.building);
	};

	return {
		init: function() {
			// dataButton();
			instantiateData();
			loadGame();
			loadResourcesData();
			loadBuildingsData();
			setLoop();
			setEventListener();
		}
	};

})(dataController, UIController, dataBase);

mainController.init();