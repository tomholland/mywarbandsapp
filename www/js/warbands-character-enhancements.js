var warbandsCharacterEnhancements = null;
var warbandsCharacterEnhancementsLawnchair;

function loadWarbandsCharacterEnhancements(callback) {
	if (warbandsCharacterEnhancements !== null) {
		callback();
		return;
	}
	warbandsCharacterEnhancements = [];
	warbandsCharacterEnhancementsLawnchair = new Lawnchair({adapter:'dom', name:'warbandscharacterenhancements'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsCharacterEnhancements.push({name: record.name, rice: record.rice});
			});
		});
		callback();
	});
}

function saveWarbandsCharacterEnhancementIfNew(warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice, callback) {
	var found = false;
	warbandsCharacterEnhancements.forEach(function(warbandsCharacterEnhancement) {
		if (warbandsCharacterEnhancement.name.toLowerCase() === warbandsCharacterEnhancementName.toLowerCase() && warbandsCharacterEnhancement.rice === warbandsCharacterEnhancementRice) {
			found = true;
		}
	});
	if (found) {
		callback();
		return;
	}
	var warbandsCharacterEnhancement = {name: warbandsCharacterEnhancementName, rice: warbandsCharacterEnhancementRice};
	warbandsCharacterEnhancementsLawnchair.save(
		warbandsCharacterEnhancement,
		function(record) {
			warbandsCharacterEnhancements.push(warbandsCharacterEnhancement);
			warbandsCharacterEnhancements.sort(sortObjectArrayByObjectNameProperty);
			callback();
		}
	);
}