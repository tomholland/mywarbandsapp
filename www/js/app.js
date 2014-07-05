var currentCardID = null;
var backCardID = null;

document.addEventListener('deviceready', function() {
	StatusBar.hide();
	var firstCardID = $('.content .card').attr('id'); // only 1 card should be in the base HTML
	$('#title').html(htmlEncode($('#'+firstCardID).attr('data-title')));
	$.each(data.factions, function(factionIndex, faction) {
		$('#'+firstCardID).find('.table-view').append('<li class="table-view-cell"><a class="navigate-right change-card" data-target-card-id="faction'+factionIndex+'">'+htmlEncode(faction.name)+'</a></li>');
		var html = '';
		html += '<div class="card hidden" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-card-id="'+firstCardID+'">';
			html += '<ul class="table-view">';
				$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
					html += '<li class="table-view-cell"><a class="navigate-right change-card" data-target-card-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+htmlEncode(factionCharacter.rice)+'</span>'+htmlEncode(factionCharacter.name)+'</a></li>';
				});
			html += '</ul>';
		html += '</div>';
		$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
			html += '<div class="slider hidden" id="faction'+factionIndex+'character'+factionCharacterIndex+'cards" data-title="'+htmlEncode(factionCharacter.name)+'" data-back-card-id="faction'+factionIndex+'">';
				html += '<div class="slide-group">';
					$.each(factionCharacter.cards, function(factionCharacterCardIndex, factionCharacterCard) {
						html += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				html += '</div>';
			html += '</div>';
		});
		$('.content').append(html);
	});
	currentCardID = firstCardID;
	$('#back').tap(function() {
		changeCard(currentCardID, backCardID);
	});
	$('.change-card').tap(function() {
		changeCard(currentCardID, $(this).attr('data-target-card-id'));
	});
}, false);

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeCard(visibleCardID, newCardID) {
	$('#'+visibleCardID).hide();
	$('#title').html(htmlEncode($('#'+newCardID).attr('data-title')));
	$('#'+newCardID).show();
	if ($('#'+newCardID).attr('data-back-card-id')) {
		backCardID = $('#'+newCardID).attr('data-back-card-id');
		$('#back').show();
	} else {
		backCardID = null;
		$('#back').hide();
	}
	currentCardID = newCardID;
}