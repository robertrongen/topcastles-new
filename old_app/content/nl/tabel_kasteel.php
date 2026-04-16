<table border="0" cellpadding="0" cellspacing="0">
	<tr>
    	<td>
            <h2 id="top"><?php echo $line['castle_name'] ?></h2> 
            <table width="700">
                <tr>
                    <td width="120">
                        Top 100:&nbsp;
                    </td>
                    <td width="140">
                    	plaats <strong><?php echo $line['position'] ?></strong>
                    </td>
                    <td width="140">
                        Bronnen top 100:&nbsp;</td>
                    <td>
                    	plaats <strong><?php echo $line['position_ref'] ?></strong>
                    </td>
                </tr>

                <tr bgcolor="#fff6de">
                    <td>
                        Totaalscore:&nbsp;
                    </td>
                    <td>
                        <?php echo "<strong>".$line['score_total']."</strong> punten" ?>
                    </td>
                    <td>
                        Oordeel bezoekers:&nbsp;
                    </td>
                    <td>
                        <?php 	
						if ($line['visitors'] > 0) 
						{
							$Score = $line['score_visitors_2008']; 
							echo "<strong>".$Score."</strong> van ".$line['visitors']." bezoekers." ;
						}
						else 
						{
							echo "Geen oordeel" ;
						}
						?>
                    </td>
                </tr>
 
                <tr>
                    <td>
                    	Totaalscore nu:&nbsp;
                    </td>
                    <td>
                        <strong>
                        <?php 
                        if (HotOrNot($line ['castle_code']) > 0) 
                        {
                            echo round($ScoreNew = (((HotOrNot($line ['castle_code']))*100 + Bezoekers($line ['castle_code'])/5 + 2*$line['score_ref'])/(21/10)), 0)."</strong> punten" ;
                        }
                        else 
                        {
                            echo $ScoreNew = ($line['score_ref'])."</strong> punten" ;
                        }
                         ?>
                    </td>
                    <td>
                        Oordeel nu:&nbsp;
                    </td>
                    <td>
                        <strong>
                        <?php 
                        if (HotOrNot($line ['castle_code']) > 0) 
                        {
                            echo HotOrNot($line ['castle_code'])."</strong> van ".Bezoekers($line ['castle_code'])." bezoekers." ;
                        }
                        else 
                        {
                            echo "Nog geen oordeel" ;
                        }
                        ?>
                    </td>
                </tr>

                <tr bgcolor="#fff6de">
                    <td>
                    	Land:&nbsp;
                    </td>
                    <td>
                        <strong>
                        <a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
						<?php 
                            echo $line ['land']; 
                        ?></a></strong>
                    </td>
                    <td>
                        Stichter:&nbsp;
                    </td>
                    <td>
                        <strong><?php echo $line ['stichter'] ?></strong>
                    </td>
                </tr>

                <tr>
                    <td>
                        Regio:&nbsp;
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
                    <td>
                        Bouwconcept:&nbsp;
                    </td>
                    <td>
                        <strong><?php echo $line ['kasteel_concept'] ?></strong>
                        <br>
		 				<?php
		 				$filename2="images/drawings/concept". $line['cc_code'].".jpg";
						if (file_exists($filename2))
						{ 
						?>
		                	<img src="images/drawings/concept<?php echo $line ['cc_code'] ?>.jpg" height="55">
		                <?php
		                } ?>
                    </td>
                </tr>

                <tr bgcolor="#fff6de">
                    <td>
                        Plaats:&nbsp;
                    </td>
                    <td>
                        <strong><?php echo $line ['place'] ?></strong>
                    </td>
                    <td>
                        Type kasteel:&nbsp;
                    </td>
                    <td>
                        <strong><?php echo $line ['kasteel_type'] ?></strong>
                    </td>
                </tr>
                <tr>
                    <td>
                        Tijdperk:&nbsp;
                    </td>
                    <td>
                        <strong><?php $era = $line ['era']; if ($era > 1) {echo $era."-de eeuw";} ?></strong>
                    </td>
                    <td>
                        Conditie:&nbsp;
                    </td>
                    <td>
                    	<strong><?php echo $line ['conditie'] ?></strong>
                    </td>
                </tr>

            </table>
            <br>
            <table>
                <tr bgcolor="#fff6de">
                    <td width="120">
                        Beschrijving:&nbsp;
                    </td>
                    <td>
                        <?php echo $line ['beschrijving'] ?>
                    </td>
                </tr>
                <tr>
                    <td>
                        Bijzonderheden:&nbsp;
                    </td>
                    <td>
                        <?php echo $line ['opmerkelijk'] ?>
                    </td>
                </tr>
                <tr bgcolor="#fff6de">
                    <td>
                        Website:&nbsp;
                    </td>
                    <td>
                        <a href="<?php echo $line ['website'] ?>" target="_blank"><?php echo $line ['website'] ?></a>
                    </td>
                </tr>
                <tr>
                    <td>
                        Flickriver*:&nbsp;
                    </td>
                    <td>
						<a href="http://www.flickriver.com/photos/tags/castle+<?php echo $line ['tags']; ?>/interesting/" target="_blank"><img src="http://www.flickriver.com/badge/global/tag/interesting/shuffle/medium-horiz/ffffff/333333/castle&nbsp;<?php $tags = str_replace("+","&nbsp;",$line ['tags']); echo $tags; ?>.jpg" border="0" alt="Bekijk meer foto's van dit kasteel op Flickriver" title="Bekijk meer foto's van dit kasteel op Flickriver"/></a>
                    </td>
                </tr>

                <tr bgcolor="#fff6de">
                    <td>
                        Location<?php if (empty ($line ['Latitude'])){echo "*";}?>:
                    </td>
                    <td>
                        <?php 	
                        	if (empty ($line ['Latitude'])) 
							{ 
							?>
		                        <a href="http://maps.google.com/?q=castle+<?php echo $line ['tags'].'+'.$line ['country'].'+'.$line ['place'] ?>&maptype=terrain" target="_blank">
		                        	<Img border=0 SRC="images/general/googlemaps.gif">
		                        </a>
	                    	<?php    
							}
							else 
							{
								$lat = str_replace(",", ".", $line ['Latitude']);
								$lon = str_replace(",", ".", $line ['Longitude']);
								$fullname = explode("(", $line ['castle_name']);
								$name = $fullname['0'];
							?>
								<span class="geo">
								     Latitude: <span class="latitude"><?php echo $lat ; ?></span>,
								     Longitude: <span class="longitude"><?php echo $lon ; ?></span>
								</span>
								<br>
								<a href="http://maps.google.com/maps?q=<?php echo $lat.",".$lon ; ?>+(<?php echo $name ; ?>)&t=k&z=16<?php if (!empty ($line ['maps'])){ echo "&cid=".$line ['maps'] ; }; ?>" target="_blank">
		                        	<Img border=0 SRC="images/general/googlemaps.gif">
		                        </a>
	                        	<Img border=0 SRC="style/spacer10x10.gif" width="20px" >
								<a href="http://bing.com/maps/default.aspx?cp=<?php echo $lat."~".$lon ; ?>&style=a&lvl=16" target="_blank">
		                        	<Img border=0 SRC="images/general/bingmaps.jpg">
		                        </a>
							<?php
							}
						?>
                    </td>
<!--
                   <td>
                        Panoramio*:&nbsp;
                    </td>
                    <td>
                        <a href="http://panoramio.com/map/?tag=castle+<?php echo $line ['tags'].'+'.$line ['country'].'+'.$line ['place'] ?>" target="_blank">
                        <Img border=0 SRC="images/general/panoramio.png">
                        </a>
                    </td>
-->
                </tr>
                <tr>
                    <td colspan="2">
                    	<p style="font-size: 90%;"><i>*gebruikt zoektags</i></p>
                    </td>
                </tr>

           </table>
            <br>
        </td>
	</tr>
	<?php
	//controle op images
	$Teller = 1;
	while ($Teller <= 25)
	{
		if ($Teller == 1) 
		{
			$Nummer = "" ;
		} 
		else 
		{
			$Nummer = $Teller ;
		}
		$filename = "images/large/". $line['castle_code'].$Nummer.".jpg" ;
		if (file_exists($filename))
		{ ?> 
			<tr>
                <td>
                    <Img border=0 SRC=<?php echo "images/large/".$line['castle_code'].$Nummer.".jpg" ; ?> >
                </td>
            </tr>
		  <?php 
		} 
		$Teller = $Teller + 1;
	}
	?>
</table>