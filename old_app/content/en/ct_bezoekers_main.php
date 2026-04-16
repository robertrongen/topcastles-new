	<div class="feature">
		<table>
			<tr>
				<td><h2><a href="index.php">Poll 6</a></h2></td>
			</tr>
			<tr>
				<td><em>
				<?php 
					if ($Answer=="niet")
					{
					?>
						You did not submit an answer.
					<?php
					}
					else if ($Answer=="al")
					{
					?>
						You already submitted an answer.
					<?php
					}
					else
					{
					echo "Your answer: ". $Answer;
					}
				?>
				</em><br><br>
				Question: <br><strong>What should be done with the ruin of an old castle??</strong> 
				<br><br>
				Start poll: May 5th, 2005
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
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1: Nothing, let it decay further
						<td align = 'right'><?php echo $Antwoord1; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord1, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord1, $total), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2: Preserve its current condition
						<td align = 'right'><?php echo $Antwoord2; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord2, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord2, $total), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3: Make public use possible (e.g. museum)
						<td align = 'right'><?php echo $Antwoord3; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord3, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord3, $total), "red"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							4: Rebuild to its original medieval design
						<td align = 'right'><?php echo $Antwoord4; ?>&nbsp</td>
						<td align = 'right'><?php echo perc_result($Antwoord4, $total); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result($Antwoord4, $total), "purple"); ?></td>
					</tr>
					<tr>
						<td> 
							5: Rebuild to the most beautiful design
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
				<td><h2><a href="index.php">Poll 5</a></h2></td>
			</tr>
			<tr>
				<td>
				Question: <br><strong>How many <a href="achtergrond.php" title="Zie definitie van kasteel">medieval</a> castles did you visit or take pictures last year?</strong> 
				<br><br>
				Start poll: January 22nd, 2005
			</td>
			</tr>
			<tr>
				<td>
					<h3>Result</h3>
					Number of answers submitted: 77
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
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1: None
						<td align = 'right'>16&nbsp</td>
						<td align = 'right'><?php echo perc_result(16, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(16, 77), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2: 1-4 castles
						<td align = 'right'>25&nbsp</td>
						<td align = 'right'><?php echo perc_result(25, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(25, 77), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3: 5-19 castles
						<td align = 'right'>12&nbsp</td>
						<td align = 'right'><?php echo perc_result(12, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(12, 77), "red"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							4: 20-49 castles
						<td align = 'right'>4&nbsp</td>
						<td align = 'right'><?php echo perc_result(4, 77); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(4, 77), "purple"); ?></td>
					</tr>
					<tr>
						<td> 
							5: 50 castles or more
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
				<td><h2><a href="index.php">Poll 4</a></h2></td>
			</tr>
			<td>
				Question: <strong>Which castle do you prefer to visit?</strong> 
				<br><br>
				1. Castle ruins: A ruin that breathe the history of the castle and its setting? 
				<br>
				2. Damaged castles: A complete, unrestaured castle with traces of seeges and decay? 
				<br>
				3. Restored castles: A castle rebuild or restaured in an attempt to show its original glory? 
				<br>
				4. Developed castles: A castle that has survived the ages and has been adjusted over time to make castle life more comfortable? 
				<br><br>
			</td>
			<tr>
				<td>
					<h3>Results</h3>
					Number of answers submitted: 99
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
						<th width="250 px"> </th>
					</tr>
					<tr>
						<td> 
							1. Castle ruins
						<td align = 'right'>33&nbsp</td>
						<td align = 'right'><?php echo perc_result(33, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(33, 99), "blue"); ?></td>
					</tr>
					<tr bgcolor = '#fff6de'>
						<td> 
							2. Damaged castles
						<td align = 'right'>14&nbsp</td>
						<td align = 'right'><?php echo perc_result(14, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(14, 99), "orange"); ?></td>
					</tr>
					<tr>
						<td> 
							3. Restored castles
						<td align = 'right'>39&nbsp</td>
						<td align = 'right'><?php echo perc_result(39, 99); ?>&nbsp;%&nbsp;&nbsp;</td>
						<td><?php echo Blok (perc_result(39, 99), "red"); ?></td>
					</tr>
			 			<tr bgcolor = '#fff6de'>
						<td> 
							4. Developed castles
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
						<Img title="1. Castle ruins, example: Chateau Gaillard" SRC="images/small/gaillard_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='harlech';document.form81.submit();">
						<Img title="2. Damaged castles, example: Harlech Castle" SRC="images/small/harlech_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='haut_koeningsbourg';document.form81.submit();">
						<Img title="3. Restaured castles, example: Castle of Haut-Köningsbourg" SRC="images/small/haut_koeningsbourg_small.jpg">
					</a>
					<a href="javascript:document.form81.SelCastle.value='vorselaar';document.form81.submit();">
						<Img title="4. Developed castles, example: Castle of Vorselaar" SRC="images/small/vorselaar_small.jpg">
					</a>
				</td>
			</tr>
		</table>
		<br><br>
	</div>
