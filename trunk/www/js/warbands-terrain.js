var warbandsTerrain = [];
var warbandsTerrainLawnchair;

function loadWarbandsTerrain() {
	warbandsTerrainLawnchair = new Lawnchair({adapter:'dom', name:'warbandsterrain'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsTerrain.push({name: record.name, rice: record.rice});
			});
		});
	});
}

function saveWarbandsTerrainItemIfNew(warbandsTerrainItemName, warbandsTerrainItemRice, callback) {
	var found = false;
	$.each(warbandsTerrain, function(index, warbandsTerrainItem) {
		if (warbandsTerrainItem.name.toLowerCase() == warbandsTerrainItemName.toLowerCase() && warbandsTerrainItem.rice == warbandsTerrainItemRice) {
			found = true;
		}
	});
	if (found) {
		callback();
		return;
	}
	var warbandsTerrainItem = {name: warbandsTerrainItemName, rice: warbandsTerrainItemRice};
	warbandsTerrainLawnchair.save(
		warbandsTerrainItem,
		function(record) {
			warbandsTerrain.push(warbandsTerrainItem);
			warbandsTerrain.sort(sortObjectArrayByObjectNameProperty);
			callback();
		}
	);
}