<div id="content" style="z-index: 4">

	<div class="feature">
		<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
		<br><?php echo $FeatureText_1; ?>
		<br><br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "no_castles";
			$WhereString = "";
			$OrderbyString = "ORDER BY nc_code,castle_code";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 60;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_20plaatjes_nocastle.php");
		//  DataBase connectie sluiten
			include ("includes/dbclose.php");
		?>
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "no_castles";
			$WhereString = "";
			$OrderbyString = "ORDER BY nc_code,castle_code";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_top100_nocastle.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>