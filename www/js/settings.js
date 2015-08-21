var settings = null;
var settingsLawnchair;

function loadSettings(callback) {
	if (settings !== null) {
		callback();
		return;
	}
	settings = {};
	settingsLawnchair = new Lawnchair({adapter:'dom', name:'settings'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				settings[record.key] = new Setting(record.key, record.value);
			});
		});
		callback();
	});
}

function Setting(id, enabled) {
	this.id = id;
	this.enabled = enabled;
}

function settingIsEnabled(id, defaultState) {
	if (!settings.hasOwnProperty(id)) {
		settings[id] = new Setting(id, (defaultState === 'enabled'));
	}
	return settings[id].enabled;
}

Setting.prototype.save = function(enabled, callback) {
	this.enabled = enabled;
	settingsLawnchair.save({key: this.id, value: this.enabled}, function(record) {
		if (callback !== null) {
			callback(record);
		}
	});
}