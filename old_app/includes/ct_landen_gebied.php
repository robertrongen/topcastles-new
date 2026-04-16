<div id="content" style="z-index: 4">
	<div class="feature">
		<h2 id="top"><?php echo $FeatureTitel_1.$SelText; ?>
		</h2>
		<br>
		<?php 
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE gebied LIKE ('%{$SelGebied}%') AND position > 0";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 200;
	
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
			$WhereString = "WHERE gebied LIKE ('%{$SelGebied}%') AND position > 0";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 200;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_top100_gebied.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>