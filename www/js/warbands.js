var warbands = null;
var warbandsLawnchair;

function loadWarbands(callback) {
	if (warbands !== null) {
		if (callback !== null) {
			callback();
		}
		return;
	}
	warbands = {};
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
		if (callback !== null) {
			callback();
		}
	});
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
	for (var warbandCharacterId in this.characters) {
		rice += staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].rice;
		for (var warbandCharacterEnhancementId in this.characters[warbandCharacterId].enhancements) {
			rice += this.characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId].rice;
		}
	}
	for (var warbandEventId in this.events) {
		rice += this.events[warbandEventId].rice;
	}
	for (var warbandTerrainItemId in this.terrain) {
		rice += this.terrain[warbandTerrainItemId].rice;
	}
	return rice;
}

Warband.prototype.addCharacter = function(factionCharacterId) {
	this.characters[generateUuid()] = {'factionCharacterID': factionCharacterId, 'enhancements': {}};
}

Warband.prototype.getFactionCharacterId = function(warbandCharacterId) {
	return this.characters[warbandCharacterId].factionCharacterID;
}

Warband.prototype.getCharacterName = function(warbandCharacterId) {
	return staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].name;
}

Warband.prototype.characterRiceDetail = function(warbandCharacterId) {
	var enhancementsRiceTotal = 0;
	for (var warbandCharacterEnhancementId in this.characters[warbandCharacterId].enhancements) {
		enhancementsRiceTotal += this.characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId].rice;
	}
	if (enhancementsRiceTotal === 0) {
		return ((staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].rice === 0) ? '-':staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].rice);
	}
	return (staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].rice + enhancementsRiceTotal)+' ('+staticData.factions[this.faction].characters[this.characters[warbandCharacterId].factionCharacterID].rice+'+'+enhancementsRiceTotal+'e)';
}

Warband.prototype.removeCharacter = function(warbandCharacterId) {
	delete this.characters[warbandCharacterId];
}

Warband.prototype.addCharacterEnhancement = function(warbandCharacterId, name, rice) {
	this.characters[warbandCharacterId].enhancements[generateUuid()] = {'name': name, 'rice': rice};
}

Warband.prototype.getCharacterEnhancement = function(warbandCharacterId, warbandCharacterEnhancementId) {
	return this.characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId];
}

Warband.prototype.removeCharacterEnhancement = function(warbandCharacterId, warbandCharacterEnhancementId) {
	delete this.characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId];
}

Warband.prototype.addEvent = function(name, rice) {
	this.events[generateUuid()] = {'name': name, 'rice': rice};
}

Warband.prototype.getEvent = function(warbandEventId) {
	return this.events[warbandEventId];
}

Warband.prototype.removeEvent = function(warbandEventId) {
	delete this.events[warbandEventId];
}

Warband.prototype.addTerrainItem = function(name, rice) {
	this.terrain[generateUuid()] = {'name': name, 'rice': rice};
}

Warband.prototype.getTerrainItem = function(warbandTerrainItemId) {
	return this.terrain[warbandTerrainItemId];
}

Warband.prototype.removeTerrainItem = function(warbandTerrainItemId) {
	delete this.terrain[warbandTerrainItemId];
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
			if (callback !== null) {
				callback();
			}
		}
	);
}

Warband.prototype.delete = function(callback) {
	if (this.id === null) return;
	warbandsLawnchair.remove(this.id, function() {
		if (callback !== null) {
			callback();
		}
	});
}