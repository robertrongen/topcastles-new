<?php 		include ("functions/enquete.php"); ?>
	<tr>
		<td>
            <h3><a href="achtergrond.php?SubMenu=resultaat"><?php echo $Text_1 . "&nbsp;".$Enquete ?></a></h3>
            <?php echo GetEnquetevragen($Enquete,$Language.'_vraag')?>
            <br>
            <table width="180" cellspacing="0"  border="0" cellpadding="0" align="left">
			<?php 
//			if (!empty(GetEnquetevragen($Enquete,afbeelding)) { echo GetEnquetevragen($Enquete,afbeelding) ; }  
			?>
                <FORM method="post" action="achtergrond.php?SubMenu=resultaat" id=form71 name=form71>
                <?php
                echo GetEnquetevragen($Enquete,afbeelding);  
                $Antwoorden = GetEnquetevragen($Enquete,'antwoorden');
                $Teller3 = 1;
                while ($Teller3 <= $Antwoorden) 
                {?>
                    <tr>
                        <td width="2"><input type="radio" name="Answer" value="<?php echo $Teller3 ?>";></td>
                        <td colspan="2" align="left"><?php echo $Teller3.". ".GetEnquetevragen($Enquete,$Language.'_keuze'.$Teller3) ?><hr></td>
                    </tr>
                <?php
                $Teller3 = $Teller3 + 1;
                }?>
                    <tr>
                        <td colspan="3">
                            <input type="Hidden" id="SubMenu" name="SubMenu" value="resultaat">
                            <input type="Hidden" id="Language" name="Language" value="<?php echo $Language ?>">
                            <input type="submit" value="stem">
                        </td>
                    </tr>
                </FORM>
            </table>
            
        </td>
	</tr>
