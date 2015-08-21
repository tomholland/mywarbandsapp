var warbandsEvents = null;
var warbandsEventsLawnchair;

function loadWarbandsEvents(callback) {
	if (warbandsEvents !== null) {
		callback();
		return;
	}
	warbandsEvents = [];
	warbandsEventsLawnchair = new Lawnchair({adapter:'dom', name:'warbandsevents'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				warbandsEvents.push({name: record.name, rice: record.rice});
			});
		});
		callback();
	});
}

function saveWarbandsEventIfNew(warbandsEventName, warbandsEventRice, callback) {
	var found = false;
	warbandsEvents.forEach(function(warbandsEvent) {
		if (warbandsEvent.name.toLowerCase() === warbandsEventName.toLowerCase() && warbandsEvent.rice === warbandsEventRice) {
			found = true;
		}
	});
	if (found) {
		callback();
		return;
	}
	var warbandsEvent = {name: warbandsEventName, rice: warbandsEventRice};
	warbandsEventsLawnchair.save(
		warbandsEvent,
		function(record) {
			warbandsEvents.push(warbandsEvent);
			warbandsEvents.sort(sortObjectArrayByObjectNameProperty);
			callback();
		}
	);
}