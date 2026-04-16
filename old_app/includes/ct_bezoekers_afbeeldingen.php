<div id="content" style="z-index: 4">

	<div class="feature">
	<?php
		include ("content/{$Language}/ct_bezoekers_afbeeldingen.htm");
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
		//	$WhereString = "WHERE score_total > 200 AND position > 0";;
			if ($Language == nl )
			{
			$OrderbyString = "ORDER BY land, castle_code";
			}
			else 
			{
			$OrderbyString = "ORDER BY country, castle_code";
			}
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 1000;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_geenplaatjes.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
	?>
	</div>

</div>
