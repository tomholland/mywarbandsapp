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
	this.riceLimit = null;
	this.characters = {};
	this.events = {};
	this.terrain = {};
	this.lastModified = null;
}

Warband.prototype.rice = function() {
	var rice = 0;
	for (var warbandCharacterID in this.characters) {
		rice += staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice;
		for (var warbandCharacterEnhancementID in this.characters[warbandCharacterID].enhancements) {
			rice += this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID].rice;
		}
	}
	for (var warbandEventID in this.events) {
		rice += this.events[warbandEventID].rice;
	}
	for (var warbandTerrainItemID in this.terrain) {
		rice += this.terrain[warbandTerrainItemID].rice;
	}
	return rice;
}

Warband.prototype.mustacheData = function() {
	var mustacheData = {
		'faction': staticData.factions[this.faction].name,
		'characters': [],
		'events': [],
		'terrain': [],
		'total': 0
	};
	for (var warbandCharacterID in this.characters) {
		var warbandCharacter = {
			'name': staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].name,
			'baseRice': staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice,
			'rice': 0,
			'enhancements': []
		};
		warbandCharacter.rice += warbandCharacter.baseRice;
		for (var warbandCharacterEnhancementID in this.characters[warbandCharacterID].enhancements) {
			warbandCharacter.enhancements.push(this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID]);
			warbandCharacter.rice += this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID].rice
		}
		mustacheData.characters.push(warbandCharacter);
		mustacheData.total += warbandCharacter.rice;
	}
	for (var warbandEventID in this.events) {
		mustacheData.events.push(this.events[warbandEventID]);
		mustacheData.total += this.events[warbandEventID].rice;
	}
	for (var warbandTerrainItemID in this.terrain) {
		mustacheData.terrain.push(this.terrain[warbandTerrainItemID]);
		mustacheData.total += this.terrain[warbandTerrainItemID].rice;
	}
	return mustacheData;
}

Warband.prototype.addCharacter = function(factionCharacterID) {
	this.characters[generateUUID()] = {'factionCharacterID': factionCharacterID, 'enhancements': {}};
}

Warband.prototype.getCharacterID = function(warbandCharacterID) {
	return this.characters[warbandCharacterID].factionCharacterID;
}

Warband.prototype.getCharacterName = function(warbandCharacterID) {
	return staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].name;
}

Warband.prototype.characterRiceDetail = function(warbandCharacterID) {
	var enhancementsRiceTotal = 0;
	for (var warbandCharacterEnhancementID in this.characters[warbandCharacterID].enhancements) {
		enhancementsRiceTotal += this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID].rice;
	}
	if (enhancementsRiceTotal == 0) return ((staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice == 0) ? '-':staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice);
	return (staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice + enhancementsRiceTotal)+' ('+((staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice == 0) ? '-':staticData.factions[this.faction].characters[this.characters[warbandCharacterID].factionCharacterID].rice)+'+'+enhancementsRiceTotal+'e)';
}

Warband.prototype.removeCharacter = function(warbandCharacterID) {
	delete this.characters[warbandCharacterID];
}

Warband.prototype.addCharacterEnhancement = function(warbandCharacterID, name, rice) {
	this.characters[warbandCharacterID].enhancements[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.getCharacterEnhancement = function(warbandCharacterID, warbandCharacterEnhancementID) {
	return this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID];
}

Warband.prototype.removeCharacterEnhancement = function(warbandCharacterID, warbandCharacterEnhancementID) {
	delete this.characters[warbandCharacterID].enhancements[warbandCharacterEnhancementID];
}

Warband.prototype.addEvent = function(name, rice) {
	this.events[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.getEvent = function(warbandEventID) {
	return this.event[warbandEventID];
}

Warband.prototype.removeEvent = function(warbandEventID) {
	delete this.events[warbandEventID];
}

Warband.prototype.addTerrainItem = function(name, rice) {
	this.terrain[generateUUID()] = {'name': name, 'rice': rice};
}

Warband.prototype.getTerrainItem = function(warbandTerrainItemID) {
	return this.terrain[warbandTerrainItemID];
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