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
	templateData.rice_limit = warbands[selectedWarbandId].riceLimit;
	templateData.complete = (parseInt(templateData.rice_limit, 10) === templateData.total_rice_cost);
}

function setContentScrollViewWrapperDimensions() {
	$('.content-view .content-view-scroll-wrapper').css({width: contentViewWidth+'px', height: $('.content').height()+'px'});
}

function renderTemplate(templateId, templateData) {
	$('.content').empty().html(Mustache.render(staticData.templates[templateId], templateData));
	setContentScrollViewWrapperDimensions();
	if (['warband_characters','warband_character_enhancements','warband_events','warband_terrain'].indexOf(templateId) >= 0) {
		$('.warband-tabs-rice-wrapper .segmented-control').css('width', (contentViewWidth - 70)+'px'); // 5px left margin, 60px badge, 5px right margin
	}
	currentTemplateId = templateId;
	addEventsToRenderedView();
}

function setTitle(str) {
	$('#title').html(htmlEncode(str));
}

function showBackButton() {
	$('#back').addClass('shown');
}

function hideBackButton() {
	$('#back').removeClass('shown');
}

function showAddButton() {
	$('#add').addClass('shown');
}

function hideAddButton() {
	$('#add').removeClass('shown');
}

function blurFormElements() {
	$('input,select').blur();
}

