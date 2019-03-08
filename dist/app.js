var dataController = (function() {
	var data = {
		resources: [],
		buildings: []
	};

	var Resource = function(name) {
		this.num = 0;
		this.name = name;
		this.totalProd = 0;
		data.resources.push(this);
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

	var seeds = new Resource('seed');

	var Building = function(name, production, cost, resource) {
		this.name = name;
		this.production = production;
		this.resource = resource;
		this.initCost = cost;
		this.cost = cost;
		this.num = 0;
		data.buildings.push(this);
	};

	Building.prototype.calculateCost = function() {
		this.cost = Math.floor(this.initCost * Math.pow(1.1, this.num));
	};

	var plant = new Building('plant', 1, 10, 'seed');
	var tree = new Building('tree', 5, 25, 'seed');

	return {

		checkPrices: function(building) {
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
			for(var i = 0; i < data.resources.length; i++) {
				data.resources[i].produce();
			}
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
		}
	};

})();


var UIController = (function() {

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
		}
	};

})();


var mainController = (function(dataCtrl, UICtrl) {

	var parseEvent = function(event) {
		var name;

		name = event.originalTarget.attributes.id.textContent;
		name = name.replace('--getbtn', '');
		return name;
	};

	var dataButton = function() {
		document.querySelector('#data--btn').addEventListener('click', function() {
			console.log(dataCtrl.getData());
		});
	};

	var loadBuildingsData = function() {
		var buildings;

		// 1. Get Buildings Data
		buildings = dataCtrl.getData().buildings;

		for(var i = 0; i < buildings.length; i++) {

			// 2. Generate UI
			UICtrl.generateUI(buildings[i], 'building');

			// 3. Set Event Listeners
			document.querySelector('#' + buildings[i].name + '--getbtn').addEventListener('click', buyBuilding); 
		}
	};

	var loadResourcesData = function() {
		var resources;

		// 1. Get Resources Data
		resources = dataCtrl.getData().resources;

		for(var i = 0; i < resources.length; i++) {

			// 2. Generate Resource UI
			UICtrl.generateUI(resources[i], 'resource');

			// 3. Set Event Listeners
			document.querySelector('#' + resources[i].name + '--getbtn').addEventListener('click', incrementResource);
		}	
	};

	var setLoop = function() {
		var resources, buildings, isAffordable;

		resources = dataCtrl.getData().resources;
		buildings = dataCtrl.getData().buildings;

		window.setInterval(function() {

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

		}, 10);
	};

	var incrementResource = function(event) {
		var resourceName, resource, currNum;

		resourceName = parseEvent(event);
		resource = dataCtrl.getSingleData(resourceName, 'resources');

		// 1. Add 1 to current number of resource
		currNum = dataCtrl.incResource(resource);

		// 2. Update UI
		UICtrl.updateResourceUI(resource);
	};

	var buyBuilding = function(event) {
		var buildingName, building, resource, result;

		// parse event to determine specific building
		buildingName = parseEvent(event);

		// get single building data from event
		building = dataCtrl.getSingleData(buildingName, 'buildings');

		// get the required resource data
		resource = dataCtrl.getSingleData(building.resource, 'resources');

		// building buying process(calculation of costs, recalculations, etc.)
		result = dataCtrl.buyBuilding(building, resource);

		// update UI
		UICtrl.updateResourceUI(result.resource);
		UICtrl.updateBuildingUI(result.building);
	};

	return {
		init: function() {
			dataButton();
			loadResourcesData();
			loadBuildingsData();
			setLoop();
		}
	};

})(dataController, UIController);

mainController.init();