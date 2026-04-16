<div id="content" style="z-index: 4">
	<div class="feature">
	<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
	<br>
		<?php
		//  Query definieren
			$SelectString = "castles.*, castles.score_total AS score_all";
			$Table = "castles";
			$WhereString = "WHERE position > 0";
			$OrderbyString = "ORDER BY score_total DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 20;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_20plaatjes.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
		?>
	</div>
	
	<div class="feature">
		<br>
		Static ranking mode is enabled. Visitor votes are not used in top 100 calculations.
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "castles.*, castles.score_total AS score_all";
			$Table = "castles";
			$WhereString = "WHERE position > 0";
			$OrderbyString = "ORDER BY score_total DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_totaal.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>