<table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1"> <?php
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) 
	{
		if (($Teller >= $TellerVan) && ($Teller <= $TellerEind)) 
		{
			if (($Teller % 5)== 1) 
			{ 
			//	tabelrij toevoegen
				?><tr><?php
			}
			$filename="images/small/". $line['castle_code']."_small.jpg";
			//cel toevoegen
			if (file_exists($filename))
			{ 
				?><td height="120" width="120" align="center">
				<div class="graphics"><a href="<?php SelMenu(geenkasteel,$Language,main,SelCastle,$line['castle_code']) ?>"
					title="<?php echo $Teller.". ".$line['castle_name']." - ".$line['country'] ?>">
					<Img width="110" border="0" height="110" SRC="<?php echo "images/small/".$line['castle_code']."_small.jpg" ?>" ALT=""></a>
				</div>
				</td><?php
			}
			else
			{ 
				?><td height="120" width="120" border="0" align="center">
					<br><br><a href="<?php SelMenu(geenkasteel,$Language,main,SelCastle,$line['castle_code']) ?>"
					title="<?php echo $Teller.". ".$line['castle_name']." - ".$line['country'] ?>">
					<?php
					echo $Teller.". ".$line['castle_name']."<br>(".$line['country'].")"
					?></a>
				</td><?php
			}
			//aantal cellen in rij bereikt?
			if (($Teller % 5) == 0) 
			{ 
				?></tr><?php
			}
		}
		$Teller = $Teller + 1;
	}
	?>

</table>
