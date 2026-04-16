<div id="content" style="z-index: 4">
	<div class="feature">
		<h2 id="top">
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE region LIKE ('$SelRegion') AND position > 0";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
			$SelText = $line['region'];
			$SelText = ucwords($SelText);
			echo $FeatureTitel_1.$SelText; 
		?>
		</h2>
		<br>
		<?php 
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 50;
	
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
			$WhereString = "WHERE region LIKE ('$SelRegion') AND position > 0";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 50;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_top100_land.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>
	
</div>