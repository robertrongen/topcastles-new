<div id="content" style="z-index: 4">

	<div class="feature">
		<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
		<br>
		<?php
		//  Query definieren
			$SelectString = "country, land, SUM(score_total) AS som, COUNT(castle_code) AS aantal_kastelen";
			$Table = "castles";
			$WhereString = "WHERE (land IS NOT NULL)";
			$OrderbyString = "GROUP BY land ORDER BY Som DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 60;
		
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_toplanden.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
		?>
		<br><br>
	</div>

</div>
