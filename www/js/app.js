var contentViewWidth = 0;
var currentContentViewID = null;
var backContentViewID = null;
var selectedWarbandID = null;
var selectedWarbandCharacterID = null;

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c==='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid.toUpperCase();
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function setupWarbandSwipeableListing(id) {
	var actionBlockWidth = 50;
	$('#'+id).find('.swipe-wrapper').swipeLeft(function() {
		$(this).addClass('offset');
	}).swipeRight(function() {
		$(this).removeClass('offset');
	});
	$('#'+id).find('.change-content-view').tap(function() {
		changeContentView(this);
	});
	$('#'+id).find('.action-1').css('margin-left', contentViewWidth+'px');
	$('#'+id).find('.action-2').css('margin-left', (contentViewWidth + actionBlockWidth)+'px');
	$('#'+id).find('.action-3').css('margin-left', (contentViewWidth + (actionBlockWidth * 2))+'px');
}

function sortObjectArrayByObjectNameProperty(objA, objB) {
	return alphanumCase(objA.name, objB.name);
}

function deleteWarband(warbandID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the Warband "'+warbands[warbandID].name+'"?',
		function(button) {
			if (button !== 2) {
				return;
			}
			warbands[warbandID].delete(function() {
				delete warbands[warbandID];
				drawWarbands();
			});
		},
		'Delete Warband',
		['Cancel','Delete']
	);
}

function drawWarbands() {
	var warbandsSortArray = [];
	Object.keys(warbands).forEach(function(warbandID) {
		warbandsSortArray.push({
			id: warbandID,
			name: warbands[warbandID].name
		});
	});
	if (settingIsEnabled('lexicographicalsort')) {
		warbandsSortArray.sort(sortObjectArrayByObjectNameProperty);
	}
	var html = '';
	warbandsSortArray.forEach(function(warband) {
		var warbandRice = warbands[warband.id].rice();
		html += '<li>';
			html += '<div class="swipe-wrapper actions-3">';
				html += '<a class="action-block action-1 share" data-warband-id="'+warband.id+'"><span class="icon-wrapper"><span class="icon icon-share"></span></span></a>';
				html += '<a class="action-block action-2 edit change-content-view appear-from-right" data-target-content-view-id="warband" data-warband-id="'+warband.id+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block action-3 delete" data-warband-id="'+warband.id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="warbandcharacters" data-warband-id="'+warband.id+'">';
					html += '<span class="cell image"><img src="images/factions/'+staticData.factions[warbands[warband.id].faction].image+'"></span>';
					html += '<span class="cell name">'+htmlEncode(warband.name)+'</span>';
					html += '<span class="cell rice warband"><span class="badge'+((warbandRice > warbands[warband.id].riceLimit) ? ' error':((warbandRice === warbands[warband.id].riceLimit) ? ' match':''))+'">'+warbandRice+'/'+warbands[warband.id].riceLimit+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-right"></span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	});
	$('#warbands').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbands');
	$('#warbands').find('.share').tap(function() {
		var warbandID = $(this).attr('data-warband-id');
		var params = {
			'subject': 'Bushido Warband: '+warbands[warbandID].name,
			'onSuccess': function() {
				$('#warbands').find('.swipe-wrapper.offset').removeClass('offset');
			},
			'onError': function() {
				$('#warbands').find('.swipe-wrapper.offset').removeClass('offset');
			}
		};
		if (settingIsEnabled('htmlemailsetting')) {
			params.body = Mustache.render(staticData.templates.html, warbands[warbandID].mustacheData());
			params.isHtml = true;
		} else {
			params.body = Mustache.render(staticData.templates.text, warbands[warbandID].mustacheData());
		}
		cordova.require('emailcomposer.EmailComposer').show(params);
	});
	$('#warbands').find('.delete').tap(function() {
		deleteWarband($(this).attr('data-warband-id'));
	});
}

function setWarbandContentScreenTitleAndSubNavSelection(id) {
	$('#'+id).attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
	var warbandRice = warbands[selectedWarbandID].rice();
	var warbandRiceBadge = $('#'+id).find('.warband-tabs-rice-wrapper .rice .badge');
	warbandRiceBadge.text(warbandRice+'/'+warbands[selectedWarbandID].riceLimit);
	if (warbandRice > warbands[selectedWarbandID].riceLimit) {
		warbandRiceBadge.addClass('error');
		warbandRiceBadge.removeClass('match');
	} else if (warbandRice === warbands[selectedWarbandID].riceLimit) {
		warbandRiceBadge.addClass('match');
		warbandRiceBadge.removeClass('error');
	} else {
		warbandRiceBadge.removeClass('match');
		warbandRiceBadge.removeClass('error');
	}
}

function deleteWarbandCharacter(warbandCharacterID) {
	navigator.notification.confirm(
		'Are you sure you want to delete '+warbands[selectedWarbandID].getCharacterName(warbandCharacterID)+' from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button !== 2) {
				return;
			}
			warbands[selectedWarbandID].removeCharacter(warbandCharacterID);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandCharacters();
			});
		},
		'Delete Warband character',
		['Cancel','Delete']
	);
}

