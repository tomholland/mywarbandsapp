<?php

$data = array(
	'factions' => array(
		array(
			'name' => 'Silvermoon Syndicate',
			'image' => 'silvermoon.jpg',
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
			'image' => 'Itosymbol.jpg',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Temple of Ro-Kan',
			'image' => 'symbolmonk.jpg',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Prefecture of Ryu',
			'image' => 'symbolsamurai.jpg',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Cult of Yurei',
			'image' => 'symbolyoma.jpg',
			'characters' => array(
				
			)
		),
		array(
			'name' => 'Savage Wave',
			'image' => 'symboloni.jpg',
			'characters' => array(
				
			)
		)
	)
);

file_put_contents('data.js', 'var data = '.json_encode($data).';');