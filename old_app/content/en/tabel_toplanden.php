<table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1" bgcolor="#c0c0c0">
	<tr height="20" style="font-weight:bold ">
		<th align="right">
		Place&nbsp;&nbsp;
		</th>
		<th align="left">
		Country&nbsp;&nbsp;
		</th>
		<th>
		&nbsp;
		</th>
		<th align="right" width="80">
		Score&nbsp;&nbsp;
		</th>
		<th width="80">
		Number of<br>castles&nbsp;&nbsp;
		</th>
	</tr>
	<?php
	//tabel opbouwen
	while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
	{
		if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
		{
		?>
		<!-- alternerende rij-opmaak invoegen -->
			<tr height="18" bgcolor = "<?php
							if ($Teller & 1) {echo "#ffffff";}
							else {echo "#fff6de";}
						?>"> 
				<td align="right">
					<?php echo $Teller ?>&nbsp;&nbsp;
				</td>
				<td>
					<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
					<?php echo $line['country'] ?></a>&nbsp;&nbsp;
				</td>
				<?php
				$filename="images/maps/".str_replace(' ','',$line['country']).".jpg";
				//cel toevoegen
					if (file_exists($filename))
					{ ?>
						<td>
						<div class="thumbnails">
							<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" 
							title="<?php echo $line['country'] ?>">
							<Img width="110" SRC=<?php echo "images/maps/".str_replace(' ','',$line['country']).".jpg" ?> > </a>
						</div>
						</td>
					<?php }
					else
					{ ?>
						<td height="30" width="120" align="center">
						 
						</td>
					<?php } 
				?>
				<td align="right">
					<?php echo $line['som'] ?>&nbsp;&nbsp;
				</td>
				<td align="center">
					<?php echo $line['aantal_kastelen'] ?>&nbsp;&nbsp;
				</td>
			</tr>
		<?php
		}
		$Teller = $Teller + 1;
	}
	?>
</table>
