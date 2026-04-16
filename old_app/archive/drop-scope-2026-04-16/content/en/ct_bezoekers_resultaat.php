	<div class="feature">
		<table>
			<tr>
				<td>
                    <h2><a href="index.php"><?php echo "Poll ".$Enquete; ?></a></h2>
                </td>
			</tr>
			<tr>
				<td>
                    <em>
                    <?php 
                        if 		($Answer=="niet")	{ ?> You did not submit an answer. <?php 	}
                        else if ($Answer=="al") 	{ ?> You already submitted an answer. <?php }
                        else 						{ echo "Your answer: ". $Answer; 			} 
					?>
                    </em>
                </td>
			</tr>
			<tr>
				<td>
					Question: <br><strong><?php echo GetEnquetevragen($Enquete,'en_vraag') ?></strong> 
                </td>
			</tr>
			<tr> 
				<td>
				<?php echo GetEnquetevragen($Enquete,afbeelding);  ?>
                </td>
			</tr>
			<tr> 
				<td>
					<?php 
					$Toelichting = GetEnquetevragen($EnqueteContent,'en_toelichting');
					if (empty ($Toelichting)) {}
					else
					{
						echo GetEnquetevragen($EnqueteContent,'en_toelichting'."<br><br>"); 
					}
					?>
                </td>
			</tr>
			<tr>
				<td>
					Start poll: <?php echo GetEnquetevragen($Enquete,'en_startdatum') ?>
                </td>
			</tr>
			<tr>
				<td>
					<h3>Result</h3>
					Number of answers submitted: <?php echo $total ?>
					<br><br> 
				</td>
			</tr>
			<tr>
				<td>
				<table>
					<tr>
						<th> Answer </th>
						<th width="55 px"> Votes </th>
						<th> Score </th>
						<th width="260 px"> </th>
					</tr>
					<?php
                    $Antwoorden = GetEnquetevragen($Enquete,'antwoorden');
					$Teller2 = 1;
					while ($Teller2 <= $Antwoorden) 
					{
					if ($Teller2 == 1) {$Kleur="blue";}
					elseif ($Teller2 == 2) {$Kleur="orange";}
					elseif ($Teller2 == 3) {$Kleur="red";}
					elseif ($Teller2 == 4) {$Kleur="purple";}
					elseif ($Teller2 == 5) {$Kleur="green";}
					$Antwoord = Enquete($Enquete,$Teller2);
					?>
                    <tr bgcolor = "<?php
                                if ($Teller2 & 1) {echo "#ffffff";}
                                else {echo "#fff6de";}
                            ?>"> 
						<td> 
							<?php echo $Teller2.". ".GetEnquetevragen($Enquete,'en_keuze'.$Teller2) ?>
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
                    $Toelichting = GetEnquetevragen($Enquete,'en_comment');
                    if (empty ($Toelichting)) { echo " " ;}
                    else
                    {?> 
                        <h3>Commentary</h3>
                        <?php echo $Toelichting ;
                    }?> 
				</td>
			</tr>
		</table>
	</div>