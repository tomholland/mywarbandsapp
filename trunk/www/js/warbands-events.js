var warbandsEvents = [];
var warbandsEventsLawnchair;

function loadWarbandsEvents() {
	warbandsEventsLawnchair = new Lawnchair({adapter:'dom', name:'warbandsevents'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsEvents.push({name: record.name, rice: record.rice});
			});
		});
	});
}

function saveWarbandsEventIfNew(warbandsEventsName, warbandsEventsRice, callback) {
	var found = false;
	$.each(warbandsEvents, function(index, warbandsEvents) {
		if (warbandsEvents.name.toLowerCase() == warbandsEventsName.toLowerCase() && warbandsEvents.rice == warbandsEventsRice) found = true;
	});
	if (found) {
		callback();
		return;
	}
	var warbandsEvents = {name: warbandsEventsName, rice: warbandsEventsRice};
	warbandsEventsLawnchair.save(
		warbandsEvents,
		function(record) {
			warbandsEvents.push(warbandsEvents);
			warbandsEvents.sort(sortObjectArrayByObjectNameProperty);
			callback();
		}
	);
}