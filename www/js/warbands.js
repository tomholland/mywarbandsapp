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
				warbands['id_'+warband.id] = warband;
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
	this.characters = [];
	this.lastModified = null;
}

Warband.prototype.addCharacter = function(character) {
	this.characters.push(character);
}

Warband.prototype.removeCharacter = function(characterIndex) {
	this.characters.splice(characterIndex, 1);
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