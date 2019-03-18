var dataBase = (function() {

	var resourcesBase = [
		{
			name: 'seed'
		},
	];

	var buildingsBase = [
		{
			name: 'plant',
			production: 1,
			initCost: 10,
			resource: 'seed',
			upgrades: [
			]
		},
		{
			name: 'tree',
			production: 5,
			initCost: 25,
			resource: 'seed'
		}
	];

	var upgradesBase = [
		{
			name: 'UpgradeOne',
			building: 'plant',
			resource: 'seed',
			upgrade: 2,
			req: 10,
			cost: 100,
			desc: '+100% production'
		},
		{
			name: 'UpgradeTwo',
			building: 'plant',
			resource: 'seed',
			upgrade: 4,
			req: 20,
			cost: 200,
			desc: '+100% production'
		}
	];

	var data = {
		resources: [],
		buildings: [],
		upgrades: []
	};

	return {

		getResources: function() {
			return resourcesBase;
		},

		getBuildings: function() {
			return buildingsBase;
		},

		getUpgrades: function() {
			return upgradesBase;
		},

		getData: function() {
			return data;
		},

		// DO NOT IMPLEMENT YET
		resetData: function() {
			data = {
				resources: [],
				buildings: []
			}
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
	};

	Building.prototype.calculateCost = function() {
		this.cost = Math.floor(this.initCost * Math.pow(1.1, this.num));
	};

	Building.prototype.checkPrice = function() {
		var resource = db.getSingleData(this.resource, 'resources');

		if(resource.num >= this.cost) {
			return true;
		} else {
			return false;
		}
	};

	Building.prototype.buyBuilding = function(resource) {
		if(resource.num >= this.cost) {
			resource.num -= this.cost;
			this.num++;
			resource.calcProd(this.production);
			this.calculateCost();
			return {
				resource: resource,
				building: this
			}
		} else {
			return 'Not Enough Resources!';
		}
	};

	var Upgrade = function(params) {
		this.name = params.name;
		this.building = params.building;
		this.resource = params.resource;
		this.upgrade = params.upgrade;
		this.req = params.req;
		this.cost = params.cost;
		this.desc = params.desc;
		this.isBought = false;

		db.getData().upgrades.push(this);
	};

	Upgrade.prototype.buyUpgrade = function(resource, building) {
		if(resource.num >= this.cost) {
			resource.num -= this.cost;
			resource.totalProd *= this.upgrade;
			building.production *= this.upgrade;
			this.isBought = true;

			return {
				resource: resource,
				building: building
			}
		} else {
			return 'Not Enough Resources!';
		}
	};

	Upgrade.prototype.checkReq = function() {
		var building = db.getSingleData(this.building, 'buildings');

		if(building.num >= this.req) {
			return true;
		} else {
			return false;
		}
	};

	Upgrade.prototype.checkPrice = function() {
		var resource = db.getSingleData(this.resource, 'resources');

		if(resource.num >= this.cost) {
			return true;
		} else {
			return false;
		}
	}

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

		instantiateUpgrades: function() {
			var newUpgrade, upgrades;

			upgrades = db.getUpgrades();

			for(var i = 0; i < upgrades.length; i++) {
				newUpgrade = new Upgrade(upgrades[i]);
			}
		},

		prodResources: function() {
			var data = db.getData();

			for(var i = 0; i < data.resources.length; i++) {
				data.resources[i].produce();
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

	var containers = {
		resources: document.querySelector('#resources--container'),
		resourcesList: document.querySelector('#resources--list'),
		buildings: document.querySelector('#buildings--container'),
		buildingsList: document.querySelector('#buildings--list'),
		messages: document.querySelector('#message--container'),
		upgrades: document.querySelector('#upgrades--container')
	};

	var messageUI = '<div class="alert alert-%type%" id="%name%--message">%message%</div>';

	var resourceStatUI = '<div class="col-md-2" id="%id%--list"><div class="card"><div class="card-body text-center"><h5>%listName%s:</h5><h1 id="%idlist%--listnum">%num%</h1><h6>(<span id="%idprod%--prod">%prod%</span> / s)</h6></div></div></div>';

	var buildingStatUI = '<div class="col-md-2" id="%id%--list"><div class="card"><div class="card-body text-center"><h5>%listName%s:</h5><h1 id="%idnum%--listnum">%num%</h1></div></div></div>';

	var resourceUI = '<div class="col-md-3" id="%id%--get"><div class="card"><div class="card-body"><h5 class="card-title">%name%s</h5><button class="btn btn-primary" id="%idbuy%--getbtn">Get</button></div></div></div>';

	var buildingUI = '<div class="col-md-3" id="%id%--get"><div class="card"><div class="card-body"><h5 class="card-title">%name%s</h5><p class="card-text">Production: <span id="%idprod%--prod">%production%</span><br>Cost: <span id="%idcost%--cost">%cost%</span> %resource%s</p><button class="btn btn-primary" id="%idbuy%--getbtn">Buy</button></div></div></div>';

	var upgradesUI = '<div class="col-md-3 invisible--upgrade" id="%idname%--get"><div class="card" ><div class="card-body"><p class="card-text">%desc%<br>Cost: %cost% %buildingResource%s</p><button class="btn btn-success" id="%idbuy%--getbtn">%name%</button></div></div></div>';

	return {
		generateUI: function(data, type) {
			var cardHtml, listHTML, dataName, dataNameUpper;

			dataName = data.name;
			dataNameUpper = dataName[0].toUpperCase() + dataName.substr(1);

			if(type === 'resource') {
				listHTML = resourceStatUI.replace('%listName%', dataNameUpper);
				listHTML = listHTML.replace('%id%', dataName);
				listHTML = listHTML.replace('%idlist%', dataName);
				listHTML = listHTML.replace('%idprod%', dataName);
				listHTML = listHTML.replace('%num%', data.num);
				listHTML = listHTML.replace('%prod%', data.totalProd);

				cardHtml = resourceUI.replace('%name%', dataNameUpper);
				cardHtml = cardHtml.replace('%id%', dataName);
				cardHtml = cardHtml.replace('%idbuy%', dataName);

				containers.resources.insertAdjacentHTML('beforeend', cardHtml);
				containers.resourcesList.insertAdjacentHTML('beforeend', listHTML);

			} else if(type === 'building') {
				listHTML = buildingStatUI.replace('%listName%', dataNameUpper);
				listHTML = listHTML.replace('%id%', dataName);
				listHTML = listHTML.replace('%idnum%', dataName);
				listHTML = listHTML.replace('%num%', data.num);

				cardHtml = buildingUI.replace('%name%', dataNameUpper);
				cardHtml = cardHtml.replace('%id%', dataName);
				cardHtml = cardHtml.replace('%idcost%', dataName);
				cardHtml = cardHtml.replace('%idbuy%', dataName);
				cardHtml = cardHtml.replace('%idprod%', dataName);
				cardHtml = cardHtml.replace('%production%', data.production);
				cardHtml = cardHtml.replace('%cost%', data.cost);
				cardHtml = cardHtml.replace('%resource%', data.resource);

				containers.buildings.insertAdjacentHTML('beforeend', cardHtml);
				containers.buildingsList.insertAdjacentHTML('beforeend', listHTML);

			} else {

				upgradeHtml = upgradesUI.replace('%idname%', data.name);
				upgradeHtml = upgradeHtml.replace('%desc%', data.desc);
				upgradeHtml = upgradeHtml.replace('%cost%', data.cost);
				upgradeHtml = upgradeHtml.replace('%buildingResource%', data.resource);
				upgradeHtml = upgradeHtml.replace('%idbuy%', data.name);
				upgradeHtml = upgradeHtml.replace('%name%', data.name);

				containers.upgrades.insertAdjacentHTML('beforeend', upgradeHtml);

			}
		},

		updateResourceUI: function(resource) {
			document.querySelector('#' + resource.name + '--listnum').innerHTML = Math.floor(resource.num);
			document.querySelector('#' + resource.name + '--prod').innerHTML = Math.floor(resource.totalProd);
		},

		updateBuildingUI: function(building) {

			document.querySelector('#' + building.name + '--listnum').innerHTML = building.num;
			document.querySelector('#' + building.name + '--cost').innerHTML = building.cost;
			document.querySelector('#' + building.name + '--prod').innerHTML = building.production;
		},

		isClickable: function(object, isAffordable) {
			var objectDOM;

			objectDOM = document.querySelector('#' + object.name + '--getbtn');

			if(isAffordable && objectDOM !== null) {
				objectDOM.removeAttribute('disabled', '');
			} else if(objectDOM !== null) {
				objectDOM.setAttribute('disabled', '');
			}
		},

		upgradeAvailability: function(upgrade, isAvailable) {
			var upgradeHtml, upgradeDOM;

			upgradeDOM = document.querySelector('#' + upgrade.name + '--get');

			if(isAvailable && upgradeDOM !== null) {
				upgradeDOM.classList.remove('invisible--upgrade');
			} else if(upgradeDOM !== null) {
				upgradeDOM.classList.add('invisible--upgrade');
			}
		},

		removeUpgrade: function(upgrade) {
			containers.upgrades.removeChild(document.querySelector('#' + upgrade.name + '--get'));
		},

		generateMessage: function(type, message, name) {
			var msgHtml;

			msgHtml = messageUI.replace('%type%', type);
			msgHtml = msgHtml.replace('%name%', name);
			msgHtml = msgHtml.replace('%message%', message);

			containers.messages.insertAdjacentHTML('afterbegin', msgHtml);

			setTimeout(function() {
				containers.messages.removeChild(document.querySelector('#' + name + '--message'));
			}, 3000);
		},

		// DO NOT IMPLEMENT
		resetUI: function(resources, buildings) {

			for(var i = 0; i < resources.length; i++) {
				containers.resources.removeChild(document.querySelector('#' + resources[i].name + '--get'));
				containers.resourcesList.removeChild(document.querySelector('#' + resources[i].name + '--list'));
			}

			for(var i = 0; i < buildings.length; i++) {
				containers.buildings.removeChild(document.querySelector('#' + buildings[i].name + '--get'));
				containers.buildingsList.removeChild(document.querySelector('#' + buildings[i].name + '--list'));
			}
		}
	};

})();


var mainController = (function(dataCtrl, UICtrl, db) {

	// INITIALIZATION FUNCTIONS

	// Instantiate data from the 'database'
	var instantiateData = function() {
		dataCtrl.instantiateResources();
		dataCtrl.instantiateBuildings();
		dataCtrl.instantiateUpgrades();
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

	var loadUpgradesData = function() {
		var upgrades;

		upgrades = db.getData().upgrades;

		for(var i = 0; i < upgrades.length; i++) {
			UICtrl.generateUI(upgrades[i], 'upgrade');

			document.querySelector('#' + upgrades[i].name + '--getbtn').addEventListener('click', buyUpgrade);
		}
	}

	// set the game loop
	var setLoop = function() {
		var resources, buildings, upgrades, isAffordable, isAvailable, totalSec;

		resources = db.getData().resources;
		buildings = db.getData().buildings;
		upgrades = db.getData().upgrades;
		totalSec = 0;

		window.setInterval(function() {
			totalSec += 10;

			for(var i = 0; i < resources.length; i++) {
				resources[i].produce();
				UICtrl.updateResourceUI(resources[i]);
			}

			// constantly check for prices, enable building button if price is met
			for(var i = 0; i < buildings.length; i++) {
				isAffordable = buildings[i].checkPrice();
				UICtrl.isClickable(buildings[i], isAffordable);
			}

			for(var i = 0; i < upgrades.length; i++) {
				isAvailable = upgrades[i].checkReq();
				UICtrl.upgradeAvailability(upgrades[i], isAvailable);

				isAffordable = upgrades[i].checkPrice();
				UICtrl.isClickable(upgrades[i], isAffordable);
			}

			// autosave every minute
			if(totalSec === 60000) {
				saveGame();
				totalSec = 0;
			}

		}, 10);
	};

	// Save game
	var saveGame = function() {
		dataCtrl.saveData();
		UICtrl.generateMessage('success', 'Game saved.', 'save');
	};

	// Delete game
	var deleteGame = function() {
		dataCtrl.deleteData();
		UICtrl.generateMessage('danger', 'Saved game deleted.', 'delete');
	};

	// DO NOT IMPLEMENT
	// Reset game
	// var resetGame = function() {
	// 	UICtrl.resetUI(db.getData().resources, db.getData().buildings);
	// 	db.resetData();
	// 	instantiateData();
	// 	// loadResourcesData();
	// 	// loadBuildingsData();
	// 	// setLoop();
	// };

	// Set Event Listeners for non-dynamic buttons
	var setEventListener = function() {

		// manual save button
		document.querySelector('#save--btn').addEventListener('click', saveGame);

		// delete save button
		document.querySelector('#delete--btn').addEventListener('click', deleteGame);

		// DO NOT IMPLEMENT
		// reset game button
		// document.querySelector('#reset--btn').addEventListener('click', resetGame);
	};

	// load data from local storage
	var loadGame = function() {
		try {
			dataCtrl.loadData();
		}
		catch(e) {
			console.log(e);
		}
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
		var resourceName, resource;

		resourceName = parseEvent(event);
		resource = db.getSingleData(resourceName, 'resources');

		// 1. Add 1 to current number of resource
		resource.increment();

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
		result = building.buyBuilding(resource);

		// update UI
		UICtrl.updateResourceUI(result.resource);
		UICtrl.updateBuildingUI(result.building);
	};

	var buyUpgrade = function(event) {
		var upgradeName, upgrade, resource, building, result;

		upgradeName = parseEvent(event);

		upgrade = db.getSingleData(upgradeName, 'upgrades');
		resource = db.getSingleData(upgrade.resource, 'resources');
		building = db.getSingleData(upgrade.building, 'buildings');

		// buy upgrade
		result = upgrade.buyUpgrade(resource, building);

		// update UI
		UICtrl.updateResourceUI(result.resource);
		UICtrl.updateBuildingUI(result.building);
		UICtrl.removeUpgrade(upgrade);
	}

	return {
		init: function() {
			// dataButton();
			instantiateData();
			loadGame();
			loadResourcesData();
			loadBuildingsData();
			loadUpgradesData();
			setLoop();
			setEventListener();
		}
	};

})(dataController, UIController, dataBase);

mainController.init();