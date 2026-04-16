<div id="content" style="z-index: 4">
  <div class="feature">
	<?php
//  Verbinding maken met MySQL database
	include ("includes/dbconnect.php");
//	query uitvoeren
	$sSQL = "SELECT * FROM no_castles WHERE castle_code LIKE ('$SelCastle')" ;
	$result = mysql_query($sSQL) or die("Query failed : " . mysql_error());

//	data laden
	$line = mysql_fetch_array($result, MYSQL_ASSOC);
//	Tabel laden
	include ("content/$Language/tabel_geenkasteel.php");
//  DataBase connectie sluiten
	include ("includes/dbclose.php");
	?>
  </div>
</div>