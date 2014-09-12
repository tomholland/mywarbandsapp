<?php

function generate_unique_string() {
	$id = mb_strtoupper(md5(uniqid(mt_rand(), true)));
	return mb_substr($id, 0, 8).'-'.mb_substr($id, 8, 4).'-'.mb_substr($id, 12, 4).'-'.mb_substr($id, 16, 4).'-'.mb_substr($id, 20, mb_strlen($id));
}

echo generate_unique_string()."\n";