function renderView(templateId, contentId) {
	var templateData = {};
	switch(templateId) {
		case 'factions':
			setTitle('Factions');
			templateData.factions = [];
			Object.keys(staticData.factions).forEach(function(factionId) {
				templateData.factions.push(staticData.factions[factionId]);
			});
			hideBackButton();
			hideAddButton();
		break;
		case 'faction_characters':
			selectedFactionId = contentId;
			setTitle(staticData.factions[contentId].name);
			templateData.characters = [];
			Object.keys(staticData.factions[contentId].characters).forEach(function(characterId) {
				templateData.characters.push({
					id: characterId,
					name: staticData.factions[contentId].characters[characterId].name,
					rice: ((parseInt(staticData.factions[contentId].characters[characterId].rice, 10) === 0) ? '-':staticData.factions[contentId].characters[characterId].rice)
				});
			});
			showBackButton();
			hideAddButton();
		break;
		case 'character_cards':
			setTitle(staticData.factions[selectedFactionId].characters[contentId].name);
			templateData.cards = staticData.factions[selectedFactionId].characters[contentId].cards;
			showBackButton();
			hideAddButton();
		break;
		case 'warbands':
			loadWarbands(function() {
				setTitle('Warbands');
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
					hideBackButton();
					showAddButton();
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband':
			setTitle(((selectedWarbandId === null) ? 'Create':'Edit')+' warband');
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
			showBackButton();
			hideAddButton();
		break;
		case 'warband_characters':
			loadWarbands(function() {
				setTitle(warbands[selectedWarbandId].name);
				addWarbandRiceStatsToTemplateData(templateData);
				templateData.characters = [];
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
						templateData.characters.sort(sortObjectArrayByNameProperty);
					}
					showBackButton();
					showAddButton();
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_character':
			loadWarbands(function() {
				setTitle('Add character to warband');
				showBackButton();
				hideAddButton();
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_character_enhancements':
			loadWarbands(function() {
				setTitle(warbands[selectedWarbandId].getCharacterName(selectedWarbandCharacterId)+' enhancements');
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
					showBackButton();
					showAddButton();
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_character_enhancement':
			loadWarbandsCharacterEnhancements(function() {
				setTitle('Add enhancement to '+htmlEncode(warbands[selectedWarbandId].getCharacterName(selectedWarbandCharacterId)));
				showBackButton();
				hideAddButton();
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_events':
			loadWarbands(function() {
				setTitle(warbands[selectedWarbandId].name);
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
					showBackButton();
					showAddButton();
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_event':
			loadWarbandsEvents(function() {
				setTitle('Add warband event');
				showBackButton();
				hideAddButton();
				renderTemplate(templateId, templateData);
			});
		break;
		case 'warband_terrain':
			loadWarbands(function() {
				setTitle(warbands[selectedWarbandId].name);
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
					showBackButton();
					showAddButton();
					renderTemplate(templateId, templateData);
				});
			});
		break;
		case 'warband_add_terrain':
			loadWarbandsTerrain(function() {
				setTitle('Add warband terrain');
				showBackButton();
				hideAddButton();
				renderTemplate(templateId, templateData);
			});
		break;
		case 'scenarios':
			setTitle('Scenarios');
			templateData.scenarios = [];
			Object.keys(staticData.scenarios).forEach(function(scenarioId) {
				templateData.scenarios.push(staticData.scenarios[scenarioId]);
			});
			hideBackButton();
			hideAddButton();
		break;
		case 'scenario':
			setTitle(staticData.scenarios[contentId].name);
			templateData = staticData.scenarios[contentId];
			showBackButton();
			hideAddButton();
		break;
		case 'scenario_backstory':
			setTitle(staticData.scenarios[contentId].name);
			templateData.content = staticData.scenarios[contentId].story;
			showBackButton();
			hideAddButton();
		break;
		case 'scenario_plan':
			setTitle(staticData.scenarios[contentId].name);
			templateData.image = staticData.scenarios[contentId].image;
			showBackButton();
			hideAddButton();
		break;
		case 'guides':
			setTitle('Guides');
			templateData.guides = [];
			Object.keys(staticData.guides).forEach(function(guideId) {
				templateData.guides.push(staticData.guides[guideId]);
			});
			hideBackButton();
			hideAddButton();
		break;
		case 'misc':
			setTitle('Misc.');
			hideBackButton();
			hideAddButton();
		break;
		case 'settings':
			setTitle('Settings');
			templateData.settings = [];
			Object.keys(staticData.settings).forEach(function(settingId) {
				templateData.settings.push(staticData.settings[settingId]);
			});
			showBackButton();
			hideAddButton();
		break;
		case 'faqs':
			setTitle('FAQs');
			templateData.faqs = [];
			Object.keys(staticData.faqs).forEach(function(faqId) {
				templateData.faqs.push(staticData.faqs[faqId]);
			});
			showBackButton();
			hideAddButton();
		break;
		case 'faq':
			setTitle(staticData.faqs[contentId].title);
			templateData = staticData.faqs[contentId];
			showBackButton();
			hideAddButton();
		break;
	}
	renderTemplate(templateId, templateData);
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
			templateData.characters.push({
				id: factionCharacterId,
				name: staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].name,
				rice: ((staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].rice === 0) ? '-':staticData.factions[warbands[selectedWarbandId].faction].characters[factionCharacterId].rice)
			});
		}
	});
	loadSettings(function() {
		if (settingIsEnabled('lexicographicalsort')) {
			templateData.characters.sort(sortObjectArrayByNameProperty);
		}
		$('.content-items-list').empty().html(Mustache.render(staticData.templates.character_suggestions, templateData));
		setContentScrollViewWrapperDimensions();
		$('.content-items-list').find('.listing-block').tap(function() {
			blurFormElements();
			warbands[selectedWarbandId].addCharacter($(this).attr('data-character-id'));
			warbands[selectedWarbandId].save(function() {
				renderView('warband_characters', null);
			});
		});
	});
}

function populateCharacterEnhancementSuggestions(search) {
	var templateData = {
		character_enhancements: []
	};
	warbandsCharacterEnhancements.forEach(function(warbandsCharacterEnhancement) {
		if (search.length === 0 || (warbandsCharacterEnhancement.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			templateData.character_enhancements.push({
				name: warbandsCharacterEnhancement.name,
				numeric_rice_cost: warbandsCharacterEnhancement.rice,
				rice: ((warbandsCharacterEnhancement.rice === 0) ? '-':warbandsCharacterEnhancement.rice)
			});
		}
	});
	loadSettings(function() {
		if (settingIsEnabled('lexicographicalsort')) {
			templateData.character_enhancements.sort(sortObjectArrayByNameProperty);
		}
		$('.content-items-list').empty().html(Mustache.render(staticData.templates.character_enhancement_suggestions, templateData));
		setContentScrollViewWrapperDimensions();
		$('.content-items-list').find('.listing-block').tap(function() {
			blurFormElements();
			$('#field-name').val($(this).attr('data-name'));
			$('#field-rice').val($(this).attr('data-rice'));
			$('#button-save').trigger('tap');
		});
	});
}

function populateEventSuggestions(search) {
	var templateData = {
		events: []
	};
	warbandsEvents.forEach(function(warbandEvent) {
		if (search.length === 0 || (warbandEvent.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			templateData.events.push({
				name: warbandEvent.name,
				numeric_rice_cost: warbandEvent.rice,
				rice: ((warbandEvent.rice === 0) ? '-':warbandEvent.rice)
			});
		}
	});
	loadSettings(function() {
		if (settingIsEnabled('lexicographicalsort')) {
			templateData.events.sort(sortObjectArrayByNameProperty);
		}
		$('.content-items-list').empty().html(Mustache.render(staticData.templates.event_suggestions, templateData));
		setContentScrollViewWrapperDimensions();
		$('.content-items-list').find('.listing-block').tap(function() {
			blurFormElements();
			$('#field-name').val($(this).attr('data-name'));
			$('#field-rice').val($(this).attr('data-rice'));
			$('#button-save').trigger('tap');
		});
	});
}

function populateTerrainSuggestions(search) {
	var templateData = {
		terrain: []
	};
	warbandsTerrain.forEach(function(warbandTerrainItem) {
		if (search.length === 0 || (warbandTerrainItem.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			templateData.terrain.push({
				name: warbandTerrainItem.name,
				numeric_rice_cost: warbandTerrainItem.rice,
				rice: ((warbandTerrainItem.rice === 0) ? '-':warbandTerrainItem.rice)
			});
		}
	});
	loadSettings(function() {
		if (settingIsEnabled('lexicographicalsort')) {
			templateData.events.sort(sortObjectArrayByNameProperty);
		}
		$('.content-items-list').empty().html(Mustache.render(staticData.templates.terrain_suggestions, templateData));
		setContentScrollViewWrapperDimensions();
		$('.content-items-list').find('.listing-block').tap(function() {
			blurFormElements();
			$('#field-name').val($(this).attr('data-name'));
			$('#field-rice').val($(this).attr('data-rice'));
			$('#button-save').trigger('tap');
		});
	});	
}

function addEventsToRenderedView() {
	switch(currentTemplateId) {
		case 'factions':
			$('.content-items-list').find('a').tap(function() {
				renderView('faction_characters', $(this).attr('data-faction-id'));
			});
			return;
		case 'faction_characters':
			$('.content-items-list').find('a').tap(function() {
				renderView('character_cards', $(this).attr('data-character-id'));
			});
			return;
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
								character.enhancements.sort(sortObjectArrayByNameProperty);
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
			return;
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
				blurFormElements();
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
			return;
		case 'warband_characters':
			$('.content-view').find('.control-item').tap(function() {
				if ($(this).hasClass('events')) {
					renderView('warband_events', null);
				} else if ($(this).hasClass('terrain')) {
					renderView('warband_terrain', null);
				}
			});
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block').tap(function() {
				if ($(this).hasClass('edit')) {
					selectedWarbandCharacterId = $(this).attr('data-warband-character-id');
					renderView('warband_character_enhancements', null);
				} else if ($(this).hasClass('delete')) {
					var warbandCharacterId = $(this).attr('data-warband-character-id');
					navigator.notification.confirm(
						'Are you sure you want to delete '+warbands[selectedWarbandId].getCharacterName(warbandCharacterId)+' from '+warbands[selectedWarbandId].name+'?',
						function(button) {
							if (button !== 2) {
								return;
							}
							warbands[selectedWarbandId].removeCharacter(warbandCharacterId);
							warbands[selectedWarbandId].save(function() {
								renderView('warband_characters', null);
							});
						},
						'Delete warband character',
						['Cancel','Delete']
					);
				}
			});
			$('.content-items-list').find('.listing-block').tap(function() {
				selectedWarbandCharacterId = $(this).attr('data-warband-character-id');
				selectedFactionId = warbands[selectedWarbandId].faction;
				renderView('character_cards', warbands[selectedWarbandId].getFactionCharacterId(selectedWarbandCharacterId));
			});
			return;
		case 'warband_add_character':
			populateCharacterSuggestions('');
			$('#field-search').keyup(function() {
				populateCharacterSuggestions($(this).val());
			});
			$('.content-view').find('form').on('submit', function(e) {
				e.preventDefault();
			});
			return;
		case 'warband_character_enhancements':
			$('.content-view').find('.control-item').tap(function() {
				if ($(this).hasClass('characters')) {
					renderView('warband_characters', null);
				} else if ($(this).hasClass('events')) {
					renderView('warband_events', null);
				} else if ($(this).hasClass('terrain')) {
					renderView('warband_terrain', null);
				}
			});
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
						warbands[selectedWarbandId].save(function() {
							renderView('warband_character_enhancements', null);
						});
					},
					'Delete enhancement',
					['Cancel','Delete']
				);
			});
			return;
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
				blurFormElements();
				warbandsCharacterEnhancementRice = parseInt(warbandsCharacterEnhancementRice, 10);
				saveWarbandsCharacterEnhancementIfNew(warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice, function() {
					warbands[selectedWarbandId].addCharacterEnhancement(selectedWarbandCharacterId, warbandsCharacterEnhancementName, warbandsCharacterEnhancementRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_character_enhancements', null);
					});
				});
			});
			return;
		case 'warband_events':
			$('.content-view').find('.control-item').tap(function() {
				if ($(this).hasClass('characters')) {
					renderView('warband_characters', null);
				} else if ($(this).hasClass('terrain')) {
					renderView('warband_terrain', null);
				}
			});
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
						warbands[selectedWarbandId].save(function() {
							renderView('warband_events', null);
						});
					},
					'Delete warband event',
					['Cancel','Delete']
				);
			});
			return;
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
						'Please enter the event name',
						function() {
							$('#field-name').focus();
						}
					);
					return;
				}
				if (!warbandEventRice.match(/^[0-9]{1,2}$/)) {
					navigator.notification.alert(
						'Please enter the event rice cost',
						function() {
							$('#field-rice').focus();
						}
					);
					return;
				}
				blurFormElements();
				warbandEventRice = parseInt(warbandEventRice, 10);
				saveWarbandsEventIfNew(warbandEventName, warbandEventRice, function() {
					warbands[selectedWarbandId].addEvent(warbandEventName, warbandEventRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_events', null);
					});
				});
			});
			return;
		case 'warband_terrain':
			$('.content-view').find('.control-item').tap(function() {
				if ($(this).hasClass('characters')) {
					renderView('warband_characters', null);
				} else if ($(this).hasClass('events')) {
					renderView('warband_events', null);
				}
			});
			setupSwipeableListing($('.content-items-list'));
			$('.content-items-list').find('.action-block.delete').tap(function() {
				var warbandTerrainId = $(this).attr('data-warband-terrain-id');
				navigator.notification.confirm(
					'Are you sure you want to delete the terrain "'+warbands[selectedWarbandId].terrain[warbandTerrainId].name+'" from '+warbands[selectedWarbandId].name+'?',
					function(button) {
						if (button !== 2) {
							return;
						}
						warbands[selectedWarbandId].removeTerrainItem(warbandTerrainId);
						warbands[selectedWarbandId].save(function() {
							renderView('warband_terrain', null);
						});
					},
					'Delete warband terrain item',
					['Cancel','Delete']
				);
			});
			return;
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
				blurFormElements();
				warbandTerrainItemRice = parseInt(warbandTerrainItemRice, 10);
				saveWarbandsTerrainItemIfNew(warbandTerrainItemName, warbandTerrainItemRice, function() {
					warbands[selectedWarbandId].addTerrainItem(warbandTerrainItemName, warbandTerrainItemRice);
					warbands[selectedWarbandId].save(function() {
						renderView('warband_terrain', null);
					});
				});
			});
			return;
		case 'scenarios':
			$('.content-view').find('.random-scenario').tap(function() {
				var scenarioIds = Object.keys(staticData.scenarios);
				renderView('scenario', scenarioIds[(randomIntFromInterval(1, scenarioIds.length) - 1)]);
			});
			$('.content-items-list').find('a').tap(function() {
				selectedScenarioId = $(this).attr('data-scenario-id');
				renderView('scenario', selectedScenarioId);
			});
			return;
		case 'scenario':
			$('.content-view').find('.btn.backstory').tap(function() {
				renderView('scenario_backstory', selectedScenarioId);
			});
			$('.content-view').find('.btn.plan').tap(function() {
				renderView('scenario_plan', selectedScenarioId);
			});
			return;
		case 'guides':
			$('.content-items-list').find('a').tap(function() {
				cordova.plugins.disusered.open(decodeURIComponent(cordova.file.applicationDirectory)+'www/'+$(this).attr('data-url'));
			});
			return;
		case 'misc':
			$('.content-items-list').find('a').tap(function() {
				renderView($(this).attr('data-template-id'), null);
			});
			return;
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
			return;
		case 'faqs':
			$('.content-items-list').find('a').tap(function() {
				renderView('faq', $(this).attr('data-faq-id'));
			});
			return;
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
			return;
	}
}

