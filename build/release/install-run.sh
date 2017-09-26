#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [ -h "${SOURCE}" ]; do
  DIR="$( cd -P "$( dirname "${SOURCE}" )" && pwd )"
  SOURCE="$(readlink "${SOURCE}")"
  [[ ${SOURCE} != /* ]] && SOURCE="${DIR}/${SOURCE}"
done
DIR="$( cd -P "$( dirname "${SOURCE}" )" && pwd )"

if [ "$1" = "uninstall" ]; then
   rm -f ${DIR}/Centsa.desktop
   rm -f ~/.local/share/applications/Centsa.desktop
   rm -f /usr/share/applications/Centsa.desktop
else
	if [ ! -f ${DIR}/Centsa.desktop ]; then
		echo "[Desktop Entry]" >> ${DIR}/Centsa.desktop
		echo "Type=Application" >> ${DIR}/Centsa.desktop
		echo "Icon=${DIR}/icon.png" >> ${DIR}/Centsa.desktop
		echo "Name=Centsa" >> ${DIR}/Centsa.desktop
		echo "Exec=bash -c \"${DIR}/install-run.sh\"" >> ${DIR}/Centsa.desktop
		echo "Categories=Office;" >> ${DIR}/Centsa.desktop
		echo "Comment=Centsa money managing solution" >> ${DIR}/Centsa.desktop
		
		cp ${DIR}/Centsa.desktop ~/.local/share/applications
		
		read -p "Do you wish to install this program for all users (y/N)? (requires root)" choice
		case "${choice}" in 
		  y|Y ) cp ${DIR}/Centsa.desktop /usr/share/applications;;
		esac
	fi

	java -cp ${DIR}/lib/*:${DIR} nohorjo.centsa.Main &
fi


