@if (@X)==(@Y) @end /* JScript comment
@echo off

set DIR=%~dp0
set LINK=%DIR%Centsa.lnk

echo delete.me > %DIR%\delete.me.centsa

if exist "%DIR%\delete.me.centsa" (
	del %DIR%\delete.me.centsa
) else (
	echo You do not have permission to write to this directory. Try a different directory or running as administrator
	pause
	exit /b 1
)

echo delete.me > %windir%\delete.me.centsa

if exist "%windir%\delete.me.centsa" (
	set ADMIN=yes
	del %windir%\delete.me.centsa
) else (
	set ADMIN=no
)

if not exist %LINK% (
	cscript //E:JScript //nologo "%~f0" "%~f0" -linkfile "%LINK%" -linkarguments "-Droot.dir=%DIR% -cp %DIR%lib\*;%DIR% nohorjo.centsa.Main" -iconlocation "%DIR%icon.ico" -adminpermissions "%ADMIN%"
)

start javaw -Droot.dir=%DIR%  -cp %DIR%lib\*;%DIR% nohorjo.centsa.Main

exit /b %errorlevel%
@if (@X)==(@Y) @end JScript comment */
   
   
   var args=WScript.Arguments;
   var scriptName=args.Item(0);
   
   function getlnkChars(lnkPath) {
		var ado = WScript.CreateObject("ADODB.Stream");
		ado.Type = 2;
		
		ado.CharSet = "iso-8859-1";
		ado.Open();
		ado.LoadFromFile(lnkPath);

		var adjustment = "\u20AC\u0081\u201A\u0192\u201E\u2026\u2020\u2021" +
						 "\u02C6\u2030\u0160\u2039\u0152\u008D\u017D\u008F" +
						 "\u0090\u2018\u2019\u201C\u201D\u2022\u2013\u2014" +
						 "\u02DC\u2122\u0161\u203A\u0153\u009D\u017E\u0178" ;

						 
		var fs = new ActiveXObject("Scripting.FileSystemObject");
		var size = (fs.getFile(lnkPath)).size;
						
		var lnkBytes = ado.ReadText(size);
		ado.Close();
		var lnkChars=lnkBytes.split('');
		for (var indx=0;indx<size;indx++) {
			if ( lnkChars[indx].charCodeAt(0) > 255 ) {
			   lnkChars[indx] = String.fromCharCode(128 + adjustment.indexOf(lnkChars[indx]));
			}
		}
		return lnkChars;
	
   }
   
   function setAdminPermissions(lnkPath , flag) {
		lnkChars=getlnkChars(lnkPath);
		var ado = WScript.CreateObject("ADODB.Stream");
		ado.Type = 2;
		ado.CharSet = "iso-8859-1";
		ado.Open();
		if (flag) {
			lnkChars[21]=String.fromCharCode(32);
		} else {
			lnkChars[21]=String.fromCharCode(0);
		}
		ado.WriteText(lnkChars.join(""));
		ado.SaveToFile(lnkPath, 2);
		ado.Close();
		
   }
   
   for (var arg =  1;arg<3;arg=arg+2) {
   
		if ( args.Item(arg).toLowerCase() == "-linkfile" ) {
			var linkfile = args.Item(arg+1);
		}
				
   }
   
   var oWS = new ActiveXObject("WScript.Shell");
   var oLink = oWS.CreateShortcut(linkfile);
 
   oLink.TargetPath = "javaw";
   oLink.Description = "Centsa money managing solution";
   
   for (var arg = 3 ; arg<args.Length;arg=arg+2) {
		
		if (args.Item(arg).toLowerCase() == "-linkarguments") {
			oLink.Arguments = args.Item(arg+1);
		}
		
		if (args.Item(arg).toLowerCase() == "-iconlocation") {
			oLink.IconLocation = args.Item(arg+1);
		}
	
		if (args.Item(arg).toLowerCase() == "-adminpermissions") {
			if(args.Item(arg+1).toLowerCase() == "yes") {
				var adminPermissions= true;
			} else if(args.Item(arg+1).toLowerCase() == "no") {
				var adminPermissions= false;
			}
		}
   }
   oLink.Save();
   
   if (!(typeof adminPermissions === 'undefined')) {
		setAdminPermissions(linkfile ,adminPermissions);
   }
