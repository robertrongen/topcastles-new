<div id="navBar"> 
	<div id="sectionLinks" style="z-index: 3">

<!-- BLADER IN LIJST -->
        <h3><?php echo $MenuText_1; ?></h3>
        <ul>
            <li> 
				<?php 
					NextCastleUp($SelCastle) ;
					if ($Found == 1) 
                    {   ?>
                        <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleUp) ; ?> ">
                        &nbsp;&nbsp; <?php echo $MenuText_1_1; ?> &nbsp; ( <?php echo $PositionUp ?> ) 
                        </a> <?php
                    }  
                    else {  }
                ?>  	
            </li>
            <li> 
				<?php 
					NextCastleDown($SelCastle) ;
					if ($Found == 1) 
                    {   ?>
                        <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleDown) ; ?> ">
                        &nbsp;&nbsp; <?php echo $MenuText_1_2; ?> &nbsp; ( <?php echo $PositionDown ?> ) 
                        </a> <?php
                    }  
                    else {  }
                ?>  	
            </li>
        </ul>

     </div>

<!-- BLADER IN LAND -->
	<div id="sectionLinks" style="z-index: 3">
        <h3><?php echo $MenuText_2; ?></h3>
        <ul>
            <li> 
 					<?php 
						NextCastleCountryUp($SelCastle) ;
						$PositionCountryUp = LookupPosition($CastleCountryUp) ;
						if (!empty($PositionCountryUp)) 
						{   ?>
                            <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleCountryUp) ; ?> ">
 							&nbsp;&nbsp; <?php echo $MenuText_1_1; ?> &nbsp; ( <?php echo $PositionCountryUp ?> ) 
                    		</a> <?php
                        }  
						else {  }
					?>  	
            </li>
            <li> 
 					<?php 
						NextCastleCountryDown($SelCastle) ;
						$PositionCountryDown = LookupPosition($CastleCountryDown) ;
						if (!empty($PositionCountryDown)) 
						{   ?>
                            <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleCountryDown) ; ?> ">
 							&nbsp;&nbsp; <?php echo $MenuText_1_2; ?> &nbsp; ( <?php echo $PositionCountryDown ?> ) 
                    		</a> <?php
                        }  
						else {  }
					?>  	
            </li>
        </ul>
    </div>

<!-- BLADER IN REGIO -->
	<div id="sectionLinks" style="z-index: 3">
        <h3><?php echo $MenuText_5; ?></h3>
        <ul>
            <li> 
 					<?php 
						NextCastleRegionUp($SelCastle) ;
						$PositionRegionUp = LookupPosition($CastleRegionUp) ;
						if (!empty($PositionRegionUp)) 
						{   ?>
                            <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleRegionUp) ; ?> ">
 							&nbsp;&nbsp; <?php echo $MenuText_1_1; ?> &nbsp; ( <?php echo $PositionRegionUp ?> ) 
                    		</a> <?php
                        }  
						else {  }
					?>  	
            </li>
            <li> 
 					<?php 
						NextCastleRegionDown($SelCastle) ;
						$PositionRegionDown = LookupPosition($CastleRegionDown) ;
						if (!empty($PositionRegionDown)) 
						{   ?>
                            <a href="<?php SelMenu(kastelen,$Language,main,SelCastle,$CastleRegionDown) ; ?> ">
 							&nbsp;&nbsp; <?php echo $MenuText_1_2; ?> &nbsp; ( <?php echo $PositionRegionDown ?> ) 
                    		</a> <?php
                        }  
						else {  }
					?>  	
            </li>
        </ul>
    </div>

<!-- STATIC SCORE INFO -->
    <div class="relatedLinks">
    <table>
        <tr>
            <td>
	            	<h3>Top 100 scoring</h3>
			</td>
		</tr>
        <tr>
            <td>
				<?php 
					$filename="images/small/". $SelCastle."_small.jpg";
					if (file_exists($filename))
					{ ?>
						<Img height="4" width="4" SRC="style/spacer10x10.gif">
						<Img height="55" width="55" SRC="<?php echo $filename ?>">
					  <?php 
					}
				?>
			</td>
		</tr>
		<tr>
			<td>
				Static top 100 mode is enabled. Visitor voting is disabled.
			</td>
		</tr>
		</table>

    </div>

</div>	