function drawWarbandCharacters() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandcharacters');
	var warbandCharactersSortArray = [];
	Object.keys(warbands[selectedWarbandID].characters).forEach(function(warbandCharacterID) {
		warbandCharactersSortArray.push({
			id: warbandCharacterID,
			name: warbands[selectedWarbandID].getCharacterName(warbandCharacterID)
		});
	});
	if (settingIsEnabled('lexicographicalsort')) {
		warbandCharactersSortArray.sort(sortObjectArrayByObjectNameProperty);
	}
	var html = '';
	warbandCharactersSortArray.forEach(function(warbandCharacter) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-2">';
				html += '<a class="action-block action-1 edit change-content-view appear-from-right" data-target-content-view-id="warbandcharacter" data-warband-character-id="'+warbandCharacter.id+'"><span class="icon-wrapper"><span class="icon icon-more"></span></span></a>';
				html += '<a class="action-block action-2 delete" data-warband-character-id="'+warbandCharacter.id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction-character-'+warbands[selectedWarbandID].getCharacterID(warbandCharacter.id)+'-cards">';
					html += '<span class="cell name">'+htmlEncode(warbandCharacter.name)+'</span>';
					html += '<span class="cell rice warband-character"><span class="badge">'+warbands[selectedWarbandID].characterRiceDetail(warbandCharacter.id)+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-right"></span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	});
	$('#warbandcharacters').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandcharacters');
	$('#warbandcharacters').find('.delete').tap(function() {
		deleteWarbandCharacter($(this).attr('data-warband-character-id'));
	});
}

function populateWarbandCharacterSuggestions(search) {
	var html = '';
	Object.keys(staticData.factions[warbands[selectedWarbandID].faction].characters).forEach(function(factionCharacterID) {
		if (search.length === 0 || (staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-character-id="'+factionCharacterID+'">';
					html += '<span class="cell name">'+htmlEncode(staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].rice === 0) ? '-':staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].rice)+'</span></span>';
					html += '<span class="cell icon large"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	});
	$('#warbandcharacter').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		$('input').blur();
		warbands[selectedWarbandID].addCharacter($(this).attr('data-character-id'));
		warbands[selectedWarbandID].save(function() {
			drawWarbands();
			drawWarbandCharacters();
			$('#add').addClass('shown');
			swapContentView('warbandcharacter', 'warbandcharacters', 'left');
		});
	});
}

function deleteWarbandCharacterEnhancement(warbandCharacterEnhancementID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the enhancement "'+warbands[selectedWarbandID].getCharacterEnhancement(selectedWarbandCharacterID, warbandCharacterEnhancementID).name+'" from '+warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+' in your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button !== 2) {
				return;
			}
			warbands[selectedWarbandID].removeCharacterEnhancement(selectedWarbandCharacterID, warbandCharacterEnhancementID);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandCharacters();
				drawEditWarbandCharacter();
			});
		},
		'Delete Warband character',
		['Cancel','Delete']
	);
}

function drawEditWarbandCharacter() {
	$('#warbandcharacter').attr('data-title', htmlEncode(warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+': enhancements'));
	$('#add').attr('data-target-content-view-id', 'warbandcharacterenhancement').addClass('shown');
	var warbandCharacterEnhancementsSortArray = [];
	Object.keys(warbands[selectedWarbandID].characters[selectedWarbandCharacterID].enhancements).forEach(function(warbandCharacterEnhancementID) {
		var warbandCharacterEnhancement = warbands[selectedWarbandID].getCharacterEnhancement(selectedWarbandCharacterID, warbandCharacterEnhancementID);
		warbandCharacterEnhancementsSortArray.push({
			id: warbandCharacterEnhancementID,
			name: warbandCharacterEnhancement.name,
			rice: warbandCharacterEnhancement.rice
		});
	});
	if (settingIsEnabled('lexicographicalsort')) {
		warbandCharacterEnhancementsSortArray.sort(sortObjectArrayByObjectNameProperty);
	}
	var html = '<ul class="content-items-list">';
	warbandCharacterEnhancementsSortArray.forEach(function(warbandCharacterEnhancement) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-1">';
				html += '<a class="action-block action-1 delete" data-warband-character-enhancement-id="'+warbandCharacterEnhancement.id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<span class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandCharacterEnhancement.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+warbandCharacterEnhancement.rice+'</span></span>';
				html += '</span>';
			html += '</div>';
		html += '</li>';
	});
	html += '</ul>';
	$('#warbandcharacter').find('.content-view-scroll-wrapper').empty().append(html);
	setupWarbandSwipeableListing('warbandcharacter');
	$('#warbandcharacter').find('.delete').tap(function() {
		deleteWarbandCharacterEnhancement($(this).attr('data-warband-character-enhancement-id'));
	});
}

