<table width="550" border="0" cellpadding="0" cellspacing="0" id="AutoNumber1">
	<tr style="font-weight:bold ">
		<th width="120" align="center">
			Thumbnail&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		</th>
		<th width="55">
			Castle&nbsp;&nbsp;
		</th>
		<th width="55">
			Country&nbsp;&nbsp;
		</th>
		<th width="55">
			Region&nbsp;&nbsp;
		</th>
		<th width="55">
			Type&nbsp;&nbsp;
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
					<?php
						$filename="images/small/". $line['castle_code']."_small.jpg";
						//cel toevoegen
						if (file_exists($filename))
						{ 	
							?>
								<td>
								<div class="thumbnails">
									<a href="<?php SelMenu(geenkasteel,$Language,main,SelCastle,$line['castle_code']) ?>"
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
						<a href="<?php SelMenu(geenkasteel,$Language,main,SelCastle,$line['castle_code']) ?>"
						title="<?php echo $line['position'].". ".$line['castle_name']." - ".$line['place'] ?>">
						<?php
						echo $line['castle_name']
						?></a>&nbsp;&nbsp;
					</td>
					<td>
						<?php echo $line['country'] ?>&nbsp;&nbsp;
					</td>
					<td>
						<?php echo $line['region'] ?>&nbsp;&nbsp;
					</td>
					<td>
						<?php echo $line['nocastle_type'] ?>&nbsp;&nbsp;
					</td>
				</tr>
			<?php
		}
			$Teller = $Teller + 1;
	  }
	?>
</table>
