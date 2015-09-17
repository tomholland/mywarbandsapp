var warbandsTerrain = null;
var warbandsTerrainLawnchair;

function loadWarbandsTerrain(callback) {
	if (warbandsTerrain !== null) {
		if (callback !== null) {
			callback();
		}
		return;
	}
	warbandsTerrain = [];
	warbandsTerrainLawnchair = new Lawnchair({adapter:'dom', name:'warbandsterrain'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsTerrain.push({name: record.name, rice: record.rice});
			});
		});
		if (callback !== null) {
			callback();
		}
	});
}

function saveWarbandsTerrainItemIfNew(warbandsTerrainItemName, warbandsTerrainItemRice, callback) {
	var found = false;
	warbandsTerrain.forEach(function(warbandsTerrainItem) {
		if (warbandsTerrainItem.name.toLowerCase() === warbandsTerrainItemName.toLowerCase() && warbandsTerrainItem.rice === warbandsTerrainItemRice) {
			found = true;
		}
	});
	if (found) {
		if (callback !== null) {
			callback();
		}
		return;
	}
	var warbandsTerrainItem = {name: warbandsTerrainItemName, rice: warbandsTerrainItemRice};
	warbandsTerrainLawnchair.save(
		warbandsTerrainItem,
		function(record) {
			warbandsTerrain.push(warbandsTerrainItem);
			if (callback !== null) {
				callback();
			}
		}
	);
}