function populateWarbandCharacterEnhancementSuggestions(search) {
	var html = '';
	warbandsCharacterEnhancements.forEach(function(warbandsCharacterEnhancement) {
		if (search.length === 0 || (warbandsCharacterEnhancement.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-rice="'+warbandsCharacterEnhancement.rice+'">';
					html += '<span class="cell name">'+htmlEncode(warbandsCharacterEnhancement.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((warbandsCharacterEnhancement.rice === 0) ? '-':warbandsCharacterEnhancement.rice)+'</span></span>';
					html += '<span class="cell icon large"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	});
	$('#warbandcharacterenhancement').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		$('input').blur();
		$('#warbandcharacterenhancementname').val(htmlEncode($(this).find('.cell.name').text()));
		$('#warbandcharacterenhancementrice').val($(this).attr('data-rice'));
		$('#savewarbandcharacterenhancement').trigger('tap');
	});
}

function deleteWarbandEvent(warbandEventID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the event "'+warbands[selectedWarbandID].getEvent(warbandEventID).name+'" from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button !== 2) {
				return;
			}
			warbands[selectedWarbandID].removeEvent(warbandEventID);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandEvents();
			});
		},
		'Delete Warband event',
		['Cancel','Delete']
	);
}

function drawWarbandEvents() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandevents');
	$('#add').attr('data-target-content-view-id', 'warbandevent').addClass('shown');
	var warbandEventsSortArray = [];
	Object.keys(warbands[selectedWarbandID].events).forEach(function(warbandEventID) {
		var warbandEvent = warbands[selectedWarbandID].getEvent(warbandEventID);
		warbandEventsSortArray.push({
			id: warbandEventID,
			name: warbandEvent.name,
			rice: warbandEvent.rice
		});
	});
	if (settingIsEnabled('lexicographicalsort')) {
		warbandEventsSortArray.sort(sortObjectArrayByObjectNameProperty);
	}
	var html = '';
	warbandEventsSortArray.forEach(function(warbandEvent) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-1">';
				html += '<a class="action-block action-1 delete" data-warband-event-id="'+warbandEvent.id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandEvent.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+warbandEvent.rice+'</span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	});
	$('#warbandevents').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandevents');
	$('#warbandevents').find('.delete').tap(function() {
		deleteWarbandEvent($(this).attr('data-warband-event-id'));
	});
}

function populateWarbandEventSuggestions(search) {
	var html = '';
	warbandsEvents.forEach(function(warbandEvent) {
		if (search.length === 0 || (warbandEvent.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-rice="'+warbandEvent.rice+'">';
					html += '<span class="cell name">'+htmlEncode(warbandEvent.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((warbandEvent.rice === 0) ? '-':warbandEvent.rice)+'</span></span>';
					html += '<span class="cell icon large"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	});
	$('#warbandevent').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		$('input').blur();
		$('#warbandeventname').val(htmlEncode($(this).find('.cell.name').text()));
		$('#warbandeventrice').val($(this).attr('data-rice'));
		$('#savewarbandevent').trigger('tap');
	});
}

function deleteWarbandTerrainItem(warbandTerrainItemID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the terrain item "'+warbands[selectedWarbandID].getTerrainItem(warbandTerrainItemID).name+'" from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button !== 2) {
				return;
			}
			warbands[selectedWarbandID].removeTerrainItem(warbandTerrainItemID);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandTerrain();
			});
		},
		'Delete Warband terrain item',
		['Cancel','Delete']
	);
}

function drawWarbandTerrain() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandterrain');
	$('#add').attr('data-target-content-view-id', 'warbandterrainitem').addClass('shown');
	var warbandTerrainSortArray = [];
	Object.keys(warbands[selectedWarbandID].terrain).forEach(function(warbandTerrainItemID) {
		var warbandTerrainItem = warbands[selectedWarbandID].getTerrainItem(warbandTerrainItemID);
		warbandTerrainSortArray.push({
			id: warbandTerrainItemID,
			name: warbandTerrainItem.name,
			rice: warbandTerrainItem.rice
		});
	});
	if (settingIsEnabled('lexicographicalsort')) {
		warbandTerrainSortArray.sort(sortObjectArrayByObjectNameProperty);
	}
	var html = '';
	warbandTerrainSortArray.forEach(function(warbandTerrainItem) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-1">';
				html += '<a class="action-block action-1 delete" data-warband-terrain-item-id="'+warbandTerrainItem.id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandTerrainItem.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+warbandTerrainItem.rice+'</span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	});
	$('#warbandterrain').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandterrain');
	$('#warbandterrain').find('.delete').tap(function() {
		deleteWarbandTerrainItem($(this).attr('data-warband-terrain-item-id'));
	});
}

