<table border="0" cellpadding="0" cellspacing="0">
	<tr><td>
  	<h2 id="top"><?php echo $line['castle_name'] ?></h2> 
	<table width="590">
		<tr bgcolor="#fff6de">
			<td width="90">Land:&nbsp;</td><td width="160"><strong>
				<a href="javascript:document.form42.SubMenu.value='main';document.form42.SelCountry.value='<?php echo $line['land'] ?>';document.form42.submit();" >
			<?php 
				echo $line ['land']; 
			?></a></strong></td>
			<td width="90">Stichter:&nbsp;</td><td><strong><?php echo $line ['stichter'] ?></strong></td>
		</tr>
		<tr>
			<td width="90">Regio:&nbsp;</td><td width="160"><strong>
				<a href="javascript:document.form42.SelRegion.value='<?php echo $line['region'] ?>';document.form42.SubMenu.value='regio';document.form42.submit();" >
			<?php 
				echo $line ['region'] 
			?></a></strong></td>
			<td width="90">Bouwconcept:&nbsp;</td><td><strong><?php echo $line ['kasteel_concept'] ?></strong></td>
		</tr>
		<tr bgcolor="#fff6de">
			<td width="90">Plaats:&nbsp;</td><td width="160"><strong><?php echo $line ['place'] ?></strong></td>
			<td width="90">Type kasteel:&nbsp;</td><td><strong><?php echo $line ['kasteel_type'] ?></strong></td>
		</tr>
		<tr>
			<td width="90">Tijdperk:&nbsp;</td><td width="160"><strong><?php $era = $line ['era']; if ($era > 1) {echo $era."-de eeuw";} ?></strong></td>
			<td width="90">Conditie:&nbsp;</td><td><strong><?php echo $line ['conditie'] ?></strong></td>
		</tr>
	</table>
	<br>
	<table>
		<tr><td width="75">Beschrijving:&nbsp;</td><td><?php echo $line ['beschrijving'] ?></td></tr>
		<tr bgcolor="#fff6de"><td width="75">Bijzonderheden:&nbsp;</td><td><?php echo $line ['opmerkelijk'] ?></td></tr>
		<tr><td width="75">Website:&nbsp;</td><td><a href="<?php echo $line ['website'] ?>" target="_blank"><?php echo $line ['website'] ?></a></td></tr>
	</table>
	<br>
	</td>
	</tr>
	<?php
	//controle op images
	$filename="images/large/". $line['castle_code'].".jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code'].".jpg" ?> >
		</td></tr>
	<?php } 
	$filename="images/large/". $line['castle_code']."2.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."2.jpg" ?> >
		</td></tr>
		<?php 
	} 
	$filename="images/large/". $line['castle_code']."3.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."3.jpg" ?> >
		</td></tr>
	<?php 
	} 
	$filename="images/large/". $line['castle_code']."4.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."4.jpg" ?> >
		</td></tr>
	<?php 
	} 
	$filename="images/large/". $line['castle_code']."5.jpg";
	if (file_exists($filename))
	{ ?> 
		<tr><td>
		<Img border=0 SRC=<?php echo "images/large/".$line['castle_code']."5.jpg" ?> >
		</td></tr>
	<?php 
	} 
	?>
	</tr>
</table>
