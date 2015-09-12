var staticData = null;
var contentViewWidth = 0;
var currentTemplateId = null;
var selectedFactionId = null;
var selectedWarbandId = null;
var selectedWarbandCharacterId = null;
var selectedScenarioId = null;

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function generateUuid() {
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

function sortObjectArrayByNameProperty(objA, objB) {
	return alphanumCase(objA.name, objB.name);
}

function addWarbandRiceStatsToTemplateData(templateData) {
	templateData.total_rice_cost = warbands[selectedWarbandId].rice();
	templateData.rice_limit = parseInt(warbands[selectedWarbandId].riceLimit, 10);
	templateData.complete =(templateData.rice_limit === templateData.total_rice_cost);
}

function renderView(templateId, contentId) {
	var templateData = {};
	switch(templateId) {
		case 'factions':
			$('#title').html('Factions');
			templateData.factions = [];
			Object.keys(staticData.factions).forEach(function(factionId) {
				templateData.factions.push(staticData.factions[factionId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'faction_characters':
			selectedFactionId = contentId;
			$('#title').html(htmlEncode(staticData.factions[contentId].name));
			templateData.characters = [];
			Object.keys(staticData.factions[contentId].characters).forEach(function(characterId) {
				templateData.players.push(staticData.factions[contentId].characters[characterId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'character_cards':
			$('#title').html(htmlEncode(staticData.factions[selectedFactionId].characters[contentId].name));
			templateData = staticData.factions[selectedFactionId].characters[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'warbands':
			loadWarbands(function() {
				$('#title').html('Warbands');
				var warbandsSortArray = [];
				Object.keys(warbands).forEach(function(warbandId) {
					warbandsSortArray.push({
						id: warbandId,
						name: warbands[warbandId].name
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						warbandsSortArray.sort(sortObjectArrayByNameProperty);
					}
					templateData.warbands = [];
					warbandsSortArray.forEach(function(warband) {
						var warbandRiceTotal = warbands[warband.id].rice()
						templateData.warbands.push({
							id: warband.id,
							image: staticData.factions[warbands[warband.id].faction].image,
							name: warband.name,
							total_rice_cost: warbandRiceTotal,
							rice_limit: warbands[warband.id].riceLimit,
							complete: (parseInt(warbands[warband.id].riceLimit, 10) === warbandRiceTotal)
						});
					});
					$('#back').removeClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband':
			$('#title').html(((selectedWarbandId === null) ? 'Create':'Edit')+' warband');
			templateData.edit = (selectedWarbandId !== null);
			templateData.factions = [];
			Object.keys(staticData.factions).forEach(function(factionId) {
				templateData.factions.push({
					id: factionId,
					name: staticData.factions[factionId].name,
					selected: (selectedWarbandId !== null && warbands[selectedWarbandId].faction == factionId)
				});
			});
			templateData.name = ((selectedWarbandId !== null) ? warbands[selectedWarbandId].name:'');
			templateData.rice = ((selectedWarbandId !== null) ? warbands[selectedWarbandId].riceLimit:'');
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'warband_characters':
			loadWarbands(function() {
				$('#title').html(htmlEncode(warbands[selectedWarbandId].name));
				addWarbandRiceStatsToTemplateData(templateData);
				Object.keys(warbands[selectedWarbandId].characters).forEach(function(warbandCharacterId) {
					templateData.characters.push({
						warband_character_id: warbandCharacterId,
						id: warbands[selectedWarbandId].getFactionCharacterId(warbandCharacterId),
						name: warbands[selectedWarbandId].getCharacterName(warbandCharacterId),
						rice_cost_detail: warbands[selectedWarbandId].characterRiceDetail(warbandCharacterId)
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						templateData.players.sort(sortObjectArrayByNameProperty);
					}
					$('#back').addClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_character':
			loadWarbands(function() {
				$('#title').html('Add character to warband');
				$('#back').addClass('shown');
				$('#add').removeClass('shown');
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_character_enhancements':
			loadWarbands(function() {
				$('#title').html(htmlEncode(warbands[selectedWarbandId].getCharacterName(selectedWarbandCharacterId))+' enhancements');
				addWarbandRiceStatsToTemplateData(templateData);
				templateData.character_enhancements = [];
				Object.keys(warbands[selectedWarbandId].characters[selectedWarbandCharacterId].enhancements).forEach(function(warbandCharacterEnhancementId) {
					var warbandCharacterEnhancement = warbands[selectedWarbandId].getCharacterEnhancement(selectedWarbandCharacterId, warbandCharacterEnhancementId);
					templateData.character_enhancements.push({
						id: warbandCharacterEnhancementId,
						name: warbandCharacterEnhancement.name,
						rice: warbandCharacterEnhancement.rice
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						templateData.character_enhancements.sort(sortObjectArrayByNameProperty);
					}
					$('#back').addClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_character_enhancement':
			loadWarbandsCharacterEnhancements(function() {
				$('#title').html('Add enhancement to '+htmlEncode(warbands[selectedWarbandId].getCharacterName(selectedWarbandCharacterId)));
				$('#back').addClass('shown');
				$('#add').removeClass('shown');
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_events':
			loadWarbands(function() {
				$('#title').html(htmlEncode(warbands[selectedWarbandId].name)+' events');
				addWarbandRiceStatsToTemplateData(templateData);
				templateData.events = [];
				Object.keys(warbands[selectedWarbandId].events).forEach(function(warbandEventId) {
					var warbandEvent = warbands[selectedWarbandId].getEvent(warbandEventId);
					templateData.events.push({
						id: warbandEventId,
						name: warbandEvent.name,
						rice: warbandEvent.rice
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						templateData.events.sort(sortObjectArrayByNameProperty);
					}
					$('#back').addClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_event':
			loadWarbandsEvents(function() {
				$('#title').html('Add warband event');
				$('#back').addClass('shown');
				$('#add').removeClass('shown');
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_terrain':
			loadWarbands(function() {
				$('#title').html(htmlEncode(warbands[selectedWarbandId].name)+' terrain');
				addWarbandRiceStatsToTemplateData(templateData);
				templateData.terrain = [];
				Object.keys(warbands[selectedWarbandId].terrain).forEach(function(warbandTerrainItemId) {
					var warbandTerrainItem = warbands[selectedWarbandId].getTerrainItem(warbandTerrainItemId);
					templateData.terrain.push({
						id: warbandTerrainItemId,
						name: warbandTerrainItem.name,
						rice: warbandTerrainItem.rice
					});
				});
				loadSettings(function() {
					if (settingIsEnabled('lexicographicalsort')) {
						templateData.terrain.sort(sortObjectArrayByNameProperty);
					}
					$('#back').addClass('shown');
					$('#add').addClass('shown');
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_terrain':
			loadWarbandsTerrain(function() {
				$('#title').html('Add warband terrain');
				$('#back').addClass('shown');
				$('#add').removeClass('shown');
				renderTemplate(templateId, templateData);
			});
		break;
		case 'scenarios':
			$('#title').html('Scenarios');
			templateData.scenarios = [];
			Object.keys(staticData.scenarios).forEach(function(scenarioId) {
				templateData.scenarios.push(staticData.scenarios[scenarioId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'scenario':
			$('#title').html(htmlEncode(staticData.scenarios[contentId].name));
			templateData = staticData.scenarios[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'scenario_backstory':
			$('#title').html(htmlEncode(staticData.scenarios[contentId].name));
			templateData.content = staticData.scenarios[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'scenario_plan':
			$('#title').html(htmlEncode(staticData.scenarios[contentId].name)+': plan');
			templateData.image = staticData.scenarios[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'guides':
			$('#title').html('Guides');
			templateData.guides = [];
			Object.keys(staticData.guides).forEach(function(guideId) {
				templateData.guides.push(staticData.guides[guideId]);
			});
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'misc':
			$('#title').html('Misc.');
			$('#back').removeClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'settings':
			$('#title').html('Settings');
			templateData.settings = [];
			Object.keys(staticData.settings).forEach(function(settingId) {
				templateData.settings.push(staticData.settings[settingId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'faqs':
			$('#title').html('FAQs');
			templateData.faqs = [];
			Object.keys(staticData.faqs).forEach(function(faqId) {
				templateData.faqs.push(staticData.faqs[faqId]);
			});
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
		case 'faq':
			$('#title').html(htmlEncode(staticData.faqs[contentId].title));
			templateData = staticData.faqs[contentId];
			$('#back').addClass('shown');
			$('#add').removeClass('shown');
		break;
	}
	renderTemplate(templateId, templateData);
}

function renderTemplate(templateId, templateData) {
	$('.content').empty().html(Mustache.render(staticData.templates[templateId], templateData));
	setContentScrollViewWrapperDimensions();
	currentTemplateId = templateId;
	addEventsToRenderedView();
}

function setContentScrollViewWrapperDimensions() {
	$('.content-view .content-view-scroll-wrapper').css({width: contentViewWidth+'px', height: $('.content').height()+'px'});
}

function setupSwipeableListing(parentalElement) {
	var actionBlockWidth = 50;
	parentalElement.find('.swipe-wrapper').swipeLeft(function() {
		$(this).addClass('offset');
	}).swipeRight(function() {
		$(this).removeClass('offset');
	});
	parentalElement.find('.action-1').css('margin-left', contentViewWidth+'px');
	parentalElement.find('.action-2').css('margin-left', (contentViewWidth + actionBlockWidth)+'px');
	parentalElement.find('.action-3').css('margin-left', (contentViewWidth + (actionBlockWidth * 2))+'px');
}

function populateCharacterSuggestions(search) {
	var templateData = {
		characters: []
	};
	Object.keys(staticData.factions[warbands[selectedWarbandId].faction].characters).forEach(function(factionCharacterId) {
		if (search.length === 0 || (staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			character_enhancements.push({
				id: factionCharacterId,
				name: staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].name,
				rice: ((staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].rice === 0) ? '-':staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].rice)
			});
		}
	});
	$('.content-items-list').empty().html(Mustache.render(staticData.templates.character_suggestions, templateData));
	setContentScrollViewWrapperDimensions();
	$('.content-items-list').find('.listing-block').tap(function() {
		$('#field-search').blur();
		warbands[selectedWarbandId].addCharacter($(this).attr('data-character-id'));
		warbands[selectedWarbandId].save(function() {
			renderView('warband_characters', null);
		});
	});
}

function populateCharacterEnhancementSuggestions(search) {
	var templateData = {
		character_enhancements: []
	};
	warbandsCharacterEnhancements.forEach(function(warbandsCharacterEnhancement) {
		if (search.length === 0 || (warbandsCharacterEnhancement.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			character_enhancements.push({
				name: warbandsCharacterEnhancement.name,
				numeric_rice_cost: warbandsCharacterEnhancement.rice,
				rice: ((warbandsCharacterEnhancement.rice === 0) ? '-':warbandsCharacterEnhancement.rice)
			});
		}
	});
	$('.content-items-list').empty().html(Mustache.render(staticData.templates.character_enhancement_suggestions, templateData));
	setContentScrollViewWrapperDimensions();
	$('.content-items-list').find('.listing-block').tap(function() {
		$('input').blur();
		$('#field-name').val($(this).attr('data-name'));
		$('#field-rice').val($(this).attr('data-rice'));
		$('#button-save').trigger('tap');
	});
}

function populateEventSuggestions(search) {
	var templateData = {
		events: []
	};
	warbandsEvents.forEach(function(warbandEvent) {
		if (search.length === 0 || (warbandEvent.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			events.push({
				name: warbandEvent.name,
				numeric_rice_cost: warbandEvent.rice,
				rice: ((warbandEvent.rice === 0) ? '-':warbandEvent.rice)
			});
		}
	});
	$('.content-items-list').empty().html(Mustache.render(staticData.templates.event_suggestions, templateData));
	setContentScrollViewWrapperDimensions();
	$('.content-items-list').find('.listing-block').tap(function() {
		$('input').blur();
		$('#field-name').val($(this).attr('data-name'));
		$('#field-rice').val($(this).attr('data-rice'));
		$('#button-save').trigger('tap');
	});
}

function populateTerrainSuggestions(search) {
	var templateData = {
		terrain: []
	};
	warbandsTerrain.forEach(function(warbandTerrainItem) {
		if (search.length === 0 || (warbandTerrainItem.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			terrain.push({
				name: warbandTerrainItem.name,
				numeric_rice_cost: warbandTerrainItem.rice,
				rice: ((warbandTerrainItem.rice === 0) ? '-':warbandTerrainItem.rice)
			});
		}
	});
	$('.content-items-list').empty().html(Mustache.render(staticData.templates.terrain_suggestions, templateData));
	setContentScrollViewWrapperDimensions();
	$('.content-items-list').find('.listing-block').tap(function() {
		$('input').blur();
		$('#field-name').val($(this).attr('data-name'));
		$('#field-rice').val($(this).attr('data-rice'));
		$('#button-save').trigger('tap');
	});
}

function addEventsToRenderedView() {
	switch(currentTemplateId) {
		case 'factions':
			$('.content-items-list').find('a').tap(function() {
				renderView('faction_characters', $(this).attr('data-faction-id'));
			});
		break;
		case 'faction_characters':
			$('.content-items-list').find('a').tap(function() {
				renderView('character_cards', $(this).attr('data-character-id'));
			});
		break;
		case 'warbands':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block').tap(function() {
				if ($(this).hasClass('share')) {
					var warbandId = $(this).attr('data-warband-id');
					var params = {
						'subject': 'Bushido Warband: '+warbands[warbandId].name,
						'onSuccess': function() {
							$('.content-items-list').find('.swipe-wrapper.offset').removeClass('offset');
						},
						'onError': function() {
							$('.content-items-list').find('.swipe-wrapper.offset').removeClass('offset');
						}
					};
					var emailTemplateData = {
						faction_name: staticData.factions[warbands[warbandId].faction].name,
						warband_name: warbands[warbandId].name,
						characters: [],
						events: [],
						terrain: [],
						total_rice: 0
					};
					Object.keys(warbands[warbandId].characters).forEach(function(warbandCharacterId) {
						var warbandCharacter = {
							'name': warbands[warbandId].getCharacterName(warbandCharacterId),
							'base_rice': staticData.factions[warbands[warbandId].faction].characters[warbands[warbandId].characters[warbandCharacterId].factionCharacterID].rice,
							'rice': 0,
							'enhancements': []
						};
						warbandCharacter.rice += warbandCharacter.base_rice;
						for (var warbandCharacterEnhancementId in warbands[warbandId].characters[warbandCharacterId].enhancements) {
							warbandCharacter.enhancements.push(warbands[warbandId].characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId]);
							warbandCharacter.rice += warbands[warbandId].characters[warbandCharacterId].enhancements[warbandCharacterEnhancementId].rice
						}
						warbandCharacter.has_enhancements = (warbandCharacter.enhancements.length > 0);
						emailTemplateData.characters.push(staticData.factions[warbands[warbandId].faction].characters[warbands[warbandId].characters[warbandCharacterId].factionCharacterID]);
						emailTemplateData.total_rice += warbandCharacter.rice;
					});
					for (var warbandEventId in warbands[warbandId].events) {
						emailTemplateData.events.push(warbands[warbandId].events[warbandEventId]);
						emailTemplateData.total_rice += warbands[warbandId].events[warbandEventId].rice;
					}
					for (var warbandTerrainItemId in warbands[warbandId].terrain) {
						emailTemplateData.terrain.push(warbands[warbandId].terrain[warbandTerrainItemId]);
						emailTemplateData.total_rice += warbands[warbandId].terrain[warbandTerrainItemId].rice;
					}
					emailTemplateData.has_events = (emailTemplateData.events.length > 0);
					emailTemplateData.has_terrain = (emailTemplateData.terrain.length > 0);
					loadSettings(function() {
						if (settingIsEnabled('lexicographicalsort')) {
							emailTemplateData.characters.sort(sortObjectArrayByNameProperty);
							emailTemplateData.characters.forEach(function(character) {
								character.enhancements.sort(sortObjectArrayByObjectNameProperty);
							});
							emailTemplateData.events.sort(sortObjectArrayByNameProperty);
							emailTemplateData.terrain.sort(sortObjectArrayByNameProperty);
						}
						if (settingIsEnabled('htmlemailsetting')) {
							params.body = Mustache.render(staticData.templates.warband_email_html, emailTemplateData);
							params.isHtml = true;
						} else {
							params.body = Mustache.render(staticData.templates.warband_email_txt, emailTemplateData);
						}
						cordova.require('emailcomposer.EmailComposer').show(params);
					});					
				} else if ($(this).hasClass('edit')) {
					selectedWarbandId = $(this).attr('data-warband-id');
					renderView('warband', null);
				} else if ($(this).hasClass('delete')) {
					var warbandId = $(this).attr('data-warband-id');
					navigator.notification.confirm(
						'Are you sure you want to delete the warband '+warbands[warbandId].name+'?',
						function(button) {
							if (button !== 2) {
								return;
							}
							warbands[warbandId].delete(function() {
								delete warbands[warbandId];
								renderView('warbands', null);
							});
						},
						'Delete warband',
						['Cancel','Delete']
					);
				}
			});
			$('.content-items-list').find('.listing-block').tap(function() {
				selectedWarbandId = $(this).attr('data-warband-id');
				renderView('warband_characters', null);
			});
		break;
		case 'warband':
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			$('#button-save').tap(function() {
				var warbandFactionId = $('#field-faction').val();
				var warbandName = $('#field-name').val().trim();
				var warbandRiceLimit = $('#field-rice').val().trim();
				if (selectedWarbandId === null
					&& Object.keys(staticData.factions).indexOf(warbandFactionId) < 0) {
					navigator.notification.alert(
						'Please select a faction',
						function() {
							$('#field-faction').focus();
						}
					);
					return;
				}
				if (!warbandName.length) {
					navigator.notification.alert(
						'Please enter a warband name',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (warbandName.length > 28) {
					navigator.notification.alert(
						'Warband names are limited to 28 characters',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (!warbandRiceLimit.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter a rice limit between 0 and 99',
						function() {
							$('#field-rice').focus();
						}
					);
					return;
				}
				$('input,select').blur();
				warbandRiceLimit = parseInt(warbandRiceLimit, 10);
				if (selectedWarbandId === null) {
					var newWarbandId = generateUuid();
					warbands[newWarbandId] = new Warband();
					warbands[newWarbandId].id = newWarbandId;
					warbands[newWarbandId].faction = warbandFactionId;
					warbands[newWarbandId].name = warbandName;
					warbands[newWarbandId].riceLimit = warbandRiceLimit;
				} else {
					warbands[selectedWarbandId].name = warbandName;
					warbands[selectedWarbandId].riceLimit = warbandRiceLimit;
				}
				warbands[((selectedWarbandId === null) ? newWarbandId:selectedWarbandId)].save(function() {
					renderView('warbands', null);
				});
			});
		break;
		case 'warband_characters':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block').tap(function() {
				if ($(this).hasClass('edit')) {
					selectedWarbandCharacterId = $(this).attr('data-warband-character-id');
					renderView('warband_character_enhancements', null);
				} else if ($(this).hasClass('delete')) {
					var warbandCharacterId = $(this).attr('data-warband-character-id');
					navigator.notification.confirm(
						'Are you sure you want to delete '+warbands[selectedWarbandId].characters[selectedWarbandCharacterId].name+' from '+warbands[selectedWarbandId].name+'?',
						function(button) {
							if (button !== 2) {
								return;
							}
							warbands[selectedWarbandId].removeCharacter(warbandCharacterId);
							renderView('warband_characters', null);
						},
						'Delete warband character',
						['Cancel','Delete']
					);
				}
			});
			$('.content-items-list').find('a').tap(function() {
				selectedWarbandCharacterId = $(this).attr('data-warband-character-id');
				renderView('character_cards', warbands[selectedWarbandId].getFactionCharacterId(selectedWarbandCharacterId));
			});
		break;
		case 'warband_add_character':
			populateCharacterSuggestions('');
			$('#field-search').keyup(function() {
				populateCharacterSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
		break;
		case 'warband_character_enhancements':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block.delete').tap(function() {
				var warbandCharacterEnhancementId = $(this).attr('data-warband-character-enhancement-id');
				navigator.notification.confirm(
					'Are you sure you want to delete the enhancement "'+warbands[selectedWarbandId].characters[selectedWarbandCharacterId].enhancements[warbandCharacterEnhancementId].name+'" from '+warbands[selectedWarbandId].characters[selectedWarbandCharacterId].name+'?',
					function(button) {
						if (button !== 2) {
							return;
						}
						warbands[selectedWarbandId].removeCharacterEnhancement(selectedWarbandCharacterId, warbandCharacterEnhancementId);
						renderView('warband_character_enhancements', null);
					},
					'Delete enhancement',
					['Cancel','Delete']
				);
			});
		break;
		case 'warband_add_character_enhancement':
			populateCharacterEnhancementSuggestions('');
			$('#field-name').keyup(function() {
				populateCharacterEnhancementSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			$('#button-save').tap(function() {
				var warbandsCharacterEnhancementName = $('#field-name').val().trim();
				var warbandsCharacterEnhancementRice = $('#field-rice').val().trim();
				if (!warbandsCharacterEnhancementName.length) {
					navigator.notification.alert(
						'Please enter the enhancement name',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (!warbandsCharacterEnhancementRice.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter the enhancement rice cost',
						function() {
							$('#field-rice').focus();
						}
					);
					return;
				}
				$('input').blur();
				warbandsCharacterEnhancementRice = parseInt(warbandsCharacterEnhancementRice, 10);
				saveWarbandsCharacterEnhancementIfNew(warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice, function() {
					warbands[selectedWarbandId].addCharacterEnhancement(selectedWarbandCharacterId, warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_character_enhancements', null);
					});
				});
			});
		break;
		case 'warband_events':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block.delete').tap(function() {
				var warbandEventId = $(this).attr('data-warband-event-id');
				navigator.notification.confirm(
					'Are you sure you want to delete the event "'+warbands[selectedWarbandId].events[warbandEventId].name+'" from '+warbands[selectedWarbandId].name+'?',
					function(button) {
						if (button !== 2) {
							return;
						}
						warbands[selectedWarbandId].removeEvent(warbandEventId);
						renderView('warband_events', null);
					},
					'Delete warband event',
					['Cancel','Delete']
				);
			});
		break;
		case 'warband_add_event':
			populateEventSuggestions('');
			$('#field-name').keyup(function() {
				populateEventSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			$('#button-save').tap(function() {
				var warbandEventName = $('#field-name').val().trim();
				var warbandEventRice = $('#field-rice').val().trim();
				if (!warbandEventName.length) {
					navigator.notification.alert(
						'Please enter an event name',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (!warbandEventRice.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter a rice cost',
						function() {
							$('#field-rice').focus();
						}
					);
					return;
				}
				$('input').blur();
				warbandEventRice = parseInt(warbandEventRice, 10);
				saveWarbandsEventIfNew(warbandEventName, warbandEventRice, function() {
					warbands[selectedWarbandId].addEvent(warbandEventName, warbandEventRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_events', null);
					});
				});
			});
		break;
		case 'warband_terrain':
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block.delete').tap(function() {
				var warbandTerrainId = $(this).attr('data-warband-terrain-id');
				navigator.notification.confirm(
					'Are you sure you want to delete the terrain "'+warbands[selectedWarbandId].terrain[warbandTerrainId].name+'" from '+warbands[selectedWarbandId].name+'?',
					function(button) {
						if (button !== 2) {
							return;
						}
						warbands[selectedWarbandId].removeEvent(removeTerrainItem);
						renderView('warband_terrain', null);
					},
					'Delete warband terrain item',
					['Cancel','Delete']
				);
			});
		break;
		case 'warband_add_terrain':
			populateTerrainSuggestions('');
			$('#field-name').keyup(function() {
				populateTerrainSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			$('#button-save').tap(function() {
				var warbandTerrainItemName = $('#field-name').val().trim();
				var warbandTerrainItemRice = $('#field-rice').val().trim();
				if (!warbandTerrainItemName.length) {
					navigator.notification.alert(
						'Please enter the terrain item name',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (!warbandTerrainItemRice.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter the terrain item rice cost',
						function() {
							$('#field-rice').focus();
						}
					);
					return;
				}
				$('input').blur();
				warbandTerrainItemRice = parseInt(warbandTerrainItemRice, 10);
				saveWarbandsTerrainItemIfNew(warbandTerrainItemName, warbandTerrainItemRice, function() {
					warbands[selectedWarbandId].addTerrainItem(warbandTerrainItemName, warbandTerrainItemRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_terrain', null);
					});
				});
			});
		break;
		case 'scenarios':
			$('.content-view').find('.random-scenario').tap(function() {
				var scenarioIds = Object.keys(staticData.scenarios);
				renderView('scenario', scenarioIds[(randomIntFromInterval(1, scenarioIds.length) - 1)]);
			});
			$('.content-items-list').find('a').tap(function() {
				selectedScenarioId = $(this).attr('data-scenario-id');
				renderView('scenario', selectedScenarioId);
			});
		break;
		case 'scenario':
			$('.content-view').find('.btn.backstory').tap(function() {
				renderView('scenario_backstory', selectedScenarioId);
			});
			$('.content-view').find('.btn.plan').tap(function() {
				renderView('scenario_plan', selectedScenarioId);
			});
		break;
		case 'guides':
			$('.content-items-list').find('a').tap(function() {
				cordova.plugins.disusered.open(decodeURIComponent(cordova.file.applicationDirectory)+'www/'+$(this).attr('data-url'));
			});
		break;
		case 'misc':
			$('.content-items-list').find('a').tap(function() {
				renderView($(this).attr('data-template-id'), null);
			});
		break;
		case 'settings':
			loadSettings(function() {
				$('.content-items-list').find('.toggle').each(function() {
					if (settingIsEnabled($(this).attr('data-setting-id'), $(this).attr('data-default'))) {
						$(this).addClass('active');
					}
				});
				$('.content-items-list').find('.toggle').on('toggle', function(toggleEvent) {
					settings[$(this).attr('data-setting-id')].save(toggleEvent.detail.isActive, null);
				});
			});			
		break;
		case 'faqs':
			$('.content-items-list').find('a').tap(function() {
				renderView('faq', $(this).attr('data-faq-id'));
			});
		break;
		case 'faq':
			$('.content-view').find('a.external').tap(function() {
				window.open(encodeURI($(this).attr('data-url')), '_system');
			});
			$('.content-view').find('a.email').tap(function() {
				cordova.require('emailcomposer.EmailComposer').show({
					to: $(this).attr('data-email'),
					subject: $(this).attr('data-subject')
				});
			});
			$('.content-view').find('a.twitter').tap(function() {
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
		break;
	}
}

document.addEventListener('deviceready', function() {
	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	Object.keys(staticData.templates).forEach(function(templateId) {
		Mustache.parse(staticData.templates[templateId]);
	});
	
	contentViewWidth = $('.content').width();
	
	$('#back').tap(function() {
		$('input,select').blur();
		switch(currentTemplateId) {
			case 'faction_characters':
				renderView('factions', null);
			break;
			case 'character_cards':
				if ($('nav').find('a.active').attr('data-template-id') === 'warbands') {
					renderView('warband_characters', null);
				} else {
					renderView('faction_characters', selectedFactionId);
				}
			break;
			case 'warband':
			case 'warband_characters':
			case 'warband_events':
			case 'warband_terrain':
				renderView('warbands', null);
			break;
			case 'warband_add_character':
			case 'warband_character_enhancements':
				renderView('warband_characters', null);
			break;
			case 'warband_add_character_enhancement':
				renderView('warband_character_enhancements', null);
			break;
			case 'warband_add_event':
				renderView('warband_events', null);
			break;
			case 'warband_add_terrain':
				renderView('warband_terrain', null);
			break;
			case 'scenario':
				renderView('scenarios', null);
			break;
			case 'scenario_backstory':
			case 'scenario_plan':
				renderView('scenario', selectedScenarioId);
			break;
			case 'settings':
			case 'faqs':
				renderView('misc', null);
			break;
			case 'faq':
				renderView('faqs', null);
			break;
		}
	});
	
	$('#add').tap(function() {
		switch(currentTemplateId) {
			case 'warbands':
				selectedWarbandId = null;
				renderView('warband', null);
			break;
			case 'warband_characters':
				selectedWarbandCharacterId = null;
				renderView('warband_add_character', null);
			break;
			case 'warband_character_enhancements':
				renderView('warband_add_character_enhancement', null);
			break;
			case 'warband_events':
				renderView('warband_add_event', null);
			break;
			case 'warband_terrain':
				renderView('warband_add_terrain', null);
			break;
		}
	});
	
	$('nav').find('a').tap(function() {
		$('nav').find('a').removeClass('active');
		renderView($(this).attr('data-template-id'), null);
		$(this).addClass('active');
	});
	
	$.getJSON('static-data.json', function(json) {
		staticData = JSON.parse(json);
		renderView('factions', null);
		$('nav').find('[data-template-id=factions]').addClass('active');
	});
	
}, false);