document.addEventListener('deviceready', function() {
	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	contentViewWidth = $('.content').width();
	
	$('#back').tap(function() {
		blurFormElements();
		switch(currentTemplateId) {
			case 'faction_characters':
				renderView('factions', null);
				return;
			case 'character_cards':
				if ($('nav').find('a.active').attr('data-template-id') === 'warbands') {
					renderView('warband_characters', null);
				} else {
					renderView('faction_characters', selectedFactionId);
				}
				return;
			case 'warband':
			case 'warband_characters':
			case 'warband_events':
			case 'warband_terrain':
				renderView('warbands', null);
				return;
			case 'warband_add_character':
			case 'warband_character_enhancements':
				renderView('warband_characters', null);
				return;
			case 'warband_add_character_enhancement':
				renderView('warband_character_enhancements', null);
				return;
			case 'warband_add_event':
				renderView('warband_events', null);
				return;
			case 'warband_add_terrain':
				renderView('warband_terrain', null);
				return;
			case 'scenario':
				renderView('scenarios', null);
				return;
			case 'scenario_backstory':
			case 'scenario_plan':
				renderView('scenario', selectedScenarioId);
				return;
			case 'settings':
			case 'faqs':
				renderView('misc', null);
				return;
			case 'faq':
				renderView('faqs', null);
				return;
		}
	});
	
	$('#add').tap(function() {
		switch(currentTemplateId) {
			case 'warbands':
				selectedWarbandId = null;
				renderView('warband', null);
				return;
			case 'warband_characters':
				selectedWarbandCharacterId = null;
				renderView('warband_add_character', null);
				return;
			case 'warband_character_enhancements':
				renderView('warband_add_character_enhancement', null);
				return;
			case 'warband_events':
				renderView('warband_add_event', null);
				return;
			case 'warband_terrain':
				renderView('warband_add_terrain', null);
				return;
		}
	});
	
	$('nav').find('a').tap(function() {
		$('nav').find('a').removeClass('active');
		renderView($(this).attr('data-template-id'), null);
		$(this).addClass('active');
	});
	
	$.getJSON('js/static-data.json', function(json) {
		staticData = json;
		Object.keys(staticData.templates).forEach(function(templateId) {
			Mustache.parse(staticData.templates[templateId]);
		});
		$('nav').find('[data-template-id=factions]').trigger('tap');
	});
	
}, false);