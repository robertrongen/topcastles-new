<table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1">
	<tr style="font-weight:bold ">
		<th height="20" width="55">
			Nr.&nbsp;&nbsp;
		</th>
		<th height="20" width="55">
			Positie&nbsp;&nbsp;
		</th>
		<th width="60">
			Score&nbsp;&nbsp;
		</th>
		<th width="110" align="center">
			Thumbnail&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		</th>
		<th width="110" align="left">
			Kasteel&nbsp;&nbsp;
		</th>
		<th width="70" align="left">
			Land&nbsp;&nbsp;
		</th>
		<th width="110" align="left">
			Regio&nbsp;&nbsp;
		</th>
	</tr>
	<?php
	//tabel opbouwen
	  while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
	  {
		if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
		{
			// alternerende rij-opmaak invoegen -->
			?>
				<tr bgcolor = "<?php
							if ($Teller & 1) {echo "#ffffff";}
							else {echo "#fff6de";}
						?>"> 
					<td align="right">
						<?php echo $Teller ?>&nbsp;&nbsp;
					</td>
					<td align="right">
						<?php echo $line['position'] ?>&nbsp;&nbsp;
					</td>
					<td align="right">
						<?php echo $line['score_total'] ?>&nbsp;&nbsp;
					</td>
					<?php
						$filename="images/small/". $line['castle_code']."_small.jpg";
						//cel toevoegen
						if (file_exists($filename))
						{ 	
							?>
								<td>
								<div class="thumbnails">
									<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
									title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['land'] ?>">
									<Img width="55" SRC="<?php echo "images/small/".$line['castle_code']."_small.jpg" ?>" ALT=""></a>
								</div>
								</td>
							<?php
						}
						else
						{ 
							?><td height="55" align="center">&nbsp;
							</td><?php 
						} 
					
					?><td width="55">
						<a href="javascript:document.form81.SelCastle.value='<?php echo $line['castle_code'] ?>';document.form81.submit();"
						title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['place'] ?>">
						<?php
						echo $line['castle_name']
						?></a>&nbsp;&nbsp;
					</td>
					<td>
						<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
						<?php echo $line['land'] ?></a>&nbsp;&nbsp;
					</td>
					<td>
						<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();" >
								<?php 
			                		echo $line ['region'] 
			            		?>
			    		</a>
			    		<br>
						<?php
						$filename="images/maps/". $line['region_code'].".jpg";
						if (file_exists($filename))
						{ ?>
							<div class="thumbnails">
								<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();"
								title="<?php echo $line['region'] ?>">
								<Img width="55" SRC=<?php echo "images/maps/".$line['region_code'].".jpg" ?> > </a>
							</div>
						  <?php 
						}
						else
						{ 
						} ?>
					</td>
				</tr>
			<?php
		}
			$Teller = $Teller + 1;
	  }
	?>
</table>
