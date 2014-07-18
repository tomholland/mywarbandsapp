var animating = false;
var contentViewWidth = 0;
var currentContentViewID = null;
var backContentViewID = null;
var selectedWarbandID = null;
var selectedWarbandCharacterID = null;

document.addEventListener('deviceready', function() {

	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	for (var factionID in staticData.factions) {
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
				for (var factionCharacterID in staticData.factions[factionID].characters) {
					contentHTMLAdditions += '<li>';
						contentHTMLAdditions += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction-character-'+factionCharacterID+'-cards">';
							contentHTMLAdditions += '<span class="cell name">'+htmlEncode(staticData.factions[factionID].characters[factionCharacterID].name)+'</span>';
							contentHTMLAdditions += '<span class="cell rice"><span class="badge">'+((staticData.factions[factionID].characters[factionCharacterID].rice == 0) ? '-':staticData.factions[factionID].characters[factionCharacterID].rice)+'</span></span>';
							contentHTMLAdditions += '<span class="cell icon"><span class="icon icon-right"></span></span>';
						contentHTMLAdditions += '</a>';
					contentHTMLAdditions += '</li>';
				}
				contentHTMLAdditions += '</ul>';
			contentHTMLAdditions += '</div>';
		contentHTMLAdditions += '</div>';
		for (var factionCharacterID in staticData.factions[factionID].characters) {
			contentHTMLAdditions += '<div class="faction-cards slider content-view" id="faction-character-'+factionCharacterID+'-cards" data-title="'+htmlEncode(staticData.factions[factionID].characters[factionCharacterID].name)+'" data-faction="'+factionID+'">';
				contentHTMLAdditions += '<div class="slide-group">';
					$.each(staticData.factions[factionID].characters[factionCharacterID].cards, function(index, factionCharacterCard) {
						contentHTMLAdditions += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				contentHTMLAdditions += '</div>';
			contentHTMLAdditions += '</div>';
		}
		$('.content').append(contentHTMLAdditions);
	}
	
	$.each(staticData.scenarios, function(scenarioIndex, scenario) {
		var scenariosContentItemsListHTML = '<li>';
			scenariosContentItemsListHTML += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioIndex+'">';
				scenariosContentItemsListHTML += '<span class="cell name">'+htmlEncode(scenario.name)+'</span>';
				scenariosContentItemsListHTML += '<span class="cell icon"><span class="icon icon-right"></span></span>';
			scenariosContentItemsListHTML += '</a>';
		scenariosContentItemsListHTML += '</li>';
		$('#scenarios').find('.content-items-list').append(scenariosContentItemsListHTML);
		var html = '';
		html += '<div class="content-view content-padded scenario" id="scenario'+scenarioIndex+'" data-title="'+htmlEncode(scenario.name)+'" data-back-content-view-id="scenarios">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<a class="btn change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioIndex+'backstory"><span class="icon icon-right"></span> View backstory</a>';
				html += '<h5>Type</h5>';
				html += '<p>'+htmlEncode(scenario.type)+'</p>';
				html += '<h5>Deployment</h5>';
				html += '<a class="btn scenario-plan change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioIndex+'plan"><span class="icon icon-search"></span> View plan</a>';
				$.each(scenario.deployment, function(scenarioDeploymentItemIndex, scenarioDeploymentItem) {
					html += '<p>'+htmlEncode(scenarioDeploymentItem)+'</p>';
				});
				html += '<h5>Game Length</h5>';
				html += '<p>'+htmlEncode(scenario.game_length)+'</p>';
				if (scenario.hasOwnProperty('objective_interaction')) {
					html += '<h5>Scenario Objective Interaction</h5>';
					$.each(scenario.objective_interaction, function(scenarioObjectiveInteractionIndex, scenarioObjectiveInteraction) {
						html += '<p>'+htmlEncode(scenarioObjectiveInteraction)+'</p>';
					});
				}
				html += '<h5>Victory Conditions</h5>';
				html += '<table class="victory-conditions">';
				$.each(scenario.victory_conditions.points, function(scenarioVictoryConditionsPointIndex, scenarioVictoryConditionsPoint) {
					html += '<tr>';
						html += '<td class="points"><p>1 VP</p></td>';
						html += '<td class="condition"><p>'+htmlEncode(scenarioVictoryConditionsPoint)+'</p></td>';
					html += '</tr>';
				});
				html += '</table>';
				if (scenario.victory_conditions.hasOwnProperty('additional_rules')) html += '<p>'+htmlEncode(scenario.victory_conditions.additional_rules)+'</p>';
			html += '</div>';
		html += '</div>';
		html += '<div class="content-view content-padded scenario-backstory" id="scenario'+scenarioIndex+'backstory" data-title="'+htmlEncode(scenario.name)+': backstory" data-back-content-view-id="scenario'+scenarioIndex+'">';
			html += '<div class="content-view-scroll-wrapper">';
			$.each(scenario.story, function(scenarioStoryParagraphIndex, scenarioStoryParagraph) {
				html += '<p>'+htmlEncode(scenarioStoryParagraph)+'</p>';
			});
			html += '</div>';
		html += '</div>';
		html += '<div class="content-view scenario-image-view content-padded" id="scenario'+scenarioIndex+'plan" data-title="'+htmlEncode(scenario.name)+': plan" data-back-content-view-id="scenario'+scenarioIndex+'">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<img class="scenario-image" src="images/scenarios/'+scenario.image+'">';
			html += '</div>';
		html += '</div>';
		$('.content').append(html);
	});
	
	$('.content-view .content-view-scroll-wrapper').css('height', $('.content').height()+'px');
	contentViewWidth = $('.content').width();
	
	$('#title').html(htmlEncode($('.content .content-view.default').attr('data-title')));
	$('.content .content-view.default').show();
	currentContentViewID = $('.content .content-view.default').attr('id');
	$('nav a').each(function(index) {
		if ($(this).attr('data-target-content-view-id') == currentContentViewID) $(this).addClass('active');
	});
	
	$('.change-content-view').tap(function() {
		changeContentView(this);
	});
	
	loadWarbands(function() {
		drawWarbands();
	});
	
	loadSettings(function() {
		$('#settings').find('.toggle').each(function(index) {
			if (settingIsEnabled($(this).attr('id'))) $(this).addClass('active');
		});
	});
	
	loadCharacterEnhancements();
	
	$('#back').tap(function() {
		if (animating) return;
		$('input,select').blur();
		$('#add').hide();
		switch(backContentViewID) {
			case 'warbands':
				$('#add').attr('data-target-content-view-id', 'warband').show();
			break;
			case 'warbandcharacters':
				$('#add').attr('data-target-content-view-id', 'warbandcharacter').show();
			break;
			case 'warbandevents':
				$('#add').attr('data-target-content-view-id', 'warbandevent').show();
			break;
			case 'warbandterrain':
				$('#add').attr('data-target-content-view-id', 'warbandterrainitem').show();
			break;
			case 'warbandcharacter':
				if (currentContentViewID == 'warbandcharacteraddenhancement') $('#add').attr('data-target-content-view-id', 'warbandcharacteraddenhancement').show();
			break;
		}
		$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
		swapContentView(currentContentViewID, backContentViewID, 'left');
	});
	
	$('#savewarband').tap(function() {
		$('input,select').blur();
		var warbandFaction = $('#warbandfaction').val();
		var warbandName = $('#warbandname').val().trim();
		var warbandRice = $('#warbandrice').val().trim();
		if ($(this).attr('data-mode') == 'add' && Object.keys(staticData.factions).indexOf(warbandFaction) < 0) {
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
		warbandRice = parseInt(warbandRice);
		if ($(this).attr('data-mode') == 'edit') {
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
			$('#add').attr('data-target-content-view-id', 'warbandcharacter').show();
			swapContentView('warband', 'warbandcharacters', null);
		});
	});
	
	$('#warbandcharacterenhancementname').focus(function() {
		$('#warbandcharacteraddenhancement').find('.content-view-scroll-wrapper').scroll(function() {
			$('#warbandcharacterenhancementname').blur();
		});
	}).keyup(function() {
		populateWarbandCharacterEnhancementSuggestions($(this).val());
	}).blur(function() {
		$('#warbandcharacteraddenhancement').find('.content-view-scroll-wrapper').off();
	});
	
	$('#warbandcharacterenhancementrice').focus(function() {
		$('#warbandcharacteraddenhancement').find('.content-view-scroll-wrapper').scroll(function() {
			$('#warbandcharacterenhancementrice').blur();
		});
	}).blur(function() {
		$('#warbandcharacteraddenhancement').find('.content-view-scroll-wrapper').off();
	});
	
	$('#warbandcharactersaveenhancement').tap(function() {
		$('input').blur();
		var characterEnhancementName = $('#warbandcharacterenhancementname').val().trim();
		var characterEnhancementRice = $('#warbandcharacterenhancementrice').val().trim();
		if (!characterEnhancementName.length) {
			navigator.notification.alert(
				'Please enter an enhancement name',
				function() {
					$('#warbandcharacterenhancementname').focus();
				}
			);
			return;
		}
		if (!characterEnhancementRice.match(/^[0-9]{1,2}$/)) {
			navigator.notification.alert(
				'Please enter a rice cost',
				function() {
					$('#warbandcharacterenhancementrice').focus();
				}
			);
			return;
		}
		characterEnhancementRice = parseInt(characterEnhancementRice);
		saveCharacterEnhancementIfNew(characterEnhancementName, characterEnhancementRice, function() {
			warbands[selectedWarbandID].addCharacterEnhancement(selectedWarbandCharacterID, characterEnhancementName, characterEnhancementRice);
			warbands[selectedWarbandID].save(function() {
				drawWarbands();
				drawWarbandCharacters();
				drawEditWarbandCharacter();
				swapContentView('warbandcharacteraddenhancement', 'warbandcharacter', null);
			});
		});
	});
	
	$('#randomscenario').tap(function() {
		if (animating) return;
		swapContentView('scenarios', 'scenario'+randomIntFromInterval(0, staticData.scenarios.length - 1), 'right');
	});
	
	$('#settings').find('.toggle').on('toggle', function(toggleEvent) {
		settings[$(this).attr('id')].save(toggleEvent.detail.isActive);
	});
	
	$('a.pdf').tap(function() {
		cordova.plugins.bridge.open(cordova.file.applicationDirectory+'www/'+$(this).attr('data-url'));
	});
	
	$('a.external').tap(function() {
		window.open(encodeURI($(this).attr('data-url')), '_system');
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

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid.toUpperCase();
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeContentView(tappedElement) {
	if (animating) return;
	window.plugin.statusbarOverlay.isHidden(function(isHidden) {
		if (!isHidden) window.plugin.statusbarOverlay.hide();
	});
	$('input,select').blur();
	var targetContentViewID = $(tappedElement).attr('data-target-content-view-id');
	if (targetContentViewID == currentContentViewID) return;
	if ($(tappedElement).attr('data-warband-id')) selectedWarbandID = $(tappedElement).attr('data-warband-id');
	if ($(tappedElement).attr('data-warband-character-id')) selectedWarbandCharacterID = $(tappedElement).attr('data-warband-character-id');
	$('#add').hide();
	switch (targetContentViewID) {
		case 'warbands':
			$('#add').attr('data-target-content-view-id', 'warband').show();
		break;
		case 'warband':
			if ($(tappedElement).attr('id') == 'add') {
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
			$('#add').attr('data-target-content-view-id', 'warbandcharacter').show();
		break;
		case 'warbandevents':
			drawWarbandEvents();
			$('#add').attr('data-target-content-view-id', 'warbandevent').show();
		break;
		case 'warbandterrain':
			drawWarbandTerrain();
			$('#add').attr('data-target-content-view-id', 'warbandterrainitem').show();
		break;
		case 'warbandcharacter':
			if ($(tappedElement).attr('id') == 'add') {
				$('#warbandcharacter').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
				var html = '<div class="horizontally-padded-wrapper">';
					html += '<span class="subtitle">Add a character to Warband</span>';
					html += '<form onsubmit="return false;"><input id="warbandcharactersearch" type="search" placeholder="Search" autocorrect="off" autocapitalize="off"></form>';
				html += '</div>';
				html += '<ul class="content-items-list"></ul>';
				$('#warbandcharacter').find('.content-view-scroll-wrapper').empty().append(html);
				populateWarbandCharacterSuggestions('');
				$('#warbandcharactersearch').focus(function() {
					$('#warbandcharacter').find('.content-view-scroll-wrapper').scroll(function() {
						$('#warbandcharactersearch').blur();
					});
				}).keyup(function() {
					populateWarbandCharacterSuggestions($(this).val());
				}).blur(function() {
					$('#warbandcharacter').find('.content-view-scroll-wrapper').off();
				});
				break;
			}
			drawEditWarbandCharacter();
		break;
		case 'warbandcharacteraddenhancement':
			$('#warbandcharacteraddenhancement').attr('data-title', htmlEncode(warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+': enhancements'));
			$('#warbandcharacterenhancementname').val('');
			$('#warbandcharacterenhancementrice').val('');
			if (!characterEnhancements.length) $('#warbandcharacteraddenhancement').find('.list-preamble').hide();
			else $('#warbandcharacteraddenhancement').find('.list-preamble').show();
			populateWarbandCharacterEnhancementSuggestions('');
		break;
		case 'warbandevent':
			$('#warbandevent').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
			if ($(tappedElement).attr('id') == 'add') {
				
				break;
			}
			
		break;
		case 'warbandterrainitem':
			$('#warbandterrainitem').attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
			if ($(tappedElement).attr('id') == 'add') {
				
				break;
			}
			
		break;
	}
	$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
	if ($('#'+targetContentViewID).hasClass('faction-cards')) $('#'+targetContentViewID).attr('data-back-content-view-id', ((currentContentViewID == 'warbandcharacters') ? 'warbandcharacters':'faction-'+$('#'+targetContentViewID).attr('data-faction')));
	swapContentView(currentContentViewID, targetContentViewID, (($(tappedElement).hasClass('appear-from-right')) ? 'right':null));
	if ($(tappedElement).hasClass('tab-item')) {
		$('nav a').each(function(index) {
			$(this).removeClass('active');
		});
		$(tappedElement).addClass('active');
	}
}

function populateWarbandCharacterSuggestions(search) {
	var html = '';
	for (var factionCharacterID in staticData.factions[warbands[selectedWarbandID].faction].characters) {
		if (search.length == 0 || (staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-character-id="'+factionCharacterID+'">';
					html += '<span class="cell name">'+htmlEncode(staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].rice == 0) ? '-':staticData.factions[warbands[selectedWarbandID].faction].characters[factionCharacterID].rice)+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	}
	$('#warbandcharacter').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		warbands[selectedWarbandID].addCharacter($(this).attr('data-character-id'));
		warbands[selectedWarbandID].save(function() {
			drawWarbands();
			drawWarbandCharacters();
			$('#add').show();
			swapContentView('warbandcharacter', 'warbandcharacters', 'left');
		});
	});
}

function populateWarbandCharacterEnhancementSuggestions(search) {
	var html = '';
	$.each(characterEnhancements, function(index, characterEnhancement) {
		if (search.length == 0 || (characterEnhancement.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
			html += '<li>';
				html += '<a class="listing-block" data-rice="'+characterEnhancement.rice+'">';
					html += '<span class="cell name">'+htmlEncode(characterEnhancement.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+((characterEnhancement.rice == 0) ? '-':characterEnhancement.rice)+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-plus"></span></span>';
					html += '</a>';
			html += '</li>';
		}
	});
	$('#warbandcharacteraddenhancement').find('.content-items-list').empty().append(html).find('.listing-block').tap(function() {
		$('#warbandcharacterenhancementname').val(htmlEncode($(this).find('.cell.name').text()));
		$('#warbandcharacterenhancementrice').val($(this).attr('data-rice'));
		$('#warbandcharactersaveenhancement').trigger('tap');
	});
}

function swapContentView(visibleContentViewID, newContentViewID, direction) {
	animating = true;
	$('.content-view').each(function(index) {
		if ($(this).css('display') != 'none' && $(this).attr('id') != visibleContentViewID) $(this).hide().removeClass('animation').removeClass('animatable');
	});
	var visibleContentView = $('#'+visibleContentViewID);
	var newContentView = $('#'+newContentViewID);
	if (newContentView.hasClass('slider')) newContentView.find('.slide-group').css('-webkit-transform', 'translateX(0)');
	var newContentViewScrollWapper = newContentView.find('.content-view-scroll-wrapper');
	if (direction == null) {
		newContentView.show();
		if (newContentViewScrollWapper.length) newContentViewScrollWapper[0].scrollTop = 0;
		visibleContentView.hide();
	} else {
		newContentView.css({'left': ((direction == 'left') ? '-'+contentViewWidth+'px':contentViewWidth+'px')}).addClass('animatable').show().addClass('animation');
		if (direction == 'right' && newContentViewScrollWapper.length) newContentViewScrollWapper[0].scrollTop = 0;
		setTimeout(function() { // workaround transition not firing when edited directly
			newContentView.css('left', 0);
		}, 1);
		setTimeout(function() {
			visibleContentView.hide();
			newContentView.removeClass('animation').removeClass('animatable');
		}, 301);
	}
	$('#title').html(htmlEncode($('#'+newContentViewID).attr('data-title')));
	if (newContentView.attr('data-back-content-view-id')) {
		backContentViewID = newContentView.attr('data-back-content-view-id');
		$('#back').show();
	} else {
		backContentViewID = null;
		$('#back').hide();
	}
	currentContentViewID = newContentViewID;
	animating = false;
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

function drawWarbands() {
	var html = '';
	for (var warbandID in warbands) {
		var warbandRice = warbands[warbandID].rice();
		html += '<li>';
			html += '<div class="swipe-wrapper actions-3">';
				html += '<a class="action-block action-1 share" data-warband-id="'+warbandID+'"><span class="icon-wrapper"><span class="icon icon-share"></span></span></a>';
				html += '<a class="action-block action-2 edit change-content-view appear-from-right" data-target-content-view-id="warband" data-warband-id="'+warbandID+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block action-3 delete" data-warband-id="'+warbandID+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="warbandcharacters" data-warband-id="'+warbandID+'">';
					html += '<span class="cell image"><img src="images/factions/'+staticData.factions[warbands[warbandID].faction].image+'"></span>';
					html += '<span class="cell name">'+htmlEncode(warbands[warbandID].name)+'</span>';
					html += '<span class="cell rice warband"><span class="badge'+((warbandRice > warbands[warbandID].riceLimit) ? ' error':'')+'">'+warbandRice+'/'+warbands[warbandID].riceLimit+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-right"></span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	}
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
		} else params.body = Mustache.render(staticData.templates.text, warbands[warbandID].mustacheData());
		cordova.require('emailcomposer.EmailComposer').show(params);
	});
	$('#warbands').find('.delete').tap(function() {
		deleteWarband($(this).attr('data-warband-id'));
	});
}

function setWarbandContentScreenTitleAndSubNavSelection(id) {
	$('#'+id).attr('data-title', htmlEncode(warbands[selectedWarbandID].name));
	$('#'+id).find('.control-item').each(function(index) {
		if ($(this).attr('data-selection')) $(this).addClass('active');
		else $(this).removeClass('active');
	});
}

function drawWarbandCharacters() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandcharacters');
	var html = '';
	for (var warbandCharacterID in warbands[selectedWarbandID].characters) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-2">';
				html += '<a class="action-block action-1 edit change-content-view appear-from-right" data-target-content-view-id="warbandcharacter" data-warband-character-id="'+warbandCharacterID+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block action-2 delete" data-warband-character-id="'+warbandCharacterID+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction-character-'+warbands[selectedWarbandID].getCharacterID(warbandCharacterID)+'-cards">';
					html += '<span class="cell name">'+htmlEncode(warbands[selectedWarbandID].getCharacterName(warbandCharacterID))+'</span>';
					html += '<span class="cell rice warband-character"><span class="badge">'+warbands[selectedWarbandID].characterRiceDetail(warbandCharacterID)+'</span></span>';
					html += '<span class="cell icon"><span class="icon icon-right"></span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	}
	$('#warbandcharacters').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandcharacters');
	$('#warbandcharacters').find('.delete').tap(function() {
		deleteWarbandCharacter($(this).attr('data-warband-character-id'));
	});
}

function drawEditWarbandCharacter() {
	$('#warbandcharacter').attr('data-title', htmlEncode(warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+': enhancements'));
	$('#add').attr('data-target-content-view-id', 'warbandcharacteraddenhancement').show();
	var html = '<ul class="content-items-list">';
	for (var warbandCharacterEnhancementID in warbands[selectedWarbandID].characters[selectedWarbandCharacterID].enhancements) {
		var warbandCharacterEnhancement = warbands[selectedWarbandID].getCharacterEnhancement(selectedWarbandCharacterID, warbandCharacterEnhancementID);
		html += '<li>';
			html += '<div class="swipe-wrapper actions-1">';
				html += '<a class="action-block action-1 delete" data-warband-character-enhancement-id="'+warbandCharacterEnhancementID+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<span class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandCharacterEnhancement.name)+'</span>';
					html += '<span class="cell rice"><span class="badge">'+warbandCharacterEnhancement.rice+'</span></span>';
				html += '</span>';
			html += '</div>';
		html += '</li>';
	}
	html += '</ul>';
	$('#warbandcharacter').find('.content-view-scroll-wrapper').empty().append(html);
	setupWarbandSwipeableListing('warbandcharacter');
	$('#warbandcharacter').find('.delete').tap(function() {
		deleteWarbandCharacterEnhancement($(this).attr('data-warband-character-enhancement-id'));
	});
}

function drawWarbandEvents() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandevents');
	var html = '';
	for (var warbandEventID in warbands[selectedWarbandID].events) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-2">';
				html += '<a class="action-block action-1 edit change-content-view appear-from-right" data-target-content-view-id="warbandevent" data-warband-event-id="'+warbandEventID+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block action-2 delete" data-warband-event-id="'+warbandEventID+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandEventID)+'</span>';
					
				html += '</a>';
			html += '</div>';
		html += '</li>';
	}
	$('#warbandevents').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandevents');
	$('#warbandevents').find('.delete').tap(function() {
		deleteWarbandEvent($(this).attr('data-warband-event-id'));
	});
}

function drawWarbandTerrain() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandterrain');
	var html = '';
	for (var warbandTerrainItemID in warbands[selectedWarbandID].terrain) {
		html += '<li>';
			html += '<div class="swipe-wrapper actions-2">';
				html += '<a class="action-block action-1 edit change-content-view appear-from-right" data-target-content-view-id="warbandterrainitem" data-warband-terrain-item-id="'+warbandTerrainItemID+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block action-2 delete" data-warband-terrain-item-id="'+warbandTerrainItemID+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block">';
					html += '<span class="cell name">'+htmlEncode(warbandTerrainItemID)+'</span>';
					
				html += '</a>';
			html += '</div>';
		html += '</li>';
	}
	$('#warbandterrain').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandterrain');
	$('#warbandterrain').find('.delete').tap(function() {
		deleteWarbandTerrain($(this).attr('data-warband-terrain-item-id'));
	});
}

function deleteWarband(warbandID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the Warband "'+warbands[warbandID].name+'"?',
		function(button) {
			if (button != 2) return;
			warbands[warbandID].delete(function() {
				delete warbands[warbandID];
				drawWarbands();
			});
		},
		'Delete Warband',
		['Cancel','Delete']
	);
}

function deleteWarbandCharacter(warbandCharacterID) {
	navigator.notification.confirm(
		'Are you sure you want to delete '+warbands[selectedWarbandID].getCharacterName(warbandCharacterID)+' from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
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

function deleteWarbandCharacterEnhancement(warbandCharacterEnhancementID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the enhancement "'+warbands[selectedWarbandID].getCharacterEnhancement(selectedWarbandCharacterID, warbandCharacterEnhancementID).name+'" from '+warbands[selectedWarbandID].getCharacterName(selectedWarbandCharacterID)+' in your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
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

function deleteWarbandEvent(warbandEventID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the event "'+warbands[selectedWarbandID].getEvent(warbandEventID).name+'" from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
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

function deleteWarbandTerrain(warbandTerrainItemID) {
	navigator.notification.confirm(
		'Are you sure you want to delete the terrain item "'+warbands[selectedWarbandID].getTerrainItem(warbandTerrainItemID).name+'" from your Warband "'+warbands[selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
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