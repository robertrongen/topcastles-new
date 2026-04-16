<table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1" bgcolor="#c0c0c0">
	<br>
	<tr height="20" style="font-weight:bold ">
		<th align="right">
		Place&nbsp;&nbsp;
		</th>
		<th align="left">
		Thumbnail&nbsp;&nbsp;
		</th>
		<th width="140" align="left">
		Region&nbsp;&nbsp;
		</th>
		<th width="100" align="left">
		Country&nbsp;&nbsp;
		</th>
		<th align="right">
		Score&nbsp;&nbsp;
		</th>
		<th>
		Number of<br>castles&nbsp;&nbsp;
		</th>
	</tr>
	<?php
		while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
		{
			if (!empty($line['region']))
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
						<?php
						$filename="images/maps/". $line['region_code'].".jpg";
						//cel toevoegen
							if (file_exists($filename))
							{ ?>
								<td width="120">
								<div class="thumbnails">
									<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();"
									title="<?php echo $line['region'] ?>">
									<Img width="30" SRC=<?php echo "images/maps/".$line['region_code'].".jpg" ?> > </a>
								</div>
								</td>
							<?php }
							else
							{ ?>
								<td height="30" width="120" align="center">
								 
								</td>
							<?php } 
						?>
						<td>
							<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();" >
							<?php echo $line['region'] ?></a>&nbsp;&nbsp;
						</td>
						<td>
           					<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
							<?php 
                            	echo $line ['country']; 
                        	?></a>							
						</td>
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
		}
		?>
</table>
