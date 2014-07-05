<?php

$data = array(
	'factions' => array(
		array(
			'name' => 'Silvermoon Syndicate',
			'characters' => array(
				array(
					'name' => 'Dave',
					'rice' => 'Su',
					'cards' => array(
						'1.jpg',
						'2.jpg'
					)
				)
			)
		),
		array(
			'name' => 'Ito Clan',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Temple of Ro-Kan',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Prefecture of Ryu',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Cult of Yurei',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Savage Wave',
			'characters' => array(
				
			)
		)
	)
);

file_put_contents('data.js', 'var data = '.json_encode($data).';');