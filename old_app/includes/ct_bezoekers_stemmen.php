<div id="content" style="z-index: 4">

	<div class="feature">
		<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
		<br>
		<?php
			include ("functions/ip.php");
		//  Query definieren
			$SelectString = "IP, COUNT(IP) AS aantal_stemmen, MIN(time) AS first, MAX(time) AS last";
			$Table = "stemmen";
			$WhereString = "";
			$OrderbyString = "GROUP BY IP ORDER BY aantal_stemmen DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 50;

		?>
            <table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1" bgcolor="#c0c0c0">
                <tr height="20" style="font-weight:bold ">
                    <th align="right">
                    #&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    IP&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Votes&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    First&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Last&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Land&nbsp;&nbsp;
                    </th>
                </tr>
                <?php
                //tabel opbouwen
                while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
                {
                    if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
                    {
					$IP = $line['IP'];
                    ?>
                    <!-- alternerende rij-opmaak invoegen -->
                        <tr height="18" bgcolor = "<?php
                                        if ($Teller & 1) {echo "#ffffff";}
                                        else {echo "#fff6de";}
                                    ?>"> 
                            <td align="left">
                                <?php echo $Teller ?>&nbsp;&nbsp;
                            </td>
                            <td align="left">
                                <?php echo $line['IP'] ?></a>&nbsp;&nbsp;
                            </td>
                            <td align="left">
                                <?php echo $line['aantal_stemmen'] ?>&nbsp;&nbsp;
                            </td>
                            <td align="left">
                               <?php echo date ("d-M-Y H:i", ($line['first'])) ?></a>&nbsp;&nbsp;
                            </td>
                            <td align="left">
                               <?php echo date ("d-M-Y H:i", ($line['last'])) ?></a>&nbsp;&nbsp;
                            </td>
                            <td align="left">
                                <?php echo (IP_lookup($IP)) ?>
                            </td>
                        </tr>
                    <?php
                    }
                    $Teller = $Teller + 1;
                }
                ?>
            </table>

		<h2 id="top"><?php echo $FeatureTitel_1; ?></h2>
		<br>
		<?php
		//  Query definieren
			$SelectString = "`IP`, COUNT(`IP`) AS `aantal_stemmen`, MIN(`time`) AS `first`, MAX(`time`) AS `last`";
			$Table = "`stemmen`";
			$WhereString = "";
			$OrderbyString = "GROUP BY `IP` ORDER BY `time` DESC";
		//  Query laden
			PerformQuery($SelectString, $Table, $WhereString, $OrderbyString);
		
		//	Variabelen voor tabelopbouw zetten
			$TellerVan = 1;
			$Teller = 1;
			$TellerEind = 50;

		?>
            <table border="0" cellpadding="0" cellspacing="0" id="AutoNumber1" bgcolor="#c0c0c0">
                <tr height="20" style="font-weight:bold ">
                    <th align="right">
                    #&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    IP&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Votes&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    First&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Last&nbsp;&nbsp;
                    </th>
                    <th align="left">
                    Land&nbsp;&nbsp;
                    </th>
                </tr>
                <?php
                //tabel opbouwen
                while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
                if ($line['aantal_stemmen'] >= 10)
				{ 
					{
						if (($Teller >= $TellerVan) && ($Teller <= $TellerEind))
						{
						$IP = $line['IP'];
						?>
						<!-- alternerende rij-opmaak invoegen -->
							<tr height="18" bgcolor = "<?php
											if ($Teller & 1) {echo "#ffffff";}
											else {echo "#fff6de";}
										?>"> 
								<td align="left">
									<?php echo $Teller ?>&nbsp;&nbsp;
								</td>
								<td align="left">
									<?php echo $line['IP'] ?></a>&nbsp;&nbsp;
								</td>
								<td align="left">
									<?php echo $line['aantal_stemmen'] ?>&nbsp;&nbsp;
								</td>
								<td align="left">
								   <?php echo date ("d-M-Y H:i", ($line['first'])) ?></a>&nbsp;&nbsp;
								</td>
								<td align="left">
								   <?php echo date ("d-M-Y H:i", ($line['last'])) ?></a>&nbsp;&nbsp;
								</td>
								<td align="left">
									<?php echo (IP_lookup($IP)) ?>
								</td>
							</tr>
						<?php
						}
						$Teller = $Teller + 1;
					}
				}
                ?>
            </table>
    </div>
</div>
