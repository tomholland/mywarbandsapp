var characterEnhancements = [];
var characterEnhancementsLawnchair;

function loadCharacterEnhancements() {
	characterEnhancementsLawnchair = new Lawnchair({adapter:'dom', name:'characterenhancements'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				characterEnhancements.push({name: record.name, rice: record.rice});
			});
		});
	});
}

function saveCharacterEnhancementIfNew(characterEnhancementName, characterEnhancementRice, callback) {
	var found = false;
	$.each(characterEnhancements, function(index, characterEnhancement) {
		if (characterEnhancement.name.toLowerCase() == characterEnhancementName.toLowerCase() && characterEnhancement.rice == characterEnhancementRice) found = true;
	});
	if (found) {
		callback();
		return;
	}
	var characterEnhancement = {name: characterEnhancementName, rice: characterEnhancementRice};
	characterEnhancementsLawnchair.save(
		characterEnhancement,
		function(record) {
			characterEnhancements.push(characterEnhancement);
			characterEnhancements.sort(sortObjectArrayByObjectNameProperty);
			callback();
		}
	);
}