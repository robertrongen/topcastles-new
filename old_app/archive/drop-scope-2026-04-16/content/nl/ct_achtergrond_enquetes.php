	<div class="feature">
		<table>
			<tr>
				<td>
                    <h2><a href="index.php">Enqu&ecirc;te <?php echo $EnqueteContent; ?></a></h2>
                </td>
			</tr>
			<tr> 
				<td>
					Vraag: <br><strong><?php echo GetEnquetevragen($EnqueteContent,'nl_vraag') ?></strong> 
                </td>
			</tr>
			<tr> 
				<td>
				<?php echo GetEnquetevragen($EnqueteContent,afbeelding);  ?>
                </td>
			</tr>
			<tr> 
				<td>
					<?php 
					$Toelichting = GetEnquetevragen($EnqueteContent,'nl_toelichting');
					if (empty ($Toelichting)) {}
					else
					{
						echo "Toelichting: ".GetEnquetevragen($EnqueteContent,'nl_toelichting'."<br><br>"); 
					}
					?>
                </td>
			</tr>
			<tr>
				<td>
					Start enqu&ecirc;te: <?php echo GetEnquetevragen($EnqueteContent,'nl_startdatum') ?>
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
						<th width="260 px"> </th>
					</tr>
					<?php
                    $Antwoorden = GetEnquetevragen($EnqueteContent,'antwoorden');
					$Teller2 = 1;
					while ($Teller2 <= $Antwoorden) 
					{
					if ($Teller2 == 1) {$Kleur="blue";}
					elseif ($Teller2 == 2) {$Kleur="orange";}
					elseif ($Teller2 == 3) {$Kleur="red";}
					elseif ($Teller2 == 4) {$Kleur="purple";}
					elseif ($Teller2 == 5) {$Kleur="green";}
					elseif ($Teller2 == 6) {$Kleur="yellow";}
					$Antwoord = Enquete($EnqueteContent,$Teller2);
					?>
                    <tr bgcolor = "<?php
                                if ($Teller2 & 1) {echo "#ffffff";}
                                else {echo "#fff6de";}
                            ?>"> 
						<td> 
							<?php echo $Teller2.". ".GetEnquetevragen($EnqueteContent,'nl_keuze'.$Teller2) ?>
						<td align = 'right'><?php echo $Antwoord; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord, $total), $Kleur); ?></td>
					</tr>
					<?php
					$Teller2 = $Teller2 + 1;
					}
						?>
				</table>
				</td>
			</tr>
			<tr>
				<td>
					<?php
                    $Toelichting = GetEnquetevragen($EnqueteContent,'nl_comment');
                    if (empty ($Toelichting)) { echo " " ;}
                    else
                    {
					?> 
                    	<h3>Toelichting</h3>
                    <?php 
						echo $Toelichting ;
                    }
					?> 
				</td>
			</tr>
			<tr>
			  <td>&nbsp;</td>
			</tr>
		</table>
	</div>