<div id="navBar">
	<div class="relatedLinks">
        <table>
			<tr>
				<td>
                    <h3><?php echo $Text_Rh; ?></h3>
				</td>
			</tr>
			<tr>
				<td>
					<?php
							
					//  verbinding maken met MySQL database
						include ("includes/dbconnect.php");
			
					//	Max Position bepalen					
						$sSQL = "SELECT MAX(position) AS maxposition FROM castles";
						$result = mysql_query($sSQL) or die("Query failed : " . mysql_error());
						$line = mysql_fetch_array($result, MYSQL_ASSOC);
						$maxposition = $line['maxposition'];
					
					//	Random kasteel kiezen
						$CastlePosition = RAND (1, $maxposition);
					
					//	Gegevens kasteel laden
						$sSQL2 = "SELECT * FROM castles WHERE position = '$CastlePosition' ";
						$result2 = mysql_query($sSQL2) or die("Query failed : " . mysql_error());
						$line2 = mysql_fetch_array($result2, MYSQL_ASSOC);
						$Castle = $line2['castle_code'];

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
					<a href="kastelen.php?SubMenu=main&SelCastle=<?php echo $Castle ; ?>&Language=<?php echo $Language ; ?>">
	                    <?php 
	                    	echo $CastlePosition . ". " . $line2['castle_name']; 
						?>
					</a>
                    (
                    <?php
                    	if ($Language == "en")
                    	{ 
                    	echo $line2['country']; 
                    	}
                    	else
                    	{
                    	echo $line2['land']; 
                    	}
					?>)
					<?php
						mysql_free_result($result);
	                    mysql_close($link);
					?>
				</td>
			</tr>
        </table>	
    </div>
</div>
