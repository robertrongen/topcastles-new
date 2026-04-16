	<div class="feature">
		<table>
			<tr>
				<td><h2><a href="index.php">Enquête 6</a></h2></td>
			</tr>
			<tr>
				<td><em>
				<?php 
					if ($Answer=="niet")
					{
					?>
						U heeft niet gestemd.
					<?php
					}
					else if ($Answer=="al")
					{
					?>
						U heeft al gestemd.
					<?php
					}
					else
					{
					echo "Uw antwoord: ". $Answer;
					}
				?>
				<br>
				</em></td>
			</tr>
			<tr> 
				<td>
					Vraag: <br><strong>Wat vindt u dat met ruïnes van oude kastelen moet gebeuren?</strong> 
					<br><br>
					Start enquête: 5 mei 2005
			</td>
			</tr>
			<tr>
				<td>
					<h3>Resultaat</h3>
					Aantal stemmen: <?php echo $total ?>
					<br><br> 
				</td>
			</tr>
			<tr>
				<td>
				<table>
					<tr>
						<th> Antwoord </th>
						<th width="55 px"> Stemmen </th>
						<th> Score </th>
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1: Niets, verder laten vervallen
						<td align = 'right'><?php echo $Antwoord1; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord1, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord1, $total), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2: Conserveren in huidige toestand
						<td align = 'right'><?php echo $Antwoord2; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord2, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord2, $total), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3: Nuttig maken (b.v. museum)
						<td align = 'right'><?php echo $Antwoord3; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord3, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord3, $total), "red"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							4: Herbouwen naar oorspronkelijke middeleeuwse ontwerp
						<td align = 'right'><?php echo $Antwoord4; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord4, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord4, $total), "purple"); ?></td>
					</tr>
					<tr>
						<td> 
							5: Herbouwen naar het mooiste ontwerp
						<td align = 'right'><?php echo $Antwoord5; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord5, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord5, $total), "green"); ?></td>
					</tr>
				</table>
				</td>
			</tr>
		</table>
		<br><br>
	</div>

	<div class="feature">
		<table>
			<tr>
				<td><h2><a href="index.php">Enquête 5</a></h2></td>
			</tr>
			<tr> 
				<td>
					Vraag: <br><strong>Hoeveel <a href="achtergrond.php" title="Zie definitie van kasteel">middeleeuwse</a> kastelen heeft u afgelopen jaar bezocht of gefotografeerd?</strong> 
					<br><br>
					Start enquête: 22 januari 2005
			</td>
			</tr>
			<tr>
				<td>
					<h3>Resultaat</h3>
					Aantal stemmen: 77
					<br><br> 
				</td>
			</tr>
			<tr>
				<td>
				<table>
					<tr>
						<th> Antwoord </th>
						<th width="55 px"> Stemmen </th>
						<th> Score </th>
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1: Geen
						<td align = 'right'>16&nbsp</td>
						<td align = 'right'><?php echo perc_result(16, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(16, 77), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2: 1 tot 4
						<td align = 'right'>25&nbsp</td>
						<td align = 'right'><?php echo perc_result(25, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(25, 77), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3: 5 tot 19
						<td align = 'right'>12&nbsp</td>
						<td align = 'right'><?php echo perc_result(12, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(12, 77), "red"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							4: 20 tot 49
						<td align = 'right'>4&nbsp</td>
						<td align = 'right'><?php echo perc_result(4, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(4, 77), "purple"); ?></td>
					</tr>
					<tr>
						<td> 
							5: 50 of meer
						<td align = 'right'>20&nbsp</td>
						<td align = 'right'><?php echo perc_result(20, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(20, 77), "green"); ?></td>
					</tr>
				</table>
				</td>
			</tr>
		</table>
		<br><br>
	</div>

	<div class="feature">
		<table>
			<tr>
				<td><h2><a href="index.php">Enquête 4</a></h2></td>
			</tr>
			<tr>
			<td>
				Vraag: <strong>Welk kasteel bezoekt u het liefst?</strong> 
				<br><br>
				1. Een ruïne wiens oude restanten de middeleeuwse sfeer oproept? 
				<br>
				2. Een compleet en orgineel middeleeuws kasteel dat is getekend door belegering en verval? 
				<br>
				3. Een kasteel dat is herbouwd of gerestaureerd om de vroegere glorie te herstellen? 
				<br>
				4. Een kasteel dat de tijd heeft overleefd en daardoor wel is aangepast aan een comfortabeler leven of aan moderne strijdwapens? 
				<br><br>Start enquête: 6 november 2004
				</td>
			</tr>
			<tr>
				<td>
					<h3>Resultaat</h3>
					Aantal stemmen: 99
					<br><br> 
				</td>
			</tr>
			<tr>
				<td>
				<table>
					<tr>
						<th> Antwoord </th>
						<th width="55 px"> Stemmen </th>
						<th> Score </th>
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1. Ruïne
						<td align = 'right'>33&nbsp</td>
						<td align = 'right'><?php echo perc_result(33, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(33, 99), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2. Beschadigd
						<td align = 'right'>14&nbsp</td>
						<td align = 'right'><?php echo perc_result(14, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(14, 99), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3. Gerestaureerd
						<td align = 'right'>39&nbsp</td>
						<td align = 'right'><?php echo perc_result(39, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(39, 99), "red"); ?></td>
					</tr>
			 			<tr bgcolor = '#fff6de'>
						<td> 
							4. Doorontwikkeld
						<td align = 'right'>13&nbsp</td>
						<td align = 'right'><?php echo perc_result(13, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(13, 99), "purple"); ?></td>
					</tr>
				</table>
				</td>
			</tr>
			<tr>
				<td>&nbsp;</td>
			</tr>
			<tr>
				<td>
					<a href="javascript:document.form81.SelCastle.value='gaillard';document.form81.submit();">
						<Img title="1. Ruïne, voorbeeld: Chateau Gaillard" SRC="images/small/gaillard_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='harlech';document.form81.submit();">
						<Img title="2. Beschadigd, voorbeeld: Harlech Castle" SRC="images/small/harlech_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='haut_koeningsbourg';document.form81.submit();">
						<Img title="3. Gerestaureerd, voorbeeld: Haut-Köningsbourg" SRC="images/small/haut_koeningsbourg_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='vorselaar';document.form81.submit();">
						<Img title="4. Doorontwikkeld, voorbeeld: Kasteel Vorselaar" SRC="images/small/vorselaar_small.jpg">
					</a>
				</td>
			</tr>
		</table>
		<br><br>
	</div>
