<?php

$url_schemes = array(
	'tweetbot',
	'twitterrific',
	'twitter'
);

$plist_path = 'platforms/ios/MyWarbands/MyWarbands-Info.plist';

file_put_contents(
	$plist_path,
	preg_replace(
		"/<plist version=\"1.0\">\s+<dict>/",
		"<plist version=\"1.0\"><dict><key>LSApplicationQueriesSchemes</key><array><string>".implode("</string><string>", $url_schemes)."</string></array>",
		file_get_contents($plist_path)
	)
);