<div id="content" style="z-index: 4">
	<div class="feature">
	<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
	<br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE position_2007 > 0";
			$OrderbyString = "ORDER BY position_2007";
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
		<?php echo $FeatureText1; ?>
		<br>
		<br>
		791 <?php echo $TextStemmenVan."&nbsp;"; ?> 165 <?php echo $line['unieke_bezoekers']."&nbsp;".$TextBezoekers;?>.
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "*";
			$Table = "castles";
			$WhereString = "WHERE position_2007 > 0";
			$OrderbyString = "ORDER BY position_2007";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("functions/hotornot.php");
			include ("content/{$Language}/tabel_top100-2007.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>