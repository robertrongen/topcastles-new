<table width=550 border="0" cellpadding="0" cellspacing="0" id="AutoNumber1">
	<tr style="font-weight:bold ">
		<th>
		Position&nbsp;&nbsp;
		</th>
		<th>
		Total&nbsp;&nbsp;
		</td>
		<th>
		Thumb-<br>nail&nbsp;&nbsp;
		</th>
		<th>
		Castle&nbsp;&nbsp;
		</th>
		<th>
		Country&nbsp;&nbsp;
		</th>
		<th>
		Top-<br>100&nbsp;&nbsp;
		</th>
		<th>
		Score&nbsp;&nbsp;
		</th>
		<th>
		Rating&nbsp;&nbsp;
		</th>
		<th>
		Votes&nbsp;&nbsp;
		</th>
	</tr>
	<?php
	//tabel opbouwen
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
	{
		$ScoreNew = round($line['score_all'], 0);
		$Stemmen = $line['aantal'];
		if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
		{
		?>
		<!-- alternerende rij-opmaak invoegen -->

		<tr bgcolor = "<?php
						if ($Teller & 1) {echo "#ffffff";}
						else {echo "#fff6de";}
					?>"> 
				<td height=20 border=0 align="right">
				<?php echo $Teller ?>&nbsp;&nbsp;
				</td>
				<td height=20 border=0 align="right">
				<?php 
				echo round($ScoreNew, 0);
				?>&nbsp;&nbsp;
				</td>
				<?php
					$filename="images/small/". $line['castle_code']."_small.jpg";
					//cel toevoegen
					if (file_exists($filename))
					{ ?>
						<td width="120">
						<div class="thumbnails">
							<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
							title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['country'] ?>">
							<Img width="55" SRC="<?php echo "images/small/".$line['castle_code']."_small.jpg" ?>" ALT=""></a>
						</div>
						</td>
					<?php }
					else
					{ ?>
						<td height="55" width="120" align="center">&nbsp;
						</td>
					<?php } 
				?>
				<td height=20 border=0 align="left">
				<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
				title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['place'] ?>">
				<?php echo $line['castle_name'] ?></a>&nbsp;&nbsp;
				</td>
				<td height=20 border=0 align="left">
				<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
				<?php echo $line['country'] ?></a>
				</td>
				<td height=20 border=0 align="right">
				<?php echo $line['position'] ?>&nbsp;&nbsp;
				</td>
				<td height=20 border=0 align="right">
				<?php echo $line['score_total'] ?>&nbsp;&nbsp;
				</td>
				<td height=20 border=0 align="right">
				<?php echo HotOrNot($line ['castle_code']) ?>&nbsp;&nbsp;
				</td>
				<td height=20 border=0 align="right">
				<?php echo $Stemmen ?>&nbsp;&nbsp;
				</td>
			</tr>
		<?php
		}
		$Teller = $Teller + 1;
	}
	?>
</table>
