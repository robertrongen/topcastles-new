<div id="content" style="z-index: 4"> 
	<div class="feature">
	<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
	<br>
	<?php
	//  Query definieren
	$SelectString = "*, castles.castle_code AS castle";
	$Table = "castles LEFT JOIN stemmen ON castles.castle_code = stemmen.castle_code";
	$WhereString = "WHERE stemmen.castle_code IS NULL AND position > 0";
	$OrderbyString = "ORDER BY position";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);

	//	Variabelen voor tabelopbouw zetten
		$TellerVan = 1;
		$Teller = 1;
		$TellerEind = 200;

	//	Tabel opbouwen
		include ("content/{$Language}/tabel_20plaatjes_gs.php");
	//  DataBase connectie sluiten
	//	include ("includes/dbclose.php");
	?>
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
	<?php
	//  Query definieren
		$SelectString = "*, castles.castle_code AS castle";
		$Table = "castles LEFT JOIN stemmen ON castles.castle_code = stemmen.castle_code";
		$WhereString = "WHERE stemmen.castle_code IS NULL AND position > 0";
		$OrderbyString = "ORDER BY position";
	//  Query laden
		PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	//	echo $sSQL;
		$TellerVan = 1;
		$Teller = 1;
		$TellerEind = 200;
	//	Tabel opbouwen
		include ("content/{$Language}/tabel_geenstem.php");
	//  DataBase connectie sluiten
		include ("includes/dbclose.php");
	?> 
	</div>
</div>
