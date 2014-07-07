var currentContentViewID = null;
var backContentViewID = null;
var backContentViewYScroll = 0;

document.addEventListener('deviceready', function() {
	StatusBar.hide();
	var firstContentViewID = $('.content .content-view.default').attr('id');
	$.each(data.factions, function(factionIndex, faction) {
		$('#'+firstContentViewID).find('.table-view').append('<li class="table-view-cell media"><a class="navigate-right change-content-view" data-target-content-view-id="faction'+factionIndex+'"><img class="media-object pull-left faction-image" src="images/factions/'+faction.image+'"><div class="media-body">'+htmlEncode(faction.name)+'</div></a></li>');
		var html = '';
		html += '<div class="content-view remember-position" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="'+firstContentViewID+'">';
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
	$('#title').html(htmlEncode($('#'+firstContentViewID).attr('data-title')));
	$('#'+firstContentViewID).show();
	$('nav a').each(function(index) {
		if ($(this).attr('data-target-content-view-id') == firstContentViewID) $(this).addClass('active');
	});
	currentContentViewID = firstContentViewID;
	$('#back').tap(function() {
		changeContentView(currentContentViewID, backContentViewID);
		if ($('#'+currentContentViewID).hasClass('remember-position')) $('.content')[0].scrollTop = backContentViewYScroll;
	});
	$('.change-content-view').tap(function() {
		changeContentView(currentContentViewID, $(this).attr('data-target-content-view-id'));
		if ($(this).hasClass('tab-item')) {
			$('nav a').each(function(index) {
				$(this).removeClass('active');
			});
			$(this).addClass('active');
		}
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
	});
}, false);

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeContentView(visibleContentViewID, newContentViewID) {
	if ($('#'+visibleContentViewID).hasClass('remember-position')) backContentViewYScroll = $('.content')[0].scrollTop;
	$('#'+visibleContentViewID).hide();
	$('#title').html(htmlEncode($('#'+newContentViewID).attr('data-title')));
	$('#'+newContentViewID).show();
	if ($('#'+newContentViewID).attr('data-back-content-view-id')) {
		backContentViewID = $('#'+newContentViewID).attr('data-back-content-view-id');
		$('#back').show();
	} else {
		backContentViewID = null;
		$('#back').hide();
	}
	currentContentViewID = newContentViewID;
}