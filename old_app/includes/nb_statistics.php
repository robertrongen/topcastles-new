<div id="navBar">
	<div class="relatedLinks">
		<div id="navBarList">
	        <table>
				<tr>
					<td>
	                    <h3><?php echo $Text_Sh ?></h3>
					</td>
				</tr>
<!--			<tr>
					<td>
						<?php
						
	                    // verbinding maken met MySQL database
	                    $host = "localhost";
	                    $user = "topkastelen";
	                    $pass = "9kowbh6g";
	                    $dbname = "topkastelen_nl_-_topkastelen";
	                    $tblname = "enquetes";
	                    // verbinding maken met MySQL database
	                    $link = mysql_connect($host,$user,$pass) or die("Could not connect : " . mysql_error()."<BR>");
	                    mysql_select_db($dbname) or die("Could not select database");
	            
	                    $sSQL = "SELECT count(*) as aantal, MAX(time) AS maxtime, MAX(id) AS maxid FROM $tblname WHERE enquete = $Enquete";
	                    $result = mysql_query($sSQL) or die("Query failed : " . mysql_error());
	                    $line = mysql_fetch_array($result, MYSQL_ASSOC);
	                    $maxtime = $line['maxtime'];
	                    $maxid = $line['maxid'];
	            
	                    $sSQL2 = "SELECT * FROM $tblname WHERE id = '$maxid' AND enquete = $Enquete";
	                    $result2 = mysql_query($sSQL2) or die("Query failed : " . mysql_error());
	                    $line2 = mysql_fetch_array($result2, MYSQL_ASSOC);
	            
	                    $sSQL3 = "SELECT count(*) as totaal FROM $tblname WHERE enquete = $Enquete";
	                    $result3 = mysql_query($sSQL3) or die("Query failed : " . mysql_error());
	                    $line3 = mysql_fetch_array($result3, MYSQL_ASSOC);
	                    
	                    ?>
	                    <b><?php echo $Text_S4 ; ?> </b><br>
	                    <?php 
						echo "<li>" . $Text_S3 . ": <b>" . $line2['answer'] . "</b></li>"; 
						echo "<li>" . date ("d-M-Y H:i", $maxtime) . "</li>"; 
						
						mysql_free_result($result);
						mysql_close($link);
						?>
	
						<?php
						$host = "localhost";
						$user = "topkastelen";
						$pass = "9kowbh6g";
						$dbname = "topkastelen_nl_-_topkastelen";
						$tblname = "stemmen";
						// verbinding maken met MySQL database
						$link = mysql_connect($host,$user,$pass) or die("Could not connect : " . mysql_error()."<BR>");
						mysql_select_db($dbname) or die("Could not select database");
				
						$sSQL = "SELECT count(*) as aantal, count(DISTINCT ip) as unieke_bezoekers, MAX(time) AS maxtime, MAX(id) AS maxid FROM $tblname";
						$result = mysql_query($sSQL) or die("Query failed : " . mysql_error());
						$line = mysql_fetch_array($result, MYSQL_ASSOC);
						$maxtime = $line['maxtime'];
						$maxid = $line['maxid'];
						
						$sSQL2 = "SELECT * FROM $tblname WHERE id = '$maxid' ";
						$result2 = mysql_query($sSQL2) or die("Query failed : " . mysql_error());
						$line2 = mysql_fetch_array($result2, MYSQL_ASSOC);
						$Castle = $line2['castle_code'];
						
						$sSQL2a = "SELECT castle_name FROM castles WHERE castle_code = '$Castle' ";
						$result2a = mysql_query($sSQL2a) or die("Query failed : " . mysql_error());
						$line2a = mysql_fetch_array($result2a, MYSQL_ASSOC);
	                    
						?>
					</td>
				</tr>
-->				<tr>
					<td>
	                    <b><?php echo $Text_S1 ?></b>
	                    <li>
	                    <a href="kastelen.php?SubMenu=main&SelCastle=<?php echo $Castle ; ?>&Language=<?php echo $Language ; ?>">
	                    <?php echo $line2a['castle_name'] . "</a>:&nbsp;<b>" . $line2['Rating'] . "</b></li>"; 
						echo "<li>" . date ("d-M-Y H:i", $maxtime) . "</li>"; 
						?>
					</td>
				</tr>
				<tr>
					<td>
	                <?php 
	                    $filename = "images/small/" . $Castle . "_small.jpg";
	                    if (file_exists($filename))
	                    { ?>
						<div class="graphics">
	                        <a href="kastelen.php?SubMenu=main&SelCastle=<?php echo $Castle ; ?>&Language=<?php echo $Language ; ?>">
	                        <Img height="110" width="110" SRC="<?php echo $filename ?>">
	                        </a>
                        </div>
	                      <?php
	                    }
					?>
					</td>
				</tr>
				<tr>
					<td>
						<?php
							mysql_free_result($result);
	                    	mysql_close($link);
						?>
					</td>
				</tr>
				<tr>
					<td>
	                    <b><?php echo $Text_S7 ?></b>
	                    <li>
		                    <?php
								echo $line['aantal'] . "&nbsp;" . $Text_S5 ;
							?>
						</li>
	                    <li>
		                    <?php
								echo $line['unieke_bezoekers'] . "&nbsp;" . $Text_S6 ;
							?>
						</li>
					</td>
				</tr>
	        </table>	
    	</div>
    </div>
</div>
