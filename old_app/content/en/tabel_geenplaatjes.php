<table width="550" border="0" cellpadding="0" cellspacing="0" id="AutoNumber1">
	<tr style="font-weight:bold ">
		<th height="20" width="55">
			Position&nbsp;&nbsp;
		</th>
		<th width="55">
			Score&nbsp;&nbsp;
		</th>
		<th width="165">
			Castle&nbsp;&nbsp;
		</th>
		<th width="55">
			Country&nbsp;&nbsp;
		</th>
		<th width="110">
			Place&nbsp;&nbsp;
		</th>
		<th width="110">
			Region&nbsp;&nbsp;
		</th>
	</tr>
	<?php
	//tabel opbouwen
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
	{
		$filename="images/small/". $line['castle_code']."_small.jpg";
		//cel toevoegen
		if (!file_exists($filename))
		{
			if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
			{
				// alternerende rij-opmaak invoegen -->
				?>
					<tr bgcolor = "<?php
								if ($Teller & 1) {echo "#ffffff";}
								else {echo "#fff6de";}
							?>"> 
						<td align="right" width="55">
							<?php echo $line['position'] ?>&nbsp;&nbsp;
						</td>
						<td align="right" width="55">
							<?php echo $line['score_total'] ?>&nbsp;&nbsp;
						</td>
						<td width="165">
							<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
							title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['place'] ?>">
							<?php
							echo $line['castle_name']
							?></a>&nbsp;&nbsp;
						</td>
						<td width="55">
							<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
							<?php echo $line['country'] ?></a>&nbsp;&nbsp;
						</td>
						<td width="110">
							<?php echo $line['place'] ?>&nbsp;&nbsp;
						</td><td width="110">
								<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();" >
							<?php echo $line['region'] ?></a>&nbsp;&nbsp;
						</td>
					</tr>
				<?php
			}
				$Teller = $Teller + 1;
		}
	}
	?>
</table>
