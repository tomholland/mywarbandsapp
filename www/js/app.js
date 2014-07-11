var animating = false;
var contentViewWidth;
var currentContentViewID = null;
var backContentViewID = null;
var factionImages = {};

document.addEventListener('deviceready', function() {

	Keyboard.automaticScrollToTopOnHiding = true;
	Keyboard.shrinkView(false);
	Keyboard.disableScrollingInShrinkView(true);
	
	$.each(data.factions, function(factionIndex, faction) {
		factionImages[faction.id] = faction.image;
		$('#factions').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'"><img class="media-object pull-left faction-image" src="images/factions/'+faction.image+'"><div class="media-body">'+htmlEncode(faction.name)+'</div></a></li>');
		var html = '';
		html += '<div class="content-view" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="factions">';
			html += '<div class="content-view-scroll-wrapper">';
				html += '<ul class="table-view">';
					$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
						html += '<li class="table-view-cell"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+htmlEncode(factionCharacter.rice)+'</span><span class="name">'+htmlEncode(factionCharacter.name)+'</span></a></li>';
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
	
	$('#back').tap(function() {
		if (animating) return;
		if (Keyboard.isVisible) return;
		changeContentView(currentContentViewID, backContentViewID, 'left');
	});
	
	$('#randomscenario').tap(function() {
		if (animating) return;
		changeContentView('scenarios', 'scenario'+randomIntFromInterval(0, data.scenarios.length - 1), 'right');
	});
	
	$('.change-content-view').tap(function() {
		if (animating) return;
		window.plugin.statusbarOverlay.isHidden(function(isHidden) {
			if (!isHidden) window.plugin.statusbarOverlay.hide();
		});
		if (Keyboard.isVisible) return;
		if ($(this).attr('data-target-content-view-id') == currentContentViewID) return;
		changeContentView(currentContentViewID, $(this).attr('data-target-content-view-id'), (($(this).hasClass('appear-from-right')) ? 'right':'none'));
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

function randomIntFromInterval(min, max) {
	return Math.floor(Math.random()*(max-min+1)+min);
}

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeContentView(visibleContentViewID, newContentViewID, direction) {
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
}

function drawWarbands() {
	$('#warbands').find('.table-view').empty();
	for (var warbandID in warbands) {
		$('#warbands').find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view appear-from-right" data-target-content-view-id="editwarband" data-warband-id="'+warbandID+'"><img class="media-object pull-left faction-image" src="images/factions/'+factionImages[warbands[warbandID].faction]+'"><div class="media-body">'+htmlEncode(warbands[warbandID].name)+'</div></a></li>');
	}
}