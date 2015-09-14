var warbandsCharacterEnhancements = null;
var warbandsCharacterEnhancementsLawnchair;

function loadWarbandsCharacterEnhancements(callback) {
	if (warbandsCharacterEnhancements !== null) {
		if (callback !== null) {
			callback();
		}
		return;
	}
	warbandsCharacterEnhancements = [];
	warbandsCharacterEnhancementsLawnchair = new Lawnchair({adapter:'dom', name:'warbandscharacterenhancements'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsCharacterEnhancements.push({name: record.name, rice: record.rice});
			});
		});
		if (callback !== null) {
			callback();
		}
	});
}

function saveWarbandsCharacterEnhancementIfNew(warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice, callback) {
	warbandsCharacterEnhancements.forEach(function(warbandsCharacterEnhancement) {
		if (warbandsCharacterEnhancement.name.toLowerCase() === warbandsCharacterEnhancementName.toLowerCase() &&
			warbandsCharacterEnhancement.rice === warbandsCharacterEnhancementRice) {
			if (callback !== null) {
				callback();
			}
			return;
		}
	});
	var warbandsCharacterEnhancement = {name: warbandsCharacterEnhancementName, rice: warbandsCharacterEnhancementRice};
	warbandsCharacterEnhancementsLawnchair.save(
		warbandsCharacterEnhancement,
		function(record) {
			warbandsCharacterEnhancements.push(warbandsCharacterEnhancement);
			if (callback !== null) {
				callback();
			}
		}
	);
}