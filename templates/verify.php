<?php

$dir = dirname(__FILE__);

$templates = array();

if ($handle = opendir($dir)) {
	while (false !== ($filename = readdir($handle))) {
		if (mb_strpos($filename, '.') !== false && mb_substr($filename, mb_strrpos($filename, '.')) == '.mst') {
			$templates[str_replace('.', '_', mb_substr($filename, 0, mb_strrpos($filename, '.')))] = file_get_contents($dir.'/'.$filename);
		}
	}
	closedir($handle);
}

require_once $dir.'/libs/mustache.php';
$Mustache_Engine = new Mustache_Engine;

foreach ($templates as $id => $template) {
	echo "Checking $id\n";
	$Mustache_Engine->render($template, null);
}

echo "All good!\n";