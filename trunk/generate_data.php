<?php

$data = array(
	'factions' => array(
		array(
			'name' => 'Faction One',
			'characters' => array (
				array(
					'name' => 'Dave',
					'rice' => 2,
					'cards' => array(
						'1.jpg',
						'2.jpg'
					)
				)
			)
		)
	)
);

file_put_contents('data.js', 'var data = '.json_encode($data).';');