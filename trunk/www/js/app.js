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
		$('#editwarbandfaction').append('<option value="'+faction.id+'">'+htmlEncode(faction.name)+'</option>');
		factionIDs.push(faction.id);
		factionImages[faction.id] = faction.image;
		$('#factions').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'"><img class="media-object pull-left faction-image" src="images/factions/'+faction.image+'"><div class="media-body">'+htmlEncode(faction.name)+'</div></a></li>');
		var html = '';
		html += '<div class="content-view" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="factions">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<ul class="table-view">';
					$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
						html += '<li class="table-view-cell"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+factionCharacter.rice+'</span><span class="name">'+htmlEncode(factionCharacter.name)+'</span></a></li>';
					});
				html += '</ul>';
			html += '</div>';
		html += '</div>';
		$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
			html += '<div class="slider content-view" id="faction'+factionIndex+'character'+factionCharacterIndex+'cards" data-title="'+htmlEncode(factionCharacter.name)+'" data-back-content-view-id="faction'+factionIndex+'">';
				html += '<div class="slide-group">';
					$.each(factionCharacter.cards, function(factionCharacterContentViewIndex, factionCharacterCard) {
						html += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				html += '</div>';
			html += '</div>';
		});
		$('.content').append(html);
	});
	
	loadWarbands(function() {
		drawWarbands();
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
		if (animating) return;
		window.plugin.statusbarOverlay.isHidden(function(isHidden) {
			if (!isHidden) window.plugin.statusbarOverlay.hide();
		});
		if (Keyboard.isVisible) return;
		var targetContentViewID = $(this).attr('data-target-content-view-id');
		if (targetContentViewID == currentContentViewID) return;
		if ($(this).attr('data-warband-id')) selectedWarbandID = $(this).attr('data-warband-id');
		var changeContentViewCallback = null;
		switch ($(this).attr('id')) {
			case 'addwarband':
				$('#'+targetContentViewID).attr('data-title', 'Add a Warband');
				$('#'+targetContentViewID).attr('data-back-content-view-id', 'warbands');
				$('#savewarband').attr('data-mode', 'add');
				$('#editwarbandfaction').val('');
				$('#editwarbandname').val('');
				$('#editwarbandrice').val('');
				$('#editwarbandfaction').removeAttr('disabled');
				$('#editwarbandname').removeAttr('disabled');
				$('#editwarbandrice').removeAttr('disabled');
			break;
			case 'editwarband':
				$('#'+targetContentViewID).attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
				$('#'+targetContentViewID).attr('data-back-content-view-id', 'warbandcharacters');
				$('#savewarband').attr('data-mode', 'edit');
				$('#editwarbandfaction').val(warbands['id_'+selectedWarbandID].faction);
				$('#editwarbandname').val(htmlEncode(warbands['id_'+selectedWarbandID].name));
				$('#editwarbandrice').val(warbands['id_'+selectedWarbandID].rice);
				$('#editwarbandfaction').attr('disabled', 'disabled');
				$('#editwarbandname').removeAttr('disabled');
				$('#editwarbandrice').removeAttr('disabled');
			break;
		}
		switch (targetContentViewID) {
			case 'warbandcharacters':
				drawWarbandCharacters();
				/*
				forEach (warbands['id_'+selectedWarbandID].characters {
					html += '<li class="table-view-cell"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="editwarbandcharacter"><span class="badge">'+factionCharacter.rice+'</span><span class="name">'+htmlEncode(factionCharacter.name)+'</span></a></li>';
				}
				*/
			break;
			case 'warbandevents':
				drawWarbandEvents();
				
			break;
			case 'warbandterrain':
				drawWarbandTerrain();
				
			break;
		}
		changeContentView(currentContentViewID, targetContentViewID, (($(this).hasClass('appear-from-right')) ? 'right':'none'), changeContentViewCallback);
		if ($(this).hasClass('tab-item')) {
			$('nav a').each(function(index) {
				$(this).removeClass('active');
			});
			$(this).addClass('active');
		}
	});
	
	$('#back').tap(function() {
		if (animating) return;
		if (Keyboard.isVisible) return;
		changeContentView(currentContentViewID, backContentViewID, 'left', null);
	});
	
	$('#savewarband').tap(function() {
		if (Keyboard.isVisible) return;
		var warbandFaction = $('#editwarbandfaction').val();
		var warbandName = $('#editwarbandname').val().trim();
		var warbandRice = $('#editwarbandrice').val().trim();
		if ($(this).attr('data-mode') == 'add' && factionIDs.indexOf(warbandFaction) < 0) {
			navigator.notification.alert(
				'Please select a faction',
				function() {
					$('#editwarbandfaction').focus();
				}
			);
			return;
		}
		if (!warbandName.length) {
			navigator.notification.alert(
				'Please enter a Warband name',
				function() {
					$('#editwarbandname').focus();
				}
			);
			return;
		}
		if (warbandName.length > 28) {
			navigator.notification.alert(
				'Warband names are limited to 28 characters',
				function() {
					$('#editwarbandname').focus();
				}
			);
			return;
		}
		if (!warbandRice.match(/^[0-9]{1,3}$/)) {
			navigator.notification.alert(
				'Please enter a rice limit',
				function() {
					$('#editwarbandrice').focus();
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
			changeContentView('editwarband', 'warbandcharacters', 'none', null);
		});
	});
	
	$('#randomscenario').tap(function() {
		if (animating) return;
		changeContentView('scenarios', 'scenario'+randomIntFromInterval(0, data.scenarios.length - 1), 'right', null);
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

function changeContentView(visibleContentViewID, newContentViewID, direction, callback) {
	animating = true;
	$('.content-view').each(function(index) {
		if ($(this).css('display') != 'none' && $(this).attr('id') != visibleContentViewID) $(this).hide().removeClass('animation').removeClass('animatable');
	});
	var visibleContentView = $('#'+visibleContentViewID);
	var newContentView = $('#'+newContentViewID);
	if (newContentView.hasClass('slider')) newContentView.find('.slide-group').css('-webkit-transform', 'translateX(0)');
	var newContentViewScrollWapper = newContentView.find('.content-view-scroll-wrapper');
	if (direction == 'none') {
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
	if (callback != null) callback();
}

function drawWarbands() {
	$('#warbands').find('.table-view').empty();
	for (var prop in warbands) {
		$('#warbands').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="warbandcharacters" data-warband-id="'+warbands[prop].id+'"><img class="media-object pull-left faction-image" src="images/factions/'+factionImages[warbands[prop].faction]+'"><div class="media-body">'+htmlEncode(warbands[prop].name)+'</div></a></li>');
	}
}

function drawWarbandCharacters() {
	$('#warbandcharacters').find('.table-view').empty();
	$('#warbandcharacters').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
	$('#warbandcharacters').find('.control-item').each(function(index) {
		if ($(this).attr('data-selection')) $(this).addClass('active');
		else $(this).removeClass('active');
	});
	
}

function drawWarbandEvents() {
	$('#warbandevents').find('.table-view').empty();
	$('#warbandevents').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
	$('#warbandevents').find('.control-item').each(function(index) {
		if ($(this).attr('data-selection')) $(this).addClass('active');
		else $(this).removeClass('active');
	});
	
}

function drawWarbandTerrain() {
	$('#warbandterrain').find('.table-view').empty();
	$('#warbandterrain').attr('data-title', htmlEncode(warbands['id_'+selectedWarbandID].name));
	$('#warbandterrain').find('.control-item').each(function(index) {
		if ($(this).attr('data-selection')) $(this).addClass('active');
		else $(this).removeClass('active');
	});
	
}

function deleteWarband(id) {
	navigator.notification.confirm(
		'Are you sure you want to delete this Warband?',
		function(button) {
			if (button != 2) return;
			warbands['id_'+id].delete();
			delete warbands['id_'+id];
			drawWarbands();
		},
		'Delete Warband',
		'Cancel,Open'
	);
}