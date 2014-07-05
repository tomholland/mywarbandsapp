var currentContentViewID = null;
var backContentViewID = null;

document.addEventListener('deviceready', function() {
	StatusBar.hide();
	var firstContentViewID = $('.content .content-view').attr('id'); // only 1 content-view should be in the base HTML
	$('#title').html(htmlEncode($('#'+firstContentViewID).attr('data-title')));
	$.each(data.factions, function(factionIndex, faction) {
		$('#'+firstContentViewID).find('.table-view').append('<li class="table-view-cell"><a class="navigate-right change-content-view" data-target-content-view-id="faction'+factionIndex+'">'+htmlEncode(faction.name)+'</a></li>');
		var html = '';
		html += '<div class="content-view hidden" id="faction'+factionIndex+'" data-title="'+htmlEncode(faction.name)+'" data-back-content-view-id="'+firstContentViewID+'">';
			html += '<ul class="table-view">';
				$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
					html += '<li class="table-view-cell"><a class="navigate-right change-content-view" data-target-content-view-id="faction'+factionIndex+'character'+factionCharacterIndex+'cards"><span class="badge">'+htmlEncode(factionCharacter.rice)+'</span>'+htmlEncode(factionCharacter.name)+'</a></li>';
				});
			html += '</ul>';
		html += '</div>';
		$.each(faction.characters, function(factionCharacterIndex, factionCharacter) {
			html += '<div class="slider hidden" id="faction'+factionIndex+'character'+factionCharacterIndex+'cards" data-title="'+htmlEncode(factionCharacter.name)+'" data-back-content-view-id="faction'+factionIndex+'">';
				html += '<div class="slide-group">';
					$.each(factionCharacter.cards, function(factionCharacterContentViewIndex, factionCharacterCard) {
						html += '<div class="slide" style="background-image: url(\'images/cards/'+factionCharacterCard+'\');"></div>';
					});
				html += '</div>';
			html += '</div>';
		});
		$('.content').append(html);
	});
	currentContentViewID = firstContentViewID;
	$('#back').tap(function() {
		changeContentView(currentContentViewID, backContentViewID);
	});
	$('.change-content-view').tap(function() {
		changeContentView(currentContentViewID, $(this).attr('data-target-content-view-id'));
	});
}, false);

function htmlEncode(value){
	return $('<div/>').text(value).html().replace(/\"/g, '&quot;');
}

function changeContentView(visibleContentViewID, newContentViewID) {
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