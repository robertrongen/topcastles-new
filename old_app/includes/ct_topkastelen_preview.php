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
			$SelectString = "(((sum(stemmen.Rating)+5)/(count(*)+1))*100+count(*)/5+2*castles.score_ref)/(21/10) AS score_all, count(*) AS aantal, castles.*";
			$Table = "stemmen, castles";
			$WhereString = "WHERE castles.castle_code = stemmen.castle_code GROUP BY castles.castle_code";
			$OrderbyString = "ORDER BY score_all DESC";
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
		<?php 
		//  Query definieren
			$SelectString = "count(*) AS aantal, count(DISTINCT stemmen.ip) AS unieke_bezoekers";
			$Table = "stemmen";
			$WhereString = "";
			$OrderbyString = "";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
		//  Print statistieken
			echo $line['aantal']."&nbsp;".$TextStemmenVan."&nbsp;";
			echo $line['unieke_bezoekers']."&nbsp;".$TextBezoekers.".";
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>
	
	<div class="feature">
		<br>
		<h3><?php echo $FeatureTitel_2; ?></h3><br>
		<?php
		//  Query definieren
			$SelectString = "(((sum(stemmen.Rating)+5)/(count(*)+1))*100+count(*)/5+2*castles.score_ref)/(21/10) AS score_all, count(*) AS aantal, castles.*";
			$Table = "stemmen, castles";
			$WhereString = "WHERE castles.castle_code = stemmen.castle_code GROUP BY castles.castle_code";
			$OrderbyString = "ORDER BY score_all DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 100;
	
		//	Tabel opbouwen
			include ("content/{$Language}/tabel_preview.php");
		//  DataBase connectie sluiten
		//	include ("includes/dbclose.php");
		?>
	</div>

</div>