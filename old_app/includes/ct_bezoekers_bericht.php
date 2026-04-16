<div id="content" style="z-index: 4">
	<div class="feature">
		<?php 
		include ("content/{$Language}/ct_bezoekers_bericht.php");
		echo $Text_1; 
		/*
		##############################################################################
		# PLEASE DO NOT REMOVE THIS HEADER!!!
		#
		# COPYRIGHT NOTICE
		#
		# FormMail.php v4.2
		# (Originally v4.1b -- Fixed to illiminate spam gateway exploit)
		# Fixed by Tom Parkison ( trparky@toms-world.org )
		#
		# Copyright 2000,2001 Ai Graphics and Joe Lumbroso (c) All rights reserved.
		# Created 07/06/00   Last Modified 08/06/2001
		# Joseph Lumbroso, http://www.aigraphics.com, http://www.dtheatre.com
		#                  http://www.lumbroso.com/scripts/
		##############################################################################
		#
		# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
		# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
		# OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
		# ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
		# OTHER DEALINGS IN THE SOFTWARE.
		#
		##############################################################################
		*/
		
		$style_sheet = "style/2col_leftNav.css";
		
		// formmail version (for debugging mostly)
		$version = "4.2";
		$allowed_email_recipients_array = array('topkastelen.nl');
		# THIS IS REQUIRED FOR THE SCRIPT TO RUN.  YOU MUST FILL IT IN WITH YOUR
		# DOMAIN NAME.  THIS IS TO CORRECT THE SPAM GATEWAY EXPLOIT IN v4.1b.
		#
		# THE VALUES CAN BE FULL EMAIL ADDRESSES OR JUST DOMAIN NAMES.
		
		// referers.. domains/ips that you will allow forms to
		// reside on.
		$referers = array('topkastelen.nl');
		
		// banned emails, these will be email addresses of people
		// who are blocked from using the script (requested)
		$banlist = array();
		
		// our mighty error function..
		function print_error($reason,$type = 0) 
		{
		   global $version;
		   build_body($title, $bgcolor, $text_color, $link_color, $vlink_color, $alink_color, $style_sheet);
		   // for missing required data
		   if ($type == "missing") 
		   {
			   echo $Text_3; ?><p>
		<!--
			  The form was not submitted for the following reasons:<p>
		-->
			 <ul><?
			 echo $reason."\n";
			 ?></ul>
			 <?php echo $Text_2; ?><?
		   } 
		   else 
		   { // every other error
			 echo $Text_3; ?><p>
		<!--
			  The form was not submitted for the following reasons:<p>
		-->
			  <?
		   }
		   echo "<br><br>\n";
		   exit;
		}
		
		// function to check the banlist
		// suggested by a whole lot of people.. Thanks
		function check_banlist($banlist, $email) {
		   if (count($banlist)) {
			  $allow = true;
			  foreach($banlist as $banned) {
				 $temp = explode("@", $banned);
				 if ($temp[0] == "*") {
					$temp2 = explode("@", $email);
					if (trim(strtolower($temp2[1])) == trim(strtolower($temp[1])))
					   $allow = false;
				 } else {
					if (trim(strtolower($email)) == trim(strtolower($banned)))
					   $allow = false;
				 }
			  }
		   }
		   if (!$allow) {
			  print_error($Text_9);
		   }
		}
		
		// function to check the referer for security reasons.
		// contributed by some one who's name got lost.. Thanks
		// goes out to him any way.
		function check_referer($referers) 
		{
		   if (count($referers)) 
		   {
			  $found = false;
			  $temp = explode("/",getenv("HTTP_REFERER"));
			  $referer = $temp[2];
			  for ($x=0; $x < count($referers); $x++) 
			  {
				 if (eregi ($referers[$x], $referer)) 
				 {
					$found = true;
				 }
			  }
			  if (!getenv("HTTP_REFERER"))
				 $found = false;
			  if (!$found)
			  {
				 print_error($Text_10);
				 error_log("[FormMail.php] Illegal Referer. (".getenv("HTTP_REFERER").")", 0);
			  }
				 return $found;
			  } 
			  else 
			  {
				 return true; // not a good idea, if empty, it will allow it.
			  }
			}
		if ($referers)
		   check_referer($referers);
		
		if ($banlist)
		   check_banlist($banlist, $email);
		
		// parse the form and create the content string which we will send
		function parse_form($array) 
		{
		   // build reserved keyword array
		   $reserved_keys[] = "MAX_FILE_SIZE";
		   $reserved_keys[] = "required";
		   $reserved_keys[] = "redirect";
		   $reserved_keys[] = "email";
		   $reserved_keys[] = "require";
		   $reserved_keys[] = "path_to_file";
		   $reserved_keys[] = "recipient";
		   $reserved_keys[] = "subject";
		   $reserved_keys[] = "bgcolor";
		   $reserved_keys[] = "text_color";
		   $reserved_keys[] = "link_color";
		   $reserved_keys[] = "vlink_color";
		   $reserved_keys[] = "alink_color";
		   $reserved_keys[] = "title";
		   $reserved_keys[] = "missing_fields_redirect";
		   $reserved_keys[] = "env_report";
		   if (count($array)) {
			  while (list($key, $val) = each($array)) 
			  {
				 // exclude reserved keywords
				 $reserved_violation = 0;
				 for ($ri=0; $ri < count($reserved_keys); $ri++) 
				 {
					if ($key == $reserved_keys[$ri]) 
					{
					   $reserved_violation = 1;
					}
				 }
				 // prepare content
				 if ($reserved_violation != 1) 
				 {
					if (is_array($val)) 
					{
					   for ($z=0;$z < count($val);$z++) 
					   {
						  $content .= "$key: $val[$z]\n";
					   }
					} 
					else 
					{
					   $content .= "$key: $val\n";
					}
				 }
			  }
		   }
		   return $content;
		}
		
		// mail the content we figure out in the following steps
		function mail_it($content, $subject, $email, $recipient, $allowed_email_recipients_array) 
		{
		
		// INCLUDED TO FIX SPAM GATEWAY EXPLOIT
		
		$recipient_array = explode(",", $recipient);
		$size_of_recipients_array = count($recipient_array);
		$size_of_allowed_recipients_array = count($allowed_email_recipients_array);
		for ($recipients_array_count = 0; $recipients_array_count != $size_of_recipients_array; $recipients_array_count++) 
		{
		 for ($allowed_recipients_array_count = 0; $allowed_recipients_array_count != $size_of_allowed_recipients_array; $allowed_recipients_array_count++) 
		 {
		  if ( stristr($recipient_array[$recipients_array_count],$allowed_email_recipients_array[$allowed_recipients_array_count]) ) 
		  {
		   if ($new_recipient == "") 
		   {
			$new_recipient = $recipient_array[$recipients_array_count];
		   }
		   else 
		   {
			$new_recipient .= ",";
			$new_recipient .= "$recipient_array[$recipients_array_count]";
		   }
		  }
		 }
		}
		
		$recipient = $new_recipient;
		
		// INCLUDED TO FIX SPAM GATEWAY EXPLOIT
		
				mail($recipient, $subject, $content, "From: $email\r\nReply-To: $email\r\nX-Mailer: DT_formmail");
		}
		
		// take in the body building arguments and build the body tag for page display
		function build_body($title, $bgcolor, $text_color, $link_color, $vlink_color, $alink_color, $style_sheet) {
		   if ($style_sheet)
			  echo "<LINK rel=STYLESHEET href=\"$style_sheet\" Type=\"text/css\">\n";
		   if ($title)
			  echo "<title>$title</title>\n";
		   if (!$bgcolor)
			  $bgcolor = "#FFFFFF";
		   if (!$text_color)
			  $text_color = "#000000";
		   if (!$link_color)
			  $link_color = "#0000FF";
		   if (!$vlink_color)
			  $vlink_color = "#FF0000";
		   if (!$alink_color)
			  $alink_color = "#000088";
		   if ($background)
			  $background = "background=\"$background\"";
		   echo "<body bgcolor=\"$bgcolor\" text=\"$text_color\" link=\"$link_color\" vlink=\"$vlink_color\" alink=\"$alink_color\" $background>\n\n";
		}
		
		// check for a recipient email address and check the validity of it
		// Thanks to Bradley miller (bradmiller@accesszone.com) for pointing
		// out the need for multiple recipient checking and providing the code.
		$recipient_in = split(',',$recipient);
		for ($i=0;$i < count($recipient_in);$i++) {
		   $recipient_to_test = trim($recipient_in[$i]);
		   if (!eregi("^[_\\.0-9a-z-]+@([0-9a-z][0-9a-z-]+\\.)+[a-z]{2,3}$", $recipient_to_test)) {
			  print_error($Text_11_1.$recipient_to_test.$Text_11_2);
		   }
		}
		
		// This is because I originally had it require but too many people
		// were used to Matt's Formmail.pl which used required instead.
		if ($required)
		   $require = $required;
		// handle the required fields
		if ($require) {
		   // seperate at the commas
		   $require = ereg_replace( " +", "", $require);
		   $required = split(",",$require);
		   for ($i=0;$i < count($required);$i++) {
			  $string = trim($required[$i]);
			  // check if they exsist
			  if((!(${$string})) || (!(${$string}))) {
				 // if the missing_fields_redirect option is on: redirect them
				 if ($missing_fields_redirect) {
					header ("Location: $missing_fields_redirect");
					exit;
				 }
				 $require;
				 $missing_field_list .= "<b>".$Text_12.": $required[$i]</b><br>\n";
			  }
		   }
		   // send error to our mighty error function
		   if ($missing_field_list)
			  print_error($missing_field_list,"missing");
		}
		
		// check the email fields for validity
		if (($email) || ($EMAIL)) {
		   $email = trim($email);
		   if ($EMAIL)
			  $email = trim($EMAIL);
		   if (!eregi("^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+\.)+[a-z]{2,3}$", $email)) {
			  print_error($Text_4);
		   }
		   $EMAIL = $email;
		}
	
		// prepare the content
		$content = parse_form($HTTP_POST_VARS);

		if (isset($HTTP_POST_VARS["tekst"]))
			$Tekst=$HTTP_POST_VARS["tekst"];
		else
			$Tekst="";

		// check for a file if there is a file upload it
		if ($file_name) { 
		   if ($file_size > 0) {
			  if (!ereg("/$", $path_to_file))
				 $path_to_file = $path_to_file."/";
			  $location = $path_to_file.$file_name;
			  if (file_exists($path_to_file.$file_name))
				 $location .= ".new";
			  copy($file,$location);
			  unlink($file);
			  $content .= "<br><br>"."Uploaded File: ".$location."\n";
		   }
		}
		
		// second file.
		if ($file2_name) {
		   if ($file_size > 0) {
			  if (!ereg("/$", $path_to_file))
				 $path_to_file = $path_to_file."/";
			  $location = $path_to_file.$file2_name;
			  if (file_exists($path_to_file.$file2_name))
				 $location .= ".new";
			  copy($file2,$location);
			  unlink($file2);
			  $content .= "Uploaded File: ".$location."\n";
		   }
		}
		
		// if the subject option is not set: set the default
		if (!$subject)
		   echo "$subject = ".$Text_5_1.$recipient_to_test.$Text_5_2;
		
		// send it off
		mail_it(stripslashes($content), stripslashes($subject), $email, $recipient, $allowed_email_recipients_array);
		
		// if the redirect option is set: redirect them
		if ($redirect) {
		   header ("Location: $redirect");
		   exit;
		} else {
		   print $Text_7_1;
		   print $Text_7_2;
		   echo "<br><br>\n";
		   echo "<table><tr><td>e-mail:</td> <td><b>".$email."</b></td></tr>";
		   echo "<tr><td><br>".$Text_7_3.":</td> <td><b>".$Tekst."</b></td></tr>";
		   echo "<tr><td>".$Text_7_4.":</td>   <td><b><a href='../upload/".$file_name."' target='_blank'>".$file_name."</a></b></td></tr></table>";
		   echo "<br><br>".$Text_2;
		   echo "<br><br>\n";
		   exit;
		}
		
		// <----------    THE END    ----------> //  
		?>
	</div>
</div>
