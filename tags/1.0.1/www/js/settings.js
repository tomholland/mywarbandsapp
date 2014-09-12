var settings = {};
var settingsLawnchair;

function loadSettings(callback) {
	settingsLawnchair = new Lawnchair({adapter:'dom', name:'settings'}, function(store) {
		store.all(function(records) {
			records.forEach(function(record) {
				settings[record.key] = new Setting(record.key, record.value);
			});
		});
	});
	callback();
}

function Setting(id, enabled) {
	this.id = id;
	this.enabled = enabled;
}

function settingIsEnabled(id) {
	if (!settings.hasOwnProperty(id)) {
		settings[id] = new Setting(id, ($('#'+id).attr('data-default') === 'enabled'));
	}
	return settings[id].enabled;
}

Setting.prototype.save = function(enabled, callback) {
	this.enabled = enabled;
	settingsLawnchair.save({key: this.id, value: this.enabled}, function(record) {
		callback(record);
	});
}