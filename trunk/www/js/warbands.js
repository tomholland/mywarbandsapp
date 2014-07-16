var warbands = {};
var warbandsLawnchair;

function loadWarbands(callback) {
	warbandsLawnchair = new Lawnchair({adapter:'dom', name:'warbands'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				var warband = new Warband();
				for (var prop in record.data) {
					warband[prop] = record.data[prop];
				}
				warbands[warband.id] = warband;
			});
		});
	});
	callback();
}

function Warband() {
	this.id = null;
	this.name = null;
	this.faction = null;
	this.rice = null;
	this.characters = {};
	this.events = {};
	this.terrain = {};
	this.lastModified = null;
}

Warband.prototype.addCharacter = function(factionCharacterID) {
	this.characters[generateUUID()] = {'factionCharacterID': factionCharacterID, 'enhancements': {}};
}

Warband.prototype.removeCharacter = function(warbandCharacterID) {
	delete this.characters[warbandCharacterID];
}

Warband.prototype.addCharacterEnhancement = function(warbandCharacterID, name, rice) {
	this.characters[warbandCharacterID].enhancements[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.removeCharacterEnhancement = function(warbandCharacterID, warbandCharacterEnhancementID) {
	delete this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID];
}

Warband.prototype.addEvent = function(name, rice) {
	this.events[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.removeEvent = function(warbandEventID) {
	delete this.events[warbandEventID];
}

Warband.prototype.addTerrainItem = function(name, rice) {
	this.terrain[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.removeTerrainItem = function(warbandTerrainItemID) {
	delete this.terrain[warbandTerrainItemID];
}

Warband.prototype.save = function(callback) {
	this.lastModified = new Date().toISOString();
	var dataObj = {};
	for (var prop in this) {
		dataObj[prop] = this[prop];
	}
	warbandsLawnchair.save(
		{key: this.id, data: dataObj},
		function(record) {
			callback();
		}
	);
}

Warband.prototype.delete = function(callback) {
	if (this.id === null) return;
	warbandsLawnchair.remove(this.id, function() {
		callback();
	});
}