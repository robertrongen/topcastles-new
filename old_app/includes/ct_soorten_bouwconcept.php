<div id="content" style="z-index: 4">

	<div class="feature">
		<h2 id="top">
		<?php
			echo $KeuzeText;
		?>
		</h2>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE cc_code LIKE ('$SelCastleConcept') AND position > 0";
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
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE cc_code LIKE ('$SelCastleConcept') AND position > 0";
			$OrderbyString = "ORDER BY score_total DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_top100_gebied.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>