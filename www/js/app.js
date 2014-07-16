var animating = false;
var contentViewWidth;
var currentContentViewID = null;
var backContentViewID = null;
var factionImages = {};
var factionIDs = [];
var selectedWarbandID = null;

document.addEventListener('deviceready', function() {

	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	$.each(data.factions, function(factionIndex, faction) {
		$('#warbandfaction').append('<option value="'+faction.id+'">'+htmlEncode(faction.name)+'</option>');
		factionIDs.push(faction.id);
		factionImages[faction.id] = faction.image;
		var factionContentItemsListHTML = '<li>';
			factionContentItemsListHTML += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'">';
				factionContentItemsListHTML += '<span class="cell image"><img src="images/factions/'+faction.image+'"></span>';
				factionContentItemsListHTML += '<span class="cell name">'+htmlEncode(faction.name)+'</span>';
				factionContentItemsListHTML += '<span class="cell icon"><span class="icon icon-right"></span></span></span>';
			factionContentItemsListHTML += '</a>';
		factionContentItemsListHTML += '</li>';
		$('#factions').find('.content-items-list').append(factionContentItemsListHTML);
		var contentHTMLAdditions = '';
		contentHTMLAdditions += '<div class="content-view" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="factions">';
			contentHTMLAdditions += '<div class="content-view-scroll-wrapper">';
				contentHTMLAdditions += '<ul class="table-view">';
					$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
						contentHTMLAdditions += '<li class="table-view-cell"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+factionCharacter.rice+'</span><span class="name">'+htmlEncode(factionCharacter.name)+'</span></a></li>';
					});
				contentHTMLAdditions += '</ul>';
			contentHTMLAdditions += '</div>';
		contentHTMLAdditions += '</div>';
		$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
			contentHTMLAdditions += '<div class="faction-cards slider content-view" id="faction'+factionIndex+'character'+factionCharacterIndex+'cards" data-title="'+htmlEncode(factionCharacter.name)+'" data-back-content-view-id="faction'+factionIndex+'">';
				contentHTMLAdditions += '<div class="slide-group">';
					$.each(factionCharacter.cards, function(factionCharacterContentViewIndex, factionCharacterCard) {
						contentHTMLAdditions += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				contentHTMLAdditions += '</div>';
			contentHTMLAdditions += '</div>';
		});
		$('.content').append(contentHTMLAdditions);
	});
	
	$.each(data.scenarios, function(scenarioIndex, scenario) {
		$('#scenarios').find('.table-view').append('<li class="table-view-cell"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="scenario'+scenarioIndex+'">'+htmlEncode(scenario.name)+'</a></li>');
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
		}
		$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
		swapContentView(currentContentViewID, backContentViewID, 'left');
	});
	
	$('#savewarband').tap(function() {
		$('input,select').blur();
		var warbandFaction = $('#warbandfaction').val();
		var warbandName = $('#warbandname').val().trim();
		var warbandRice = $('#warbandrice').val().trim();
		if ($(this).attr('data-mode') == 'add' && factionIDs.indexOf(warbandFaction) < 0) {
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
		if (!warbandRice.match(/^[0-9]{1,3}$/)) {
			navigator.notification.alert(
				'Please enter a rice limit between 0 and 999',
				function() {
					$('#warbandrice').focus();
				}
			);
			return;
		}
		if ($(this).attr('data-mode') == 'edit') {
			warbands['id_'+selectedWarbandID].name = warbandName;
			warbands['id_'+selectedWarbandID].rice = warbandRice;
		} else {
			var newWarbandID = generateUUID();
			warbands['id_'+newWarbandID] = new Warband();
			warbands['id_'+newWarbandID].id = newWarbandID;
			warbands['id_'+newWarbandID].faction = warbandFaction;
			warbands['id_'+newWarbandID].name = warbandName;
			warbands['id_'+newWarbandID].rice = warbandRice;
			selectedWarbandID = newWarbandID;
		}
		warbands['id_'+selectedWarbandID].save(function() {
			drawWarbands();
			drawWarbandCharacters();
			$('#add').attr('data-target-content-view-id', 'warbandcharacter').show();
			swapContentView('warband', 'warbandcharacters', null);
		});
	});
	
	$('#randomscenario').tap(function() {
		if (animating) return;
		swapContentView('scenarios', 'scenario'+randomIntFromInterval(0, data.scenarios.length - 1), 'right');
	});
	
	$('a.pdf').tap(function() {
		PDFReader.open(cordova.file.applicationDirectory+'www/'+$(this).attr('data-url'));
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
	$('#add').hide();
	switch (targetContentViewID) {
		case 'warbands':
			$('#add').attr('data-target-content-view-id', 'warband').show();
		break;
		case 'warband':
			if ($(tappedElement).attr('id') == 'add') {
				$('#'+targetContentViewID).attr('data-title', 'Add a Warband');
				$('#savewarband').attr('data-mode', 'add');
				$('#warbandfaction').val(factionIDs[0]);
				$('#warbandname').val('');
				$('#warbandrice').val('');
				$('#warbandfaction').removeAttr('disabled');
				break;
			}
			$('#'+targetContentViewID).attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
			$('#savewarband').attr('data-mode', 'edit');
			$('#warbandfaction').val(warbands['id_'+selectedWarbandID].faction);
			$('#warbandname').val(htmlEncode(warbands['id_'+selectedWarbandID].name));
			$('#warbandrice').val(warbands['id_'+selectedWarbandID].rice);
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
			$('#warbandcharacter').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
			if ($(tappedElement).attr('id') == 'add') {
				var html = '<div class="heading">';
					html += 'Add a character to Warband';
					html += '<form><input id="warbandcharactersearch" type="search" placeholder="Search"></form>';
				html += '</div>';
				html += '<ul class="table-view"></ul>';
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
			
		break;
		case 'warbandevent':
			$('#warbandevent').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
			if ($(tappedElement).attr('id') == 'add') {
				
				break;
			}
			
		break;
		case 'warbandterrainitem':
			$('#warbandterrainitem').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
			if ($(tappedElement).attr('id') == 'add') {
				
				break;
			}
			
		break;
	}
	$('#'+currentContentViewID).find('.swipe-wrapper.offset').removeClass('offset');
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
	$.each(data.factions, function(factionIndex, faction) {
		if (warbands['id_'+selectedWarbandID].faction == faction.id) {
			$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
				if (search.length == 0 || (factionCharacter.name.toLowerCase()).indexOf(search.toLowerCase()) >= 0) {
					html += '<li class="table-view-cell">';
						html += '<a class="select-character" data-character-id="'+factionCharacter.id+'">';
							html += '<span class="badge">'+factionCharacter.rice+'</span>';
							html += '<span class="name">'+htmlEncode(factionCharacter.name)+'</span>';
						html += '</a>';
					html += '</li>';
				}
			});
		}
	});
	$('#warbandcharacter').find('.table-view').empty().append(html).find('.select-character').click(function() {
		//$(this).attr('data-character-id')
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
	$('#'+id).find('.swipe-wrapper').swipeLeft(function() {
		$(this).addClass('offset');
	}).swipeRight(function() {
		$(this).removeClass('offset');
	});
	$('#'+id).find('.change-content-view').tap(function() {
		changeContentView(this);
	});
	$('#'+id).find('.edit').css('margin-left', contentViewWidth+'px');
	$('#'+id).find('.delete').css('margin-left', (contentViewWidth + 70)+'px');
}

function drawWarbands() {
	var html = '';
	for (var prop in warbands) {
		html += '<li>';
			html += '<div class="swipe-wrapper">';
				html += '<a class="action-block edit change-content-view appear-from-right" data-target-content-view-id="warband" data-warband-id="'+warbands[prop].id+'"><span class="icon-wrapper"><span class="icon icon-edit"></span></span></a>';
				html += '<a class="action-block delete" data-warband-id="'+warbands[prop].id+'"><span class="icon-wrapper"><span class="icon icon-trash"></span></span></a>';
				html += '<a class="listing-block change-content-view appear-from-right" data-target-content-view-id="warbandcharacters" data-warband-id="'+warbands[prop].id+'">';
					html += '<span class="cell image"><img src="images/factions/'+factionImages[warbands[prop].faction]+'"></span>';
					html += '<span class="cell name">'+htmlEncode(warbands[prop].name)+'</span>';
					html += '<span class="cell icon"><span class="icon icon-right"></span></span></span>';
				html += '</a>';
			html += '</div>';
		html += '</li>';
	}
	$('#warbands').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbands');
	$('#warbands').find('.delete').tap(function() {
		deleteWarband($(this).attr('data-warband-id'));
	});
}

function setWarbandContentScreenTitleAndSubNavSelection(id) {
	$('#'+id).attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
	$('#'+id).find('.control-item').each(function(index) {
		if ($(this).attr('data-selection')) $(this).addClass('active');
		else $(this).removeClass('active');
	});
}

function drawWarbandCharacters() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandcharacters');
	var html = '';
	
	$('#warbandcharacters').find('.list').empty().append(html);
	setupWarbandSwipeableListing('warbandcharacters');
	$('#warbandcharacters').find('.delete').tap(function() {
		deleteWarbandCharacter($(this).attr('data-warband-character-id'));
	});
}

function drawWarbandEvents() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandevents');
	var html = '';
	
	$('#warbandevents').find('.list').empty().append(html);
	setupWarbandSwipeableListing('warbandevents');
	$('#warbandevents').find('.delete').tap(function() {
		deleteWarbandEvent($(this).attr('data-warband-event-id'));
	});
}

function drawWarbandTerrain() {
	setWarbandContentScreenTitleAndSubNavSelection('warbandterrain');
	var html = '';
	
	$('#warbandterrain').find('.content-items-list').empty().append(html);
	setupWarbandSwipeableListing('warbandterrain');
	$('#warbandterrain').find('.delete').tap(function() {
		deleteWarbandTerrain($(this).attr('data-warband-terrain-id'));
	});
}

function deleteWarband(id) {
	navigator.notification.confirm(
		'Are you sure you want to delete the Warband "'+warbands['id_'+id].name+'"?',
		function(button) {
			if (button != 2) return;
			warbands['id_'+id].delete(function() {
				delete warbands['id_'+id];
				drawWarbands();
			});
		},
		'Delete Warband',
		['Cancel','Delete']
	);
}

function deleteWarbandCharacter(id) {
	navigator.notification.confirm(
		'Are you sure you want to delete the character "" from the Warband "'+warbands['id_'+selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
			
			warbands['id_'+selectedWarbandID].save(function() {
				
				drawWarbandCharacters();
			});
		},
		'Delete Warband character',
		['Cancel','Delete']
	);
}

function deleteWarbandEvent(id) {
	navigator.notification.confirm(
		'Are you sure you want to delete the event "" from the Warband "'+warbands['id_'+selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
			
			warbands['id_'+selectedWarbandID].save(function() {
				
				drawWarbandEvents();
			});
		},
		'Delete Warband event',
		['Cancel','Delete']
	);
}

function deleteWarbandTerrain(id) {
	navigator.notification.confirm(
		'Are you sure you want to delete the terrain item "" from the Warband "'+warbands['id_'+selectedWarbandID].name+'"?',
		function(button) {
			if (button != 2) return;
			
			warbands['id_'+selectedWarbandID].save(function() {
				
				drawWarbandTerrain();
			});
		},
		'Delete Warband terrain item',
		['Cancel','Delete']
	);
}