<div id="content" style="z-index: 4">
	<div class="feature">
	<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
	<br>
	<?php echo $FeatureText1; ?>
	<br>
	<br>
		<?php
			include ("functions/hotornot.php");
		//  Query definieren
			$SelectString = "(position_ref - position) AS position_jump, castles.*";
			$Table = "castles";
		//  WhereString = "WHERE castle_code = stemmen.castle_code GROUP BY castles.castle_code";
			$OrderbyString = "ORDER BY position_jump DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_20plaatjes.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
		?>
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "(position_ref - position) AS position_jump, castles.*";
			$Table = "castles";
		//  WhereString = "WHERE castle_code = stemmen.castle_code GROUP BY castles.castle_code";
			$OrderbyString = "ORDER BY position_jump DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_jump.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>