function populateWarbandTerrainItemSuggestions(search) {
	var html = '';
	warbandsTerrain.forEach(function(warbandTerrainItem) {
		if (search.length === 0 || (warbandTerrainItem.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-rice="'+warbandTerrainItem.rice+'">';
					html += '<span class="cell name">'+htmlEncode(warbandTerrainItem.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((warbandTerrainItem.rice === 0) ? '-':warbandTerrainItem.rice)+'</span></span>';
					html += '<span class="cell icon large"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	});
	$('#warbandterrainitem').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		$('input').blur();
		$('#warbandterrainitemname').val(htmlEncode($(this).find('.cell.name').text()));
		$('#warbandterrainitemrice').val($(this).attr('data-rice'));
		$('#savewarbandterrainitem').trigger('tap');
	});
}

function swapContentView(visibleContentViewID, newContentViewID, direction) {
	var visibleContentView = $('#'+visibleContentViewID);
	var newContentView = $('#'+newContentViewID);
	var newContentViewScrollWapper = newContentView.find('.content-view-scroll-wrapper');
	if (newContentView.hasClass('slider')) {
		newContentView.find('.slide-group').css('-webkit-transform', 'translateX(0)');
	}
	if (newContentView.attr('data-back-content-view-id')) {
		backContentViewID = newContentView.attr('data-back-content-view-id');
		$('#back').addClass('shown');
	} else {
		backContentViewID = null;
		$('#back').removeClass('shown');
	}
	$('#title').html(htmlEncode($('#'+newContentViewID).attr('data-title')));
	if (direction === null) {
		if (newContentViewScrollWapper.length) newContentViewScrollWapper[0].scrollTop = 0;
		newContentView.css('-webkit-transform', 'translateX(0)');
		visibleContentView.css('-webkit-transform', 'translateX('+contentViewWidth+'px)');
	} else {
		if (direction === 'right') {
			if (newContentViewScrollWapper.length) newContentViewScrollWapper[0].scrollTop = 0;
			newContentView.css('-webkit-transform', 'translateX('+contentViewWidth+'px)').addClass('animataes-on-transform').css('-webkit-transform', 'translateX(0)');
			setTimeout(function() {
				visibleContentView.css('-webkit-transform', 'translateX('+contentViewWidth+'px)');
				newContentView.removeClass('animataes-on-transform');
			}, 300);
		} else {
			newContentView.css('-webkit-transform', 'translateX(0)');
			visibleContentView.addClass('animataes-on-transform').css('-webkit-transform', 'translateX('+contentViewWidth+'px)');
			setTimeout(function() {
				visibleContentView.removeClass('animataes-on-transform');
			}, 300);
		}
	}
	currentContentViewID = newContentViewID;
}

function changeContentView(tappedElement) {
	window.plugin.statusbarOverlay.isHidden(function(isHidden) {
		if (!isHidden) {
			window.plugin.statusbarOverlay.hide();
		}
	});
	$('input,select').blur();
	var targetContentViewID = $(tappedElement).attr('data-target-content-view-id');
	if (targetContentViewID === currentContentViewID) {
		return;
	}
	if ($(tappedElement).attr('data-warband-id')) {
		selectedWarbandID = $(tappedElement).attr('data-warband-id');
	}
	if ($(tappedElement).attr('data-warband-character-id')) {
		selectedWarbandCharacterID = $(tappedElement).attr('data-warband-character-id');
	}
	$('#add').removeClass('shown');
	switch (targetContentViewID) {
		case 'warbands':
			$('#add').attr('data-target-content-view-id', 'warband').addClass('shown');
		break;
		case 'warband':
			if ($(tappedElement).attr('id') === 'add') {
				$('#'+targetContentViewID).attr('data-title', 'Add a Warband');
				$('#savewarband').attr('data-mode', 'add');
				$('#warbandfaction').val(Object.keys(staticData.factions)[0]);
				$('#warbandname').val('');
				$('#warbandrice').val('');
				$('#warbandfaction').removeAttr('disabled');
				break;
			}
			$('#'+targetContentViewID).attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
			$('#savewarband').attr('data-mode', 'edit');
			$('#warbandfaction').val(warbands[selectedWarbandID].faction);
			$('#warbandname').val(htmlEncode(warbands[selectedWarbandID].name));
			$('#warbandrice').val(warbands[selectedWarbandID].riceLimit);
			$('#warbandfaction').attr('disabled', 'disabled');
		break;
		case 'warbandcharacters':
			drawWarbandCharacters();
			$('#add').attr('data-target-content-view-id', 'warbandcharacter').addClass('shown');
		break;
		case 'warbandcharacter':
			if ($(tappedElement).attr('id') === 'add') {
				$('#warbandcharacter').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
				var html = '<div class="horizontally-padded-wrapper">';
					html += '<span class="subtitle">Add a character to Warband</span>';
					html += '<form onsubmit="return false;"><input id="warbandcharactersearch" type="search" placeholder="Search" autocorrect="off" autocapitalize="off"></form>';
				html += '</div>';
				html += '<ul class="content-items-list"></ul>';
				$('#warbandcharacter').find('.content-view-scroll-wrapper').empty().append(html);
				populateWarbandCharacterSuggestions('');
				$('#warbandcharactersearch').keyup(function() {
					populateWarbandCharacterSuggestions($(this).val());
				});
				break;
			}
			drawEditWarbandCharacter();
		break;
		case 'warbandcharacterenhancement':
			$('#warbandcharacterenhancement').attr('data-title', htmlEncode(warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+': enhancements'));
			$('#warbandcharacterenhancementname').val('');
			$('#warbandcharacterenhancementrice').val('');
			if (!warbandsCharacterEnhancements.length) {
				$('#warbandcharacterenhancement').find('.list-preamble').removeClass('shown');
			} else {
				$('#warbandcharacterenhancement').find('.list-preamble').addClass('shown');
			}
			populateWarbandCharacterEnhancementSuggestions('');
		break;
		case 'warbandevents':
			drawWarbandEvents();
			$('#add').attr('data-target-content-view-id', 'warbandevent').addClass('shown');
		break;
		case 'warbandevent':
			$('#warbandevent').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
			$('#warbandeventname').val('');
			$('#warbandeventrice').val('');
			if (!warbandsEvents.length) {
				$('#warbandevent').find('.list-preamble').removeClass('shown');
			} else {
				$('#warbandevent').find('.list-preamble').addClass('shown');
			}
			populateWarbandEventSuggestions('');
		break;
		case 'warbandterrain':
			drawWarbandTerrain();
			$('#add').attr('data-target-content-view-id', 'warbandterrainitem').addClass('shown');
		break;
		case 'warbandterrainitem':
			$('#warbandterrainitem').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
			$('#warbandterrainitemname').val('');
			$('#warbandterrainitemrice').val('');
			if (!warbandsTerrain.length) {
				$('#warbandterrainitem').find('.list-preamble').removeClass('shown');
			} else {
				$('#warbandterrainitem').find('.list-preamble').addClass('shown');
			}
			populateWarbandTerrainItemSuggestions('');
		break;
		default:
		break;
	}
	$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
	if ($('#'+targetContentViewID).hasClass('faction-cards')) {
		$('#'+targetContentViewID).attr('data-back-content-view-id', ((currentContentViewID === 'warbandcharacters') ? 'warbandcharacters':'faction-'+$('#'+targetContentViewID).attr('data-faction')));
	}
	swapContentView(currentContentViewID, targetContentViewID, (($(tappedElement).hasClass('appear-from-right')) ? 'right':null));
	if ($(tappedElement).hasClass('tab-item')) {
		$('nav a').removeClass('active');
		$(tappedElement).addClass('active');
	}
}

document.addEventListener('deviceready', function() {
	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	Object.keys(staticData.factions).forEach(function(factionID) {
		$('#warbandfaction').append('<option value="'+factionID+'">'+htmlEncode(staticData.factions[factionID].name)+'</option>');
		var factionContentItemsListHTML = '<li>';
			factionContentItemsListHTML += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction-'+factionID+'">';
				factionContentItemsListHTML += '<span class="cell image"><img src="images/factions/'+staticData.factions[factionID].image+'"></span>';
				factionContentItemsListHTML += '<span class="cell name">'+htmlEncode(staticData.factions[factionID].name)+'</span>';
				factionContentItemsListHTML += '<span class="cell icon"><span class="icon icon-right"></span></span>';
			factionContentItemsListHTML += '</a>';
		factionContentItemsListHTML += '</li>';
		$('#factions').find('.content-items-list').append(factionContentItemsListHTML);
		var contentHTMLAdditions = '';
		contentHTMLAdditions += '<div class="content-view" id="faction-'+factionID+'" data-title="'+htmlEncode(staticData.factions[factionID].name)+'" data-back-content-view-id="factions">';
			contentHTMLAdditions += '<div class="content-view-scroll-wrapper">';
				contentHTMLAdditions += '<ul class="content-items-list">';
				Object.keys(staticData.factions[factionID].characters).forEach(function(factionCharacterID) {
					contentHTMLAdditions += '<li>';
						contentHTMLAdditions += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction-character-'+factionCharacterID+'-cards">';
							contentHTMLAdditions += '<span class="cell name">'+htmlEncode(staticData.factions[factionID].characters[factionCharacterID].name)+'</span>';
							contentHTMLAdditions += '<span class="cell rice"><span class="badge">'+((staticData.factions[factionID].characters[factionCharacterID].rice === 0) ? '-':staticData.factions[factionID].characters[factionCharacterID].rice)+'</span></span>';
							contentHTMLAdditions += '<span class="cell icon"><span class="icon icon-right"></span></span>';
						contentHTMLAdditions += '</a>';
					contentHTMLAdditions += '</li>';
				});
				contentHTMLAdditions += '</ul>';
			contentHTMLAdditions += '</div>';
		contentHTMLAdditions += '</div>';
		Object.keys(staticData.factions[factionID].characters).forEach(function(factionCharacterID) {
			contentHTMLAdditions += '<div class="faction-cards slider content-view" id="faction-character-'+factionCharacterID+'-cards" data-title="'+htmlEncode(staticData.factions[factionID].characters[factionCharacterID].name)+'" data-faction="'+factionID+'">';
				contentHTMLAdditions += '<div class="slide-group">';
					staticData.factions[factionID].characters[factionCharacterID].cards.forEach(function(factionCharacterCard) {
						contentHTMLAdditions += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				contentHTMLAdditions += '</div>';
			contentHTMLAdditions += '</div>';
		});
		$('.content').append(contentHTMLAdditions);
	});
	
	Object.keys(staticData.scenarios).forEach(function(scenarioID) {
		var scenariosContentItemsListHTML = '<li>';
			scenariosContentItemsListHTML += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioID+'">';
				scenariosContentItemsListHTML += '<span class="cell name">'+htmlEncode(staticData.scenarios[scenarioID].name)+'</span>';
				scenariosContentItemsListHTML += '<span class="cell icon"><span class="icon icon-right"></span></span>';
			scenariosContentItemsListHTML += '</a>';
		scenariosContentItemsListHTML += '</li>';
		$('#scenarios').find('.content-items-list').append(scenariosContentItemsListHTML);
		var html = '';
		html += '<div class="content-view content-padded scenario" id="scenario'+scenarioID+'" data-title="'+htmlEncode(staticData.scenarios[scenarioID].name)+'" data-back-content-view-id="scenarios">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<a class="btn change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioID+'backstory"><span class="icon icon-right"></span> View backstory</a>';
				html += '<h5>Type</h5>';
				html += '<p>'+htmlEncode(staticData.scenarios[scenarioID].type)+'</p>';
				html += '<h5>Deployment</h5>';
				html += '<a class="btn scenario-plan change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioID+'plan"><span class="icon icon-search"></span> View plan</a>';
				staticData.scenarios[scenarioID].deployment.forEach(function(scenarioDeploymentItem) {
					html += '<p>'+htmlEncode(scenarioDeploymentItem)+'</p>';
				});
				html += '<h5>Game Length</h5>';
				html += '<p>'+htmlEncode(staticData.scenarios[scenarioID].game_length)+'</p>';
				if (staticData.scenarios[scenarioID].hasOwnProperty('objective_interaction')) {
					html += '<h5>Scenario Objective Interaction</h5>';
					staticData.scenarios[scenarioID].objective_interaction.forEach(function(scenarioObjectiveInteraction) {
						html += '<p>'+htmlEncode(scenarioObjectiveInteraction)+'</p>';
					});
				}
				html += '<h5>Victory Conditions</h5>';
				html += '<table class="victory-conditions">';
				staticData.scenarios[scenarioID].victory_conditions.points.forEach(function(scenarioVictoryConditionsPoint) {
					html += '<tr>';
						html += '<td class="points"><p>1 VP</p></td>';
						html += '<td class="condition"><p>'+htmlEncode(scenarioVictoryConditionsPoint)+'</p></td>';
					html += '</tr>';
				});
				html += '</table>';
				if (staticData.scenarios[scenarioID].victory_conditions.hasOwnProperty('additional_rules')) {
					html += '<p>'+htmlEncode(staticData.scenarios[scenarioID].victory_conditions.additional_rules)+'</p>';
				}
			html += '</div>';
		html += '</div>';
		html += '<div class="content-view content-padded scenario-backstory" id="scenario'+scenarioID+'backstory" data-title="'+htmlEncode(staticData.scenarios[scenarioID].name)+': backstory" data-back-content-view-id="scenario'+scenarioID+'">';
			html += '<div class="content-view-scroll-wrapper">';
			staticData.scenarios[scenarioID].story.forEach(function(scenarioStoryParagraph) {
				html += '<p>'+htmlEncode(scenarioStoryParagraph)+'</p>';
			});
			html += '</div>';
		html += '</div>';
		html += '<div class="content-view scenario-image-view content-padded" id="scenario'+scenarioID+'plan" data-title="'+htmlEncode(staticData.scenarios[scenarioID].name)+': plan" data-back-content-view-id="scenario'+scenarioID+'">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<img class="scenario-image" src="images/scenarios/'+staticData.scenarios[scenarioID].image+'">';
			html += '</div>';
		html += '</div>';
		$('.content').append(html);
	});
	
	contentViewWidth = $('.content').width();
	$('.content-view .content-view-scroll-wrapper').css({width: contentViewWidth+'px', height: $('.content').height()+'px'});
	$('.warband-tabs-rice-wrapper .segmented-control').css('width', (contentViewWidth - 70)+'px'); // 5px left margin, 60px badge, 5px right margin
	
	
	$('#title').html(htmlEncode($('.content-view.default').attr('data-title')));
	$('.content-view.default').css('-webkit-transform', 'translateX(0)');
	currentContentViewID = $('.content-view.default').attr('id');
	$('nav a').each(function() {
		if ($(this).attr('data-target-content-view-id') === currentContentViewID) {
			$(this).addClass('active');
		}
	});
	
	$('#title').tap(function() {
		if ($('#'+currentContentViewID).find('.content-view-scroll-wrapper').length) {
			$('#'+currentContentViewID).find('.content-view-scroll-wrapper')[0].scrollTop = 0;
		}
	});
	
	$('.change-content-view').tap(function() {
		changeContentView(this);
	});
	
	loadSettings(function() {
		$('#settings').find('.toggle').each(function() {
			if (settingIsEnabled($(this).attr('id'))) {
				$(this).addClass('active');
			}
		});
	});
	
	loadWarbands(function() {
		drawWarbands();
	});
	
	loadWarbandsCharacterEnhancements();
	
	loadWarbandsEvents();
	
	loadWarbandsTerrain();
	
	$('#back').tap(function() {
		$('input,select').blur();
		$('#add').removeClass('shown');
		switch (backContentViewID) {
			case 'warbands':
				$('#add').attr('data-target-content-view-id', 'warband').addClass('shown');
			break;
			case 'warbandcharacters':
				$('#add').attr('data-target-content-view-id', 'warbandcharacter').addClass('shown');
			break;
			case 'warbandcharacter':
				if (currentContentViewID === 'warbandcharacterenhancement') {
					$('#add').attr('data-target-content-view-id', 'warbandcharacterenhancement').addClass('shown');
				}
			break;
			case 'warbandevents':
				$('#add').attr('data-target-content-view-id', 'warbandevent').addClass('shown');
			break;
			case 'warbandterrain':
				$('#add').attr('data-target-content-view-id', 'warbandterrainitem').addClass('shown');
			break;
			default:
			break;
		}
		$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
		swapContentView(currentContentViewID, backContentViewID, 'left');
	});
	
	$('#savewarband').tap(function() {
		var warbandFaction = $('#warbandfaction').val();
		var warbandName = $('#warbandname').val().trim();
		var warbandRice = $('#warbandrice').val().trim();
		if ($(this).attr('data-mode') === 'add' && Object.keys(staticData.factions).indexOf(warbandFaction) < 0) {
			navigator.notification.alert(
				'Please select a faction',
				function() {
					$('#warbandfaction').focus();
				}
			);
			return;
		}
		if (!warbandName.length) {
			navigator.notification.alert(
				'Please enter a Warband name',
				function() {
					$('#warbandname').focus();
				}
			);
			return;
		}
		if (warbandName.length > 28) {
			navigator.notification.alert(
				'Warband names are limited to 28 characters',
				function() {
					$('#warbandname').focus();
				}
			);
			return;
		}
		if (!warbandRice.match(/^[0-9]{1,2}$/)) {
			navigator.notification.alert(
				'Please enter a rice limit between 0 and 99',
				function() {
					$('#warbandrice').focus();
				}
			);
			return;
		}
		$('input,select').blur();
		warbandRice = parseInt(warbandRice, 10);
		if ($(this).attr('data-mode') === 'edit') {
			warbands[selectedWarbandID].name = warbandName;
			warbands[selectedWarbandID].riceLimit = warbandRice;
		} else {
			var newWarbandID = generateUUID();
			warbands[newWarbandID] = new Warband();
			warbands[newWarbandID].id = newWarbandID;
			warbands[newWarbandID].faction = warbandFaction;
			warbands[newWarbandID].name = warbandName;
			warbands[newWarbandID].riceLimit = warbandRice;
			selectedWarbandID = newWarbandID;
		}
		warbands[selectedWarbandID].save(function() {
			drawWarbands();
			drawWarbandCharacters();
			$('#add').attr('data-target-content-view-id', 'warbandcharacter').addClass('shown');
			swapContentView('warband', 'warbandcharacters', null);
		});
	});
	
	$('#warbandcharacterenhancementname').keyup(function() {
		populateWarbandCharacterEnhancementSuggestions($(this).val());
	});
	
	$('#savewarbandcharacterenhancement').tap(function() {
		var warbandsCharacterEnhancementName = $('#warbandcharacterenhancementname').val().trim();
		var warbandsCharacterEnhancementRice = $('#warbandcharacterenhancementrice').val().trim();
		if (!warbandsCharacterEnhancementName.length) {
			navigator.notification.alert(
				'Please enter an enhancement name',
				function() {
					$('#warbandcharacterenhancementname').focus();
				}
			);
			return;
		}
		if (!warbandsCharacterEnhancementRice.match(/^[0-9]{1,2}$/)) {
			navigator.notification.alert(
				'Please enter a rice cost',
				function() {
					$('#warbandcharacterenhancementrice').focus();
				}
			);
			return;
		}
		$('input').blur();
		warbandsCharacterEnhancementRice = parseInt(warbandsCharacterEnhancementRice, 10);
		saveWarbandsCharacterEnhancementIfNew(warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice, function() {
			warbands[selectedWarbandID].addCharacterEnhancement(selectedWarbandCharacterID, warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandCharacters();
				drawEditWarbandCharacter();
				swapContentView('warbandcharacterenhancement', 'warbandcharacter', null);
			});
		});
	});
	
	$('#warbandeventname').keyup(function() {
		populateWarbandEventSuggestions($(this).val());
	});
	
	$('#savewarbandevent').tap(function() {
		var warbandEventName = $('#warbandeventname').val().trim();
		var warbandEventRice = $('#warbandeventrice').val().trim();
		if (!warbandEventName.length) {
			navigator.notification.alert(
				'Please enter an event name',
				function() {
					$('#warbandeventname').focus();
				}
			);
			return;
		}
		if (!warbandEventRice.match(/^[0-9]{1,2}$/)) {
			navigator.notification.alert(
				'Please enter a rice cost',
				function() {
					$('#warbandeventrice').focus();
				}
			);
			return;
		}
		$('input').blur();
		warbandEventRice = parseInt(warbandEventRice, 10);
		saveWarbandsEventIfNew(warbandEventName, warbandEventRice, function() {
			warbands[selectedWarbandID].addEvent(warbandEventName, warbandEventRice);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandEvents();
				swapContentView('warbandevent', 'warbandevents', null);
			});
		});
	});
	
	$('#warbandterrainitemname').keyup(function() {
		populateWarbandTerrainItemSuggestions($(this).val());
	});
	
	$('#savewarbandterrainitem').tap(function() {
		var warbandTerrainItemName = $('#warbandterrainitemname').val().trim();
		var warbandTerrainItemRice = $('#warbandterrainitemrice').val().trim();
		if (!warbandTerrainItemName.length) {
			navigator.notification.alert(
				'Please enter a terrain item name',
				function() {
					$('#warbandterrainitemname').focus();
				}
			);
			return;
		}
		if (!warbandTerrainItemRice.match(/^[0-9]{1,2}$/)) {
			navigator.notification.alert(
				'Please enter a rice cost',
				function() {
					$('#warbandterrainitemrice').focus();
				}
			);
			return;
		}
		$('input').blur();
		warbandTerrainItemRice = parseInt(warbandTerrainItemRice, 10);
		saveWarbandsTerrainItemIfNew(warbandTerrainItemName, warbandTerrainItemRice, function() {
			warbands[selectedWarbandID].addTerrainItem(warbandTerrainItemName, warbandTerrainItemRice);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandTerrain();
				swapContentView('warbandterrainitem', 'warbandterrain', null);
			});
		});
	});
	
	$('#randomscenario').tap(function() {
		swapContentView('scenarios', 'scenario'+randomIntFromInterval(1, Object.keys(staticData.scenarios).length), 'right');
	});
	
	$('#settings').find('.toggle').on('toggle', function(toggleEvent) {
		settings[$(this).attr('id')].save(toggleEvent.detail.isActive, function(record) {
			if (record.key === 'lexicographicalsort') {
				drawWarbands();
			}
		});
	});
	
	$('a.pdf').tap(function() {
		cordova.plugins.disusered.open(cordova.file.applicationDirectory+'www/'+$(this).attr('data-url'));
	});
	
	$('a.external').tap(function() {
		window.open(encodeURI($(this).attr('data-url')), '_system');
	});
	
	$('a.email').tap(function() {
		cordova.require('emailcomposer.EmailComposer').show({
			to: $(this).attr('data-email'),
			subject: $(this).attr('data-subject')
		});
	});
	
	$('a.twitter').tap(function() {
		var username = $(this).attr('data-username');
		appAvailability.check(
			'tweetbot://',
			function() { // success
				window.open(encodeURI('tweetbot:///user_profile/'+username), '_system');
			},
			function() { // fail
				appAvailability.check(
					'twitterrific://',
					function() { // success
						window.open(encodeURI('twitterrific:///profile?screen_name='+username), '_system');
					},
					function() { // fail
						appAvailability.check(
							'twitter://',
							function() { // success
								window.open(encodeURI('twitter://user?screen_name='+username), '_system');
							},
							function() { // fail
								window.open(encodeURI('https://twitter.com/'+username), '_system');
							}
						);
					}
				);
			}
		);
	});
}, false);