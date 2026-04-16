<div class="graphics">
<table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1"> 
<?php	
	PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) 
	{
		if (($Teller >= $TellerVan) && ($Teller <= $TellerEind)) 
		{
			if (($Teller % 6)== 1) 
			{ 
				//	tabelrij toevoegen
				?><tr height=120><?php
			}
			$filename="images/small/". $line['castle_code']."_small.jpg";
			//cel toevoegen
			if (file_exists($filename))
			{ 
				?><td width=120 align="center">
				<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
					title="<?php echo $Teller.". ".$line['castle_name']." - ".$line['land'] ?>">
					<Img width="110" border="0" height="110" SRC="<?php echo "images/small/".$line['castle_code']."_small.jpg" ?>" ALT=""></a>
				</td><?php
			}
			else
			{ 
				?><td width=120 border=0 align="center">
					<br><br><a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
					title="<?php echo $Teller.". ".$line['castle_name']." - ".$line['land'] ?>">
					<?php
					echo $Teller.". ".$line['castle_name']."<br>(".$line['land'].")"
					?></a>
				</td><?php
			}
			//aantal cellen in rij bereikt?
			if (($Teller % 6) == 0) 
			{ 
				?></tr><?php
			}
		}
		$Teller = $Teller + 1;
	}
	?>
</table>
</div>
