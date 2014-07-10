var currentContentViewID = null;
var backContentViewID = null;
var backContentViewYScroll = 0;
var factionImages = {};

document.addEventListener('deviceready', function() {

	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	$.each(data.factions, function(factionIndex, faction) {
		factionImages[faction.id] = faction.image;
		$('#factions').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view" data-target-content-view-id="faction'+factionIndex+'"><img class="media-object pull-left faction-image" src="images/factions/'+faction.image+'"><div class="media-body">'+htmlEncode(faction.name)+'</div></a></li>');
		var html = '';
		html += '<div class="content-view remember-position" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="factions">';
			html += '<ul class="table-view">';
				$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
					html += '<li class="table-view-cell"><a class="navigate-right change-content-view" data-target-content-view-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+htmlEncode(factionCharacter.rice)+'</span><span class="name">'+htmlEncode(factionCharacter.name)+'</span></a></li>';
				});
			html += '</ul>';
		html += '</div>';
		$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
			html += '<div class="slider" id="faction'+factionIndex+'character'+factionCharacterIndex+'cards" data-title="'+htmlEncode(factionCharacter.name)+'" data-back-content-view-id="faction'+factionIndex+'">';
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
		$('#scenarios').find('.table-view').append('<li class="table-view-cell"><a class="navigate-right change-content-view" data-target-content-view-id="scenario'+scenarioIndex+'">'+htmlEncode(scenario.name)+'</a></li>');
		var html = '';
		html += '<div class="content-view content-padded scenario" id="scenario'+scenarioIndex+'" data-title="'+htmlEncode(scenario.name)+'" data-back-content-view-id="scenarios">';
			html += '<a class="btn show-backstory" data-scenario="'+scenarioIndex+'" id="scenario'+scenarioIndex+'viewbackstory"><span class="icon icon-right"></span> View backstory</a>';
			html += '<div id="scenario'+scenarioIndex+'backstory" class="scenario-backstory">';
			html += '<a class="btn hide-backstory" data-scenario="'+scenarioIndex+'"><span class="icon icon-down"></span> Hide backstory</a>';
			$.each(scenario.story, function(scenarioStoryParagraphIndex, scenarioStoryParagraph) {
				html += '<p>'+htmlEncode(scenarioStoryParagraph)+'</p>';
			});
			html += '</div>';
			html += '<h5>Type</h5>';
			html += '<p>'+htmlEncode(scenario.type)+'</p>';
			html += '<h5>Deployment</h5>';
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
			//scenario.image
		html += '</div>';
		$('.content').append(html);
	});
	$('.scenario-backstory').hide();
	$('.show-backstory').tap(function() {
		$(this).hide();
		$('#scenario'+$(this).attr('data-scenario')+'backstory').show();
	});
	$('.hide-backstory').tap(function() {
		$('#scenario'+$(this).attr('data-scenario')+'backstory').hide();
		$('#scenario'+$(this).attr('data-scenario')+'viewbackstory').show();
	});
	
	$('#title').html(htmlEncode($('.content .content-view.default').attr('data-title')));
	$('.content .content-view.default').show();
	currentContentViewID = $('.content .content-view.default').attr('id');
	$('nav a').each(function(index) {
		if ($(this).attr('data-target-content-view-id') == currentContentViewID) $(this).addClass('active');
	});
	
	$('#back').tap(function() {
		if (Keyboard.isVisible) return;
		changeContentView(currentContentViewID, backContentViewID, function() {
			if ($('#'+currentContentViewID).hasClass('remember-position')) correctScoll(backContentViewYScroll);
			else correctScoll(0);
		});
	});
	
	$('#randomscenario').tap(function() {
		changeContentView('scenarios', 'scenario'+randomIntFromInterval(0, data.scenarios.length - 1), function() {
			correctScoll(0);
		});
	});
	
	$('.change-content-view').tap(function() {
		if (Keyboard.isVisible) return;
		window.plugin.statusbarOverlay.isHidden(function(isHidden) {
			if (!isHidden) window.plugin.statusbarOverlay.hide();
		});
		if ($(this).attr('data-target-content-view-id') == currentContentViewID) return;
		changeContentView(currentContentViewID, $(this).attr('data-target-content-view-id'), function() {
			correctScoll(0);
		});
		if ($(this).hasClass('tab-item')) {
			$('nav a').each(function(index) {
				$(this).removeClass('active');
			});
			$(this).addClass('active');
		}
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

function correctScoll(amount) {
	$('.content').css({ 'overflow': 'hidden' }); // trigger redraw to workaround a WebKit lack of redraw after setting scrollTop
	$('.content')[0].scrollTop = amount;
	$('.content').css({ 'overflow': 'scroll' });
}

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeContentView(visibleContentViewID, newContentViewID, callback) {
	if ($('#'+visibleContentViewID).hasClass('remember-position')) backContentViewYScroll = $('.content')[0].scrollTop;
	$('#'+newContentViewID).show();
	$('#'+visibleContentViewID).hide();
	$('#title').html(htmlEncode($('#'+newContentViewID).attr('data-title')));
	if ($('#'+newContentViewID).attr('data-back-content-view-id')) {
		backContentViewID = $('#'+newContentViewID).attr('data-back-content-view-id');
		$('#back').show();
	} else {
		backContentViewID = null;
		$('#back').hide();
	}
	currentContentViewID = newContentViewID;
	if (callback !== null) callback();
}

function drawWarbands() {
	$('#warbands').find('.table-view').empty();
	for (var warbandID in warbands) {
		$('#warbands').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view" data-target-content-view-id="editwarband" data-warband-id="'+warbandID+'"><img class="media-object pull-left faction-image" src="images/factions/'+factionImages[warbands[warbandID].faction]+'"><div class="media-body">'+htmlEncode(warbands[warbandID].name)+'</div></a></li>');
	}
}