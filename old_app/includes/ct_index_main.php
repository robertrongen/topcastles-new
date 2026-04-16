<div id="content" style="z-index: 4">
	<div class="feature">
	<table border="0" align="left">
		<?php
			include ("content/{$Language}/ct_{$Menu}_{$SubMenu}_1.htm");
		?>
		<tr><td>&nbsp;
		</td></tr>
		<tr><td>
			<?php
			//  Query definieren
				$SelectString = "castle_code, castle_name, land, score_total, country";
				$Table = "castles";
				$WhereString = "";
				$OrderbyString = "";
			//  Query laden
				PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
			//	Variabelen voor tabelopbouw zetten
				$TellerVan = 1;
				$Teller = 1;
				$TellerEind = 12;
		
			//	Tabel opbouwen
				include ("content/{$Language}/tabel_12plaatjes.php");
			//  DataBase connectie sluiten
				include ("includes/dbclose.php");
			?>
		</td></tr>
		<tr><td>&nbsp;
		</td></tr>
	
		<tr><td>
		<?php
			include ("content/{$Language}/ct_{$Menu}_{$SubMenu}_2.htm");
		?>
		</td></tr>
		<tr><td>&nbsp;
		</td></tr>
		<tr><td>
			<?php
			//  Query definieren
				$SelectString = "((sum(Rating)+5)/(count(*)+1)) AS gemiddelde, (count(*)) AS aantal, castles.*, stemmen.castle_code";
				$Table = "stemmen, castles";
				$WhereString = "WHERE castles.castle_code = stemmen.castle_code GROUP BY stemmen.castle_code";
				$OrderbyString = "ORDER BY gemiddelde DESC";
			//  Query laden
				PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
			//	Variabelen voor tabelopbouw zetten
				$TellerVan = 1;
				$Teller = 1;
				$TellerEind = 12;
		
			//	Tabel opbouwen
				include ("content/{$Language}/tabel_12plaatjes.php");
			//  DataBase connectie sluiten
			//	include ("includes/dbclose.php");
			?>
		</td></tr>
		<tr><td>&nbsp;
		</td></tr>
	
		<tr><td>
		<?php
			include ("content/{$Language}/ct_{$Menu}_{$SubMenu}_3.htm");
		?>
		</td></tr>
		<tr><td>&nbsp;
		</td></tr>
		<tr><td>
			<?php
			//  Query definieren
				$SelectString = "*";
				$Table = "castles";
				$WhereString = "WHERE country LIKE ('netherlands') AND position > 0";
				$OrderbyString = "";
			//  Query laden
				PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
			//	Variabelen voor tabelopbouw zetten
				$TellerVan = 1;
				$Teller = 1;
				$TellerEind = 12;
		
			//	Tabel opbouwen
				include ("content/{$Language}/tabel_12plaatjes.php");
			//  DataBase connectie sluiten
			//	include ("includes/dbclose.php");
			?>
		</td></tr>
		<tr><td>&nbsp;
		</td></tr>
		<tr>
			<td>
				<h2>
					<a href="javascript:document.form3.SubMenu.value='webrings';document.form3.submit();">
						<?php echo $MenuText_4; ?>
					</a>
				</h2>
				<br>
				<a href="index.php?SubMenu=webrings&amp;Language=<?php echo $Language; ?>">
						<?php echo $Text_4; ?>
				</a>
			</td>
		</tr>
		<tr>
			<td>
				&nbsp;
			</td>
		</tr>
		<tr>
			<td>
	            <a href="http://commons.wikimedia.org" target="_blank">
	            <img border="0" src="images/general/commons.jpg" height="50" ALT=""></a>
	            <?php echo $Text_5; ?><br><br>
			</td>
		</tr>
	</table>
	</div>